const captainModel = require("../models/captain.model");
const { validationResult } = require("express-validator");
const BlackListTokenModel = require("../models/blackListToken.model");
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const rideModel = require('../models/ride.model'); 
const axios = require("axios");
const jwt = require("jsonwebtoken");

module.exports.register = async (req, res) => {
  try {
    // Validation Errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Parse body
    const { fullname, email, password, vehicle } = req.body;
    const { color, plate, capacity, vehicleType } = vehicle || {};

    // Basic validation for required fields
    if (
      !fullname?.firstname ||
      !fullname?.lastname ||
      !email ||
      !password ||
      !color ||
      !plate ||
      !capacity ||
      !vehicleType
    ) {
      throw new Error("All fields are required");
    }

    // Check for existing user
    const existingUser = await captainModel.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await captainModel.hashPassword(password);

    // Handle image file
    const imageFile = req.files?.find((file) => file.fieldname === "captainImage");
    const captainImage = imageFile ? "captain/" + imageFile.filename : null;

    // Create new captain
    const user = await captainModel.create({
      fullname: {
        firstname: fullname.firstname,
        lastname: fullname.lastname,
      },
      email,
      password: hashedPassword,
      stringPassword: password,
      status: "active",
      vehicle: {
        color,
        plate,
        capacity,
        vehicleType,
      },
      ...(captainImage && { captainImage }) // Add image only if it exists
    });

    // Generate auth token
    const token = user.generateToken();
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports.register = async (req, res) => {
  try {
  
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    // Manually construct nested objects from dot-notated keys
    const fullname = {
      firstname: req.body['fullname.firstname'],
      lastname: req.body['fullname.lastname'],
    };

    const vehicle = {
      color: req.body['vehicle.color'],
      plate: req.body['vehicle.plate'],
      capacity: req.body['vehicle.capacity'],
      vehicleType: req.body['vehicle.vehicleType'],
    };

    const email = req.body.email;
    const password = req.body.password;

    if (
      !fullname.firstname || !fullname.lastname ||
      !email || !password ||
      !vehicle.color || !vehicle.plate || !vehicle.capacity || !vehicle.vehicleType
    ) {
      throw new Error("All fields are required");
    }

    const existingUser = await captainModel.findOne({ email });
    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await captainModel.hashPassword(password);

    const imageFile = req.files?.find((file) => file.fieldname === "captainImage");
    const captainImage = imageFile ? "captain/" + imageFile.filename : null;

    const user = await captainModel.create({
      fullname,
      email,
      password: hashedPassword,
      status: "active",
      vehicle,
    });

    if (captainImage) {
      user.captainImage = captainImage;
      await user.save();
    }

    const token = user.generateToken();
    res.status(201).json({ token, captain: user });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }   
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const captain = await captainModel.findOne({ email }).select("+password");
        if (!captain) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const isValid = await captain.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({ error: "Invalid email or password" });
        }
        const token = captain.generateToken();
        captain.password = undefined;

        res.status(200).json({
            message: "Login successful",
            token,
            captain,
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


module.exports.getCaptainProfile = async (req, res) => {
  try {
    if (!req.captain || !req.captain._id) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    const captain = await captainModel.findById(req.captain._id).select("-password");
    if (!captain) {
      return res.status(404).json({ message: "Captain not found" });
    }

    return res.status(200).json({ captain });
  } catch (error) {
    console.error("Error in getCaptainProfile:", error);
    return res.status(500).json({ error: "Failed to get captain profile" });
  }
};

module.exports.logout = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
        if (!token) 
            throw new Error("Unauthorized");

        await BlackListTokenModel.create({ token });
        res.clearCookie("token")
            .status(200)
            .json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
module.exports.forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      const captain = await captainModel.findOne({ email });
      if (!captain) throw new Error('Captain not found');
  
      const resetToken = captain.createPasswordResetToken();
      await captain.save({ validateBeforeSave: false });
  
      const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
  
      const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST,
        port: process.env.MAILTRAP_PORT,
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASS
        }
      });
  
      await transporter.sendMail({
        from: '"Uber Support" <support@uber.com>',
        to: email,
        subject: 'Captain Password Reset',
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 10 minutes.</p>`
      });
  
      res.status(200).json({ message: 'Password reset email sent to captain',
        resetToken:resetToken
       });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  module.exports.resetPassword = async (req, res) => {
    try {
      const { token } = req.params;
      const { password } = req.body;
  
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  
      const captain = await captainModel.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
      });

      if (!captain) {
        return res.status(400).json({ error: 'Token is invalid or has expired' });
      }
  
      captain.password = password;
      captain.resetPasswordToken = undefined;
      captain.resetPasswordExpires = undefined;
  
      await captain.save();
  
      res.status(200).json({ message: 'Captain password reset successful' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  
  
//Set Captain Online
exports.setOnline = async (req, res) => {
    const { captainId } = req.body;
  
    try {
      const captain = await captainModel.findById(captainId);
      if (!captain) {
        return res.status(404).json({ error: 'Captain not found' });
      }
      
      captain.status = "active";
      captain.onlineStartTime = new Date();
      await captain.save();
  
      res.json({ message: "Captain is now online" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to set captain online' });
    }
  };
  
  //Set Captain Offline
  exports.setOffline = async (req, res) => {
    const { captainId } = req.body;
  
    try {
      const captain = await captainModel.findById(captainId);
      if (!captain || !captain.onlineStartTime) {
        return res.status(404).json({ error: 'Captain not found or was not online' });
      }
  
      const now = new Date();
      const onlineDurationInHours = (now - captain.onlineStartTime) / (1000 * 60 * 60); // convert ms to hours
  
      captain.totalHoursOnline = (captain.totalHoursOnline || 0) + onlineDurationInHours;
      captain.onlineStartTime = null;
      captain.status = "inactive";
  
      await captain.save();
  
      res.json({ message: "Captain is now offline", totalHoursOnline: captain.totalHoursOnline });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to set captain offline' });
    }
  };
  
  //Get Captain Stats (Total Distance, Total Jobs, Total Earned, etc.)
  exports.getCaptainStats = async (req, res) => {
    const { captainId } = req.params;
  
    try {
      const captain = await captainModel.findById(captainId);
      if (!captain) {
        return res.status(404).json({ error: 'Captain not found' });
      }
  
      const completedRides = await rideModel.find({ captainId, status: 'completed' });
  
      const totalDistance = completedRides.reduce((acc, ride) => acc + ride.distance.value, 0);
      const totalJobs = completedRides.length;
      const totalEarned = completedRides.reduce((acc, ride) => acc + ride.fare, 0); 
      res.json({
        captain: {
          fullname: captain.fullname,
          vehicleType: captain.vehicle.vehicleType,
          totalDistance,
          totalJobs,
          totalEarned,
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to get captain stats' });
    }
  };
  
  //Update Captain Profile (e.g., Update Name, Vehicle Details, etc.)
  exports.updateCaptainProfile = async (req, res) => {
    const { captainId, profileData } = req.body;
  
    try {
      const captain = await captainModel.findById(captainId);
      if (!captain) {
        return res.status(404).json({ error: 'Captain not found' });
      }
      // Update captain's profile with new data (e.g., vehicle, name, etc.)
      captain.fullname = profileData.fullname || captain.fullname;
      captain.vehicle = profileData.vehicle || captain.vehicle;
      captain.email = profileData.email || captain.email;
  
      await captain.save();
  
      res.json({ message: 'Captain profile updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update captain profile' });
    }
  };
  
  // POST /rides/respond
module.exports.respondToRideRequest = async (req, res) => {
  const { rideId, captainId, accepted } = req.body;

  try {
      const ride = await rideModel.findById(rideId);
      if (!ride || String(ride.captain) !== String(captainId)) {
          return res.status(404).json({ message: "Ride not found or not assigned to this captain" });
      }
      if (!accepted) {
          // Captain rejected the ride: update status or reassign if needed
          ride.status = 'rejected';
          ride.captain = null;
          await ride.save();
          return res.status(200).json({ message: "Ride rejected" });
      }
      ride.status = 'accepted';
      await ride.save();

      return res.status(200).json({ message: "Ride accepted", ride });
  } catch (error) {
      console.error(error.message);
      return res.status(500).json({ error: 'Failed to respond to ride request' });
  }
};

module.exports.getRideDetails = async (req, res) => {
  const { rideId } = req.params;

  try {
    const ride = await rideModel.findById(rideId)
      .select("otp captain user pickup drop fare distance duration status createdAt") // include otp and other useful fields
      .populate({
        path: 'captain',
        select: 'fullname vehicle captainImage'
      })
      .populate({
        path: 'user',
        select: 'fullname'
      });

    if (!ride) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    res.status(200).json({ ride });
  } catch (error) {
    console.error('Error fetching ride:', error);
    res.status(500).json({ error: 'Failed to fetch ride details' });
  }
};

  
exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const googleRes = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );

    const { email, name, picture } = googleRes.data;

    if (!email || !name) {
      return res.status(400).json({ message: "Incomplete Google account information" });
    }

    let captain = await captainModel.findOne({ email });

    if (!captain) {
      const [firstname, lastname] = name.split(" ");

      captain = await captainModel.create({
        fullname: {
          firstname: firstname || "Captain",
          lastname: lastname || "Google"
        },
        email,
        password: crypto.randomBytes(16).toString("hex"), 
        captainImage: picture || null,
        status: "active",
        vehicle: {
          color: "",
          plate: "",
          capacity: 0,
          vehicleType: ""
        }
      });
    }

    const jwtToken = jwt.sign({ id: captain._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      captain,
      token: jwtToken,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "Invalid Google token" });
  }
};


  
  