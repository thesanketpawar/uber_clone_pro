const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const mapController = require("../controllers/map.controller");

router.get(
  "/get-address",
  [
    query("address").isString().isLength({ min: 3 }),
  ],
  mapController.getAddressCoordinates
);
router.get(
  "/get-distance-time",
  [
    query("origin").isString().isLength({ min: 3 }),
    query("destination").isString().isLength({ min: 3 }),
  ],
  mapController.getDistanceAndTime
);

router.get("/get-suggestions",
  [
    query("input").isString().isLength({ min: 3 }),
  ],
  mapController.autoCompleteSuggestions
); 
module.exports = router;


