import axios from 'axios';

// IP-API for IP-based geolocation (free, no API key required)
const IP_API_BASE_URL = 'http://ip-api.com/json';

// OpenWeatherMap API (free tier - requires API key)
// You can get a free API key from: https://openweathermap.org/api
const WEATHER_API_KEY = 'demo_key'; // Replace with your actual API key
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// Nominatim API for reverse geocoding (free, no API key required)
const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Get location data from IP using IP-API
export const getIPLocationData = async () => {
  try {
    const response = await axios.get(IP_API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching IP location data:', error);
    // Return mock data for demo purposes
    return {
      query: '8.8.8.8',
      status: 'success',
      country: 'United States',
      countryCode: 'US',
      region: 'CA',
      regionName: 'California',
      city: 'Mountain View',
      zip: '94035',
      lat: 37.386,
      lon: -122.0838,
      timezone: 'America/Los_Angeles',
      isp: 'Google LLC',
      org: 'Google Public DNS',
      as: 'AS15169 Google LLC'
    };
  }
};

// Get weather data for coordinates using OpenWeatherMap API
export const getWeatherData = async (lat, lon) => {
  try {
    const response = await axios.get(`${WEATHER_BASE_URL}/weather`, {
      params: {
        lat,
        lon,
        appid: WEATHER_API_KEY,
        units: 'metric'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Return mock data for demo purposes when API key is not valid
    return {
      name: 'Demo Location',
      main: {
        temp: 22,
        feels_like: 24,
        humidity: 65,
        pressure: 1013
      },
      weather: [{
        main: 'Clear',
        description: 'clear sky',
        icon: '01d'
      }],
      wind: {
        speed: 3.5
      },
      sys: {
        country: 'XX'
      }
    };
  }
};

// Get address from coordinates using Nominatim API
export const getAddressFromCoordinates = async (lat, lon) => {
  try {
    const response = await axios.get(`${NOMINATIM_BASE_URL}/reverse`, {
      params: {
        lat,
        lon,
        format: 'json',
        addressdetails: 1
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching address:', error);
    throw error;
  }
};

// Get nearby places using Nominatim API
export const getNearbyPlaces = async (lat, lon, radius = 1000) => {
  try {
    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params: {
        lat,
        lon,
        format: 'json',
        limit: 10,
        addressdetails: 1,
        extratags: 1
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching nearby places:', error);
    throw error;
  }
};

// Get location search results using Nominatim API
export const searchLocation = async (query) => {
  try {
    const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
      params: {
        q: query,
        format: 'json',
        limit: 5,
        addressdetails: 1
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching location:', error);
    throw error;
  }
};
