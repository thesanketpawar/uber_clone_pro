const userModel = require("../models/user.model");
const captainModel = require("../models/captain.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const BlackListTokenModel = require("../models/blackListToken.model");


module.exports.authUser = async (req, res, next) => {   
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
      return next(new Error("Unauthorized"));
  }
  try {
      const blacklistedToken = await BlackListTokenModel.findOne({ token });
      if (blacklistedToken) { 
          return res.status(401).json({ message: "Unauthorized" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }
      req.user = user; 
      return next();
  } catch (error) {

      if (error.name === 'TokenExpiredError') {
          return res.status(401).json({ message: "Token expired" });
      }
      return res.status(401).json({ message: error.message });
  }
};


module.exports.authCaptain = async (req, res, next) => {
    try {
      const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  
      if (!token) {
        return res.status(401).json({ message: "Unauthorized: Token missing" });
      }
  
      const blacklistedToken = await BlackListTokenModel.findOne({ token });
      if (blacklistedToken) {
        return res.status(401).json({ message: "Unauthorized: Token blacklisted" });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decoded);
      const captain = await captainModel.findById(decoded.id);
      console.log("Captain:", captain);
  
      if (!captain) {
        return res.status(401).json({ message: "Unauthorized: Captain not found" });
      }
  
      req.captain = captain; // Attach captain to request
      next();
    } catch (error) {
      console.error("authCaptain error:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };


