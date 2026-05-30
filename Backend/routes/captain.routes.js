const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const captainController = require("../controllers/captain.controllers");
const authMiddleware = require("../middlewares/auth.middleware");
const { uploadCaptainImage } = require("../utils/upload.utils");

// Register Route
router.post(
  "/captain-register",
  uploadCaptainImage,
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("fullname.firstname").isLength({ min: 3 })
      .withMessage("First name must be at least 3 characters long"),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
    body("vehicle.color").notEmpty().withMessage("Color is required"),
    body("vehicle.plate")
      .isLength({ min: 5 })
      .withMessage("Plate number must be at least 5 characters long"),
    body("vehicle.capacity").isNumeric().withMessage("Capacity must be a number"),
    body("vehicle.vehicleType").notEmpty().withMessage("Vehicle type is required"),
  ],
  captainController.register
);

// Login Route
router.post(
  "/captain-login",
  [
    body("email").isEmail().withMessage("Invalid email"),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
  ],
  captainController.login
);
// Profile Route
router.get("/captain-profile", authMiddleware.authCaptain, captainController.getCaptainProfile);
// Logout Route
router.post("/captain-logout", authMiddleware.authCaptain, captainController.logout);
// Forgot Password Route
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Invalid email")],
  captainController.forgotPassword
);
// Reset Password Route
router.post(
  "/reset-password/:token",
  [body("password").isLength({ min: 5 }).withMessage("Password must be at least 5 characters long")],
  captainController.resetPassword
);
//Respond to Ride Request Route
router.post(
  "/respond-ride-request",
  authMiddleware.authCaptain,
  [body("rideId").notEmpty().withMessage("rideId is required")],
  captainController.respondToRideRequest
);
// Set Captain Online Route
router.post("/set-online", authMiddleware.authCaptain, captainController.setOnline);
// Set Captain Offline Route
router.post("/set-offline", authMiddleware.authCaptain, captainController.setOffline);
// Get Captain Stats Route
router.get("/stats/:captainId", authMiddleware.authCaptain, captainController.getCaptainStats);
// Update Captain Profile Route
router.put("/update-profile", authMiddleware.authCaptain, captainController.updateCaptainProfile);

router.get("/get-ride-details/:rideId", authMiddleware.authCaptain, captainController.getRideDetails);

router.post("/google-login", captainController.googleLogin);

module.exports = router;
