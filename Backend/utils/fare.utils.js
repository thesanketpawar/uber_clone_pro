function getFare(distance, duration, vehicleType = null) {
    const baseFare = { auto: 30, car: 50, moto: 20 };
    const perKmRate = { auto: 10, car: 15, moto: 8 };
    const perMinuteRate = { auto: 2, car: 3, moto: 1.5 };
  
    // Single type fare (if vehicleType is provided)
    if (vehicleType) {
      if (!baseFare[vehicleType]) {
        throw new Error('Invalid vehicle type');
      }
  
      return Math.round(
        baseFare[vehicleType] +
        ((distance / 1000) * perKmRate[vehicleType]) +
        ((duration / 60) * perMinuteRate[vehicleType])
      );
    }
  
    // All types fare (if no vehicleType)
    return {
      auto: Math.round(baseFare.auto + ((distance / 1000) * perKmRate.auto) + ((duration / 60) * perMinuteRate.auto)),
      car: Math.round(baseFare.car + ((distance / 1000) * perKmRate.car) + ((duration / 60) * perMinuteRate.car)),
      moto: Math.round(baseFare.moto + ((distance / 1000) * perKmRate.moto) + ((duration / 60) * perMinuteRate.moto))
    };
  }
  
  module.exports = getFare;
  
  const apiKey = process.env.LOCATIONIQ_API_KEY;