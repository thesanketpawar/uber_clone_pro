
const captainModel = require("../models/captain.model");

async function getEligibleCaptainsForRide() {
  const captains = await captainModel.find({
    status: "active",
    onlineStartTime: { $ne: null }
  });
  return captains;
}

module.exports = {
  getEligibleCaptainsForRide
};
