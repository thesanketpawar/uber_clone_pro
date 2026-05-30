const socketIo = require("socket.io");
const userModel = require("./models/user.model");
const captainModel = require("./models/captain.model");
const rideModel = require("./models/ride.model");
const LocationIQ = require("./utils/locationiq");
let onlineCaptains = new Map();
let io;

function getIo() {
  if (!io) {
    throw new Error(
      "Socket.io not initialized. Call initializeSocket(server) first."
    );
  }
  return io;
}
async function getUserSocketId(userId) {
  const user = await userModel.findById(userId).select("socketId");
  return user?.socketId || null;
}
function initializeSocket(server) {
  io = socketIo(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    socket.on("join", async ({ userId, userType }) => {
      if (!userId || !userType) {
        console.warn(
          `Invalid join event data: userId=${userId}, userType=${userType}`
        );
        return;
      }

      if (userType === "captain") {
        await captainModel.findByIdAndUpdate(userId, {
          socketId: socket.id,
          onlineStartTime: new Date(),
        });
        onlineCaptains.set(userId, socket.id);
        console.log(`Captain joined: ${userId} (${socket.id})`);
      } else {
        await userModel.findByIdAndUpdate(userId, { socketId: socket.id });
      }
    });

    socket.on("new-ride", async (data) => {
      const { userId, pickupLocation, dropoffLocation, fare, vehicleType } =
        data;

      if (
        !userId ||
        !pickupLocation ||
        !dropoffLocation ||
        !fare ||
        !vehicleType
      ) {
        return socket.emit("invalid-ride-data", {
          message: "Missing required ride data",
        });
      }

      const allOnlineCaptains = await captainModel.find({
        onlineStartTime: { $ne: null },
        "vehicle.vehicleType": data.vehicleType,
        status: "active",
      });

      console.log(
        "Matching online captains:",
        allOnlineCaptains.map((c) => ({
          id: c._id,
          vehicleType: c.vehicle?.vehicleType,
          onlineStartTime: c.onlineStartTime,
          status: c.status,
        }))
      );

      const nearestCaptainResult = await LocationIQ.findNearest(
        data.pickupLocation,
        allOnlineCaptains
      );
      // Assuming `findNearest` returns both captain and distance
      if (nearestCaptainResult && nearestCaptainResult.captain) {
        const { captain: nearestCaptain, distance } = nearestCaptainResult;

        const captainSocketId = onlineCaptains.get(String(nearestCaptain._id));
        const user = await userModel.findById(userId);

        const ride = await rideModel.create({
          user: userId,
          pickupLocation,
          dropoffLocation,
          fare,
          distance,
          status: "searching",
        });

        io.to(captainSocketId).emit("new-ride", {
          _id: ride._id,
          pickup: ride.pickupLocation,
          destination: ride.dropoffLocation,
          fare: ride.fare,
          distance: ride.distance || 0,
          userImage: user.userImage,
          user: {
            firstname: user.firstname,
            lastname: user.lastname,
          },
        });
        console.log("Emitting new-ride event with data:", {
          _id: ride._id,
          pickup: ride.pickup,
          destination: ride.destination,
          fare: ride.fare,
          distance: ride.distance,
          user: {
            fullname: {
              firstname: user.firstname,
              lastname: user.lastname,
            },
            userImage: user.userImage,
          },
        });
      } else {
        socket.emit("no-captain-found");
      }
    });

    socket.on("accept-ride", async ({ rideId, captainId }) => {
      let ride = await rideModel.findById(rideId);
      if (!ride || ride.status !== "searching") {
        return socket.emit("ride-already-taken");
      }

      ride.captain = captainId;
      ride.status = "assigned";
      await ride.save();
      // Re-fetch the ride and populate the captain details
      ride = await rideModel
        .findById(rideId)
        .populate({
          path: "captain",
          model: "Captain",
          // Select the specific fields you need from fullname and vehicle
          select:
            "fullname.firstname fullname.lastname vehicle.vehicleType vehicle.plate",
        })
        .lean();
      // Ensure the ride object now has the populated captain
      if (!ride || !ride.captain || typeof ride.captain !== "object") {
        console.error(
          "Failed to populate captain in ride object after acceptance for rideId:",
          rideId
        );

        return;
      }
      const user = await userModel.findById(ride.user);
      if (user?.socketId) {
        io.to(user.socketId).emit("ride-confirmed", {
          rideId: ride._id,
          ride: ride,
        });
        console.log(
          `Emitting ride-confirmed to user ${user.socketId} with populated ride data.`
        );
      }
      io.to(socket.id).emit("ride-assigned", { rideId });
    });
    socket.on("complete-ride", async ({ rideId }) => {
      const ride = await rideModel.findById(rideId);
      if (ride && ride.status === "assigned") {
        ride.status = "completed";
        await ride.save();

        const distanceInKm = (ride.distance || 0) / 1000;

        await captainModel.findByIdAndUpdate(ride.captain, {
          $inc: {
            totalJobs: 1,
            earnedMoney: ride.fare,
            totalDistance: parseFloat(distanceInKm.toFixed(2)),
          },
        });
      }
    });

    socket.on("logout-captain", async ({ captainId }) => {
      const captain = await captainModel.findById(captainId);
      if (captain && captain.onlineStartTime) {
        const onlineStart = new Date(captain.onlineStartTime);
        const now = new Date();
        const diffInHours = (now - onlineStart) / (1000 * 60 * 60); // convert ms to hours

        const roundedHours = parseFloat(diffInHours.toFixed(2));

        console.log("Captain Online Duration (Hours):", roundedHours);

        await captainModel.findByIdAndUpdate(captainId, {
          onlineStartTime: null,
          $inc: { totalHoursOnline: roundedHours },
        });

        onlineCaptains.delete(String(captainId));
      } else {
        console.log("Captain not found or onlineStartTime missing");
      }
    });

    socket.on("disconnect", () => {
      console.log(`Disconnected: ${socket.id}`);
      for (const [captainId, sockId] of onlineCaptains.entries()) {
        if (sockId === socket.id) {
          onlineCaptains.delete(captainId);
          captainModel
            .findByIdAndUpdate(captainId, { onlineStartTime: null })
            .catch(console.error);
          break;
        }
      }
    });
  });
}

module.exports = {
  initializeSocket,
  getOnlineCaptains: () => onlineCaptains,
  getIo,
  getUserSocketId,
};
