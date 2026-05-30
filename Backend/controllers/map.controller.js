const axios = require('axios');
require('dotenv').config();
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600 });

module.exports.getAddressCoordinates = async (req, res) => {
  const address = req.query.address;
  const apiKey = process.env.LOCATIONIQ_API_KEY;

  if (!address) {
    return res.status(400).json({ error: "Address is required" });
  }

  try {
    const response = await axios.get('https://us1.locationiq.com/v1/search.php', {
      params: {
        key: apiKey,
        q: address,
        format: 'json'
      }
    });

    if (response.data && response.data.length > 0) {
      const location = response.data[0];

      return res.json({
        lat: location.lat,
        lng: location.lon,
        display_name: location.display_name
      });
    } else {
      throw new Error('Unable to fetch coordinates');
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch coordinates' });
  }
};

module.exports.getDistanceAndTime = async (req, res) => {
  const { origin, destination } = req.query;
  const apiKey = process.env.LOCATIONIQ_API_KEY;

  if (!origin || !destination) {
    return res.status(400).json({ error: "Origin and destination are required" });
  }

  try {
    const originRes = await axios.get('https://us1.locationiq.com/v1/search.php', {
      params: {
        key: apiKey,
        q: origin,
        format: 'json'
      }
    });
    const originCoords = originRes.data[0];

    const destinationRes = await axios.get('https://us1.locationiq.com/v1/search.php', {
      params: {
        key: apiKey,
        q: destination,
        format: 'json'
      }
    });
    const destinationCoords = destinationRes.data[0];

    const response = await axios.get(`https://us1.locationiq.com/v1/directions/driving/${originCoords.lon},${originCoords.lat};${destinationCoords.lon},${destinationCoords.lat}`, {
      params: {
        key: process.env.LOCATIONIQ_API_KEY,
        overview: 'false'
      }
    });

    const route = response.data.routes[0];

    return res.json({
      distance: {
        text: `${(route.distance / 1000).toFixed(1)} KM`,
        value: route.distance
      },
      duration: {
        text: `${Math.ceil(route.duration / 60)} min`,
        value: route.duration
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to fetch distance and time' });
  }
};

module.exports.autoCompleteSuggestions = async (req, res) => {
  const { input } = req.query;
  if (!input) {
    return res.status(400).json({ error: "Input is required" });
  }
  // Check if the input is cached
  const cached = cache.get(input);
  if (cached) {
    return res.json(cached); // Return cached suggestions if available
  }

  try {
    const response = await axios.get('https://us1.locationiq.com/v1/autocomplete.php', {
      params: {
        key: process.env.LOCATIONIQ_API_KEY,
        q: input,
        format: 'json',
        limit: 5
      }
    });

    if (response.data && response.data.length > 0) {
      const suggestions = response.data.map(place => ({
        display_name: place.display_name,
        lat: place.lat,
        lon: place.lon,
        type: place.type
      }));
      cache.set(input, suggestions); // Cache the result for future requests
      return res.json(suggestions);
    } else {
      return res.status(404).json({ message: 'No suggestions found' });
    }

  } catch (error) {
    console.error('Error fetching from LocationIQ:', error);
    return res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
};