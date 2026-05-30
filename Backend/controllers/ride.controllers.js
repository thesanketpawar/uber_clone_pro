const axios = require("axios");
require("dotenv").config();
const crypto = require("crypto");
const rideModel = require("../models/ride.model");
const captainModel = require("../models/captain.model");
const userModel = require("../models/user.model");
const getFare = require("../utils/fare.utils");
const { validationResult } = require("express-validator");
const { getOnlineCaptains, sendMessageToSocketId } = require("../socket");
const { getIo, getUserSocketId } = require("../socket");
const { getEligibleCaptainsForRide } = require("../utils/getcaptain");

const apiKey = process.env.LOCATIONIQ_API_KEY;

function getOtp(num) {
  return crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
}

async function resolveCoordinates(location) {
  const res = await axios.get("https://us1.locationiq.com/v1/search.php", {
    params: { key: apiKey, q: location, format: "json" },
  });
  return res.data[0];
}

async function getRoute(pickupCoords, destinationCoords) {
  const directionsRes = await axios.get(
    `https://us1.locationiq.com/v1/directions/driving/${pickupCoords.lon},${pickupCoords.lat};${destinationCoords.lon},${destinationCoords.lat}`,
    { params: { key: apiKey, overview: "false" } }
  );
  return directionsRes.data.routes[0];
}

//Create a Ride
module.exports.createRide = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const io = getIo();
  const { pickup, destination, vehicleType, userId } = req.body;

  try {
    // Get coordinates and route
    const pickupCoords = await resolveCoordinates(pickup);
    const destinationCoords = await resolveCoordinates(destination);
    const route = await getRoute(pickupCoords, destinationCoords);

    // Calculate distance, duration, fare
    const distance = {
      text: `${(route.distance / 1000).toFixed(1)} km`,
      value: route.distance,
    };
    const duration = {
      text: `${Math.round(route.duration / 60)} min`,
      value: route.duration,
    };
    const fare = getFare(distance.value, duration.value, vehicleType);
    const otp = getOtp(6);
    // Get online captains from memory
    const onlineCaptains = getOnlineCaptains();
    //Get eligible captains from DB (only active & with onlineStartTime)
    let eligibleCaptains = await getEligibleCaptainsForRide();
    //Filter eligible captains by socket presence and vehicle type
    eligibleCaptains = eligibleCaptains.filter(
      (captain) =>
        onlineCaptains.has(String(captain._id)) &&
        captain.vehicle?.vehicleType?.toLowerCase() ===
          vehicleType.toLowerCase()
    );
    console.log("Eligible Captains:", eligibleCaptains);
    console.log("Online captains (Map):", onlineCaptains);
    console.log("Eligible captains from DB:", eligibleCaptains);
    console.log("Vehicle Type Requested:", vehicleType);

    if (eligibleCaptains.length === 0) {
      return res.status(400).json({ error: "No available captains online" });
    }

    // Select one eligible captain (e.g., random — or use nearest logic later)
    const selectedCaptain =
      eligibleCaptains[Math.floor(Math.random() * eligibleCaptains.length)];

    const user = await userModel
      .findById(userId || (req.user && req.user._id))
      .lean();

    //Create the ride
    const ride = new rideModel({
      user: userId || (req.user && req.user._id) || null,
      pickup,
      destination,
      vehicleType,
      distance: distance.value,
      duration: duration.value,
      fare,
      otp,
      captain: selectedCaptain._id,
      status: "searching",
    });

    await ride.save();
    //Emit ride popup to selected captain via socket
    const socketId = onlineCaptains.get(String(selectedCaptain._id));
    if (socketId) {
      io.to(socketId).emit("new-ride", {
        rideId: ride._id,
        pickup,
        destination,
        fare,
        distance: (ride.distance / 1000).toFixed(1), // km value
        otp,
        user: {
          firstname: user?.fullname?.firstname,
          lastname: user?.fullname?.lastname,
        },
        userImage: user?.userImage,
      });
    }

    //Respond with ride info
    return res.status(201).json({
      rideId: ride._id,
      userId: userId || (req.user && req.user._id) || null,
      pickup,
      destination,
      vehicleType,
      distance,
      duration,
      fare,
      otp,
      captain: {
        _id: selectedCaptain._id,
        name: selectedCaptain.fullname,
        vehicle: selectedCaptain.vehicle,
      },
    });
  } catch (error) {
    console.error("Create Ride Error:", error.message);
    return res.status(500).json({ error: "Failed to create ride" });
  }
};

module.exports.getFareEstimate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { pickup, destination } = req.query;

  try {
    // Resolve coordinates for pickup and destination
    const pickupCoords = await resolveCoordinates(pickup);
    const destinationCoords = await resolveCoordinates(destination);

    // Get route details (distance and duration)
    const route = await getRoute(pickupCoords, destinationCoords);

    const distance = {
      text: `${(route.distance / 1000).toFixed(1)} km`,
      value: route.distance,
    };

    const duration = {
      text: `${Math.round(route.duration / 60)} hrs`,
      value: route.duration,
    };

    // Simulated adjustments for duration based on vehicle type
    const durations = {
      car: duration.value,
      auto: duration.value * 1.1,
      moto: duration.value * 0.85,
    };

    // Fare calculation based on vehicle type and distance (simulated)
    const calculateFare = (distance, vehicleType) => {
      const fareRates = {
        car: 17,
        auto: 12,
        moto: 9,
      };
      return Math.round((distance / 1000) * fareRates[vehicleType]);
    };

    // Calculate fare for each vehicle type
    const fares = {
      car: calculateFare(distance.value, "car"),
      auto: calculateFare(distance.value, "auto"),
      moto: calculateFare(distance.value, "moto"),
    };

    // Format response based on vehicle types
    const response = {
      auto: {
        distance,
        duration: {
          text: `${(durations.auto / 60).toFixed(1)} mins`,
          value: durations.auto,
        },
        fare: fares.auto,
      },
      car: {
        distance,
        duration: {
          text: `${(durations.car / 60).toFixed(1)} mins`,
          value: durations.car,
        },
        fare: fares.car,
      },
      moto: {
        distance,
        duration: {
          text: `${(durations.moto / 60).toFixed(1)} mins`,
          value: durations.moto,
        },
        fare: fares.moto,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to fetch fare estimate" });
  }
};
//Assign Captain To Ride
module.exports.assignCaptainToRide = async (req, res) => {
  const { rideId, captainId } = req.body;

  try {
    const ride = await rideModel.findById(rideId);
    const captain = await captainModel.findById(captainId);

    if (!ride || !captain) {
      return res.status(404).json({ message: "Ride or Captain not found" });
    }
    // Check if captain is available
    if (captain.status !== "active") {
      return res.status(400).json({ message: "Captain is not available" });
    }
    // Assign captain to the ride
    ride.captain = captain._id;
    ride.status = "assigned";
    await ride.save();

    return res
      .status(200)
      .json({ message: "Captain successfully assigned to the ride", ride });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to assign captain to ride" });
  }
};

//Start Ride
module.exports.startRide = async (req, res) => {
  const { rideId, otp } = req.body;
  try {
    const ride = await rideModel.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }
    // Optionally check OTP here
    ride.status = "ongoing";
    ride.startTime = new Date();
    await ride.save();
    return res.status(200).json({ message: "Ride has started", ride });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to start the ride" });
  }
};

//Complete Ride
module.exports.completeRide = async (req, res) => {
  const { rideId } = req.body;
  const captain = req.captain;

  try {
    const ride = await rideModel.findById(rideId);

    if (ride.status !== "ongoing") {
      return res.status(400).json({ message: "Invalid or incomplete ride" });
    }
    if (!ride.captain.equals(captain._id)) {
      return res
        .status(403)
        .json({ message: "Unauthorized: This ride is not assigned to you" });
    }
    ride.status = "completed";
    await ride.save();

    captain.totalJobs = (captain.totalJobs || 0) + 1;
    captain.earnedMoney = (captain.earnedMoney || 0) + ride.fare;
    captain.totalDistance =
      (captain.totalDistance || 0) + Number((ride.distance / 1000).toFixed(2));
    await captain.save();

    return res.status(200).json({ message: "Ride completed", ride });
  } catch (error) {
    console.error("Error completing ride:", error);
    res.status(500).json({ error: "Failed to complete ride" });
  }
};

//confirm ride
module.exports.confirmRide = async (req, res) => {
  try {
    const { rideId, captainId } = req.body;
    const io = getIo();

    const ride = await rideModel.findById(rideId);
    if (!ride) {
      console.error("Ride not found in DB for id:", rideId);
      return res.status(404).json({ message: "Ride not found" });
    }
    // Confirm the ride
    const updatedRide = await rideModel
      .findByIdAndUpdate(
        rideId,
        { status: "confirmed", captain: captainId },
        { new: true }
      )
      .populate("user", "firstname lastname userImage")
      .populate("captain", "fullname firstname lastname captainImage");

    const userSocketId = await getUserSocketId(updatedRide.user._id);
    console.log("Emitting ride-confirmed event to user:", userSocketId);
    if (userSocketId) {
      io.to(userSocketId).emit("ride-confirmed", {
        rideId: updatedRide._id,
        pickup: updatedRide.pickup,
        destination: updatedRide.destination,
        fare: updatedRide.fare,
      });
    }

    res.status(200).json({
      message: "Ride confirmed",
      ride: updatedRide,
    });
  } catch (error) {
    console.error("Error confirming ride:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
//Get Ride Details
module.exports.getRideDetails = async (req, res) => {
  const { rideId } = req.params;
  try {
    const ride = await rideModel
      .findById(rideId)
      .populate("captain", "fullname email status");

    if (!ride) {
      return res.status(404).json({ message: "Ride not found" });
    }

    return res.status(200).json({ ride });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: "Failed to fetch ride details" });
  }
};
