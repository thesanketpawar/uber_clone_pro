const express = require("express");
const rideController = require("../controllers/ride.controllers");
const router = express.Router();
const { body,query,param } = require("express-validator");
const authMiddleware = require("../middlewares/auth.middleware");

router.post("/createRide",authMiddleware.authUser,
  [
    body("pickup").isString().isLength({ min: 3 }).withMessage("Invalid pickup address"),
    body("destination").isString().isLength({ min: 3 }).withMessage("Invalid destination address"),
    body('vehicleType').isString().isIn([ 'auto', 'car', 'moto' ]).withMessage('Invalid vehicle type'),
  ],
  rideController.createRide
);

router.get("/get-fare",authMiddleware.authUser,
  [
    query("pickup").isString().isLength({ min: 3 }).withMessage("Invalid pickup address"),
    query("destination").isString().isLength({ min: 3 }).withMessage("Invalid destination address"),
  ],
  rideController.getFareEstimate
);

//Assign captain to a ride
router.patch(
  "/assign-captain",
  authMiddleware.authUser,
  [
    body("rideId").notEmpty().withMessage("rideId is required"),
    body("captainId").notEmpty().withMessage("captainId is required"),
  ],
  rideController.assignCaptainToRide
);

//Start the ride (for captain)
router.patch(
  "/start",
  authMiddleware.authCaptain,
  [body("rideId").notEmpty().withMessage("rideId is required")],
  rideController.startRide
);

//Complete the ride (for captain)
router.patch(
  "/complete",
  authMiddleware.authCaptain,
  [
    body("rideId").notEmpty().withMessage("rideId is required")
  ],
  rideController.completeRide
);

//Confirm the ride (for user)
router.patch(
  "/confirm",
  authMiddleware.authUser,
  [
    body("rideId").notEmpty().withMessage("rideId is required"),
    body("captainId").notEmpty().withMessage("captainId is required")
  ],
  rideController.confirmRide
);

//Get ride details
router.get(
  "/details/:rideId",
  authMiddleware.authCaptain,
  [param("rideId").notEmpty().withMessage("rideId is required")],
  rideController.getRideDetails
);

module.exports = router;