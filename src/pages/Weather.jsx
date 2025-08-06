import { useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { getWeatherData } from '../services/api';
import './Weather.css';

const Weather = () => {
  const location = useGeolocation();
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(null);

  useEffect(() => {
    if (location.latitude && location.longitude) {
      setWeatherLoading(true);
      setWeatherError(null);
      
      getWeatherData(location.latitude, location.longitude)
        .then(data => {
          setWeather(data);
          setWeatherLoading(false);
        })
        .catch(error => {
          console.error('Error getting weather:', error);
          setWeatherError('Failed to load weather data');
          setWeatherLoading(false);
        });
    }
  }, [location.latitude, location.longitude]);

  const getWeatherIcon = (iconCode) => {
    // Using OpenWeatherMap icons or fallback to emojis
    const iconMap = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[iconCode] || '🌤️';
  };

  const formatTemperature = (temp) => {
    return Math.round(temp);
  };

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  if (location.loading) {
    return (
      <div className="weather-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Getting your location...</p>
        </div>
      </div>
    );
  }

  if (location.error) {
    return (
      <div className="weather-container">
        <div className="error">
          <h2>❌ Location Error</h2>
          <p>{location.error}</p>
          <p>Weather data requires location access.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="weather-container">
      <h2>🌤️ Weather Information</h2>
      
      {weatherLoading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading weather data...</p>
        </div>
      ) : weatherError ? (
        <div className="error">
          <h3>⚠️ Weather Error</h3>
          <p>{weatherError}</p>
          <p>Showing demo data instead.</p>
        </div>
      ) : null}

      {weather && (
        <div className="weather-content">
          <div className="weather-main">
            <div className="weather-header">
              <div className="weather-icon">
                {getWeatherIcon(weather.weather[0]?.icon)}
              </div>
              <div className="weather-temp">
                <span className="temp-main">{formatTemperature(weather.main.temp)}°C</span>
                <span className="temp-desc">{weather.weather[0]?.description}</span>
              </div>
              <div className="weather-location">
                <h3>{weather.name}, {weather.sys?.country}</h3>
                <p>Feels like {formatTemperature(weather.main.feels_like)}°C</p>
              </div>
            </div>
          </div>

          <div className="weather-details">
            <div className="weather-card">
              <h4>🌡️ Temperature</h4>
              <div className="detail-content">
                <p><strong>Current:</strong> {formatTemperature(weather.main.temp)}°C</p>
                <p><strong>Feels like:</strong> {formatTemperature(weather.main.feels_like)}°C</p>
                {weather.main.temp_min && (
                  <p><strong>Min:</strong> {formatTemperature(weather.main.temp_min)}°C</p>
                )}
                {weather.main.temp_max && (
                  <p><strong>Max:</strong> {formatTemperature(weather.main.temp_max)}°C</p>
                )}
              </div>
            </div>

            <div className="weather-card">
              <h4>💧 Humidity & Pressure</h4>
              <div className="detail-content">
                <p><strong>Humidity:</strong> {weather.main.humidity}%</p>
                <p><strong>Pressure:</strong> {weather.main.pressure} hPa</p>
                {weather.visibility && (
                  <p><strong>Visibility:</strong> {(weather.visibility / 1000).toFixed(1)} km</p>
                )}
              </div>
            </div>

            <div className="weather-card">
              <h4>💨 Wind</h4>
              <div className="detail-content">
                <p><strong>Speed:</strong> {weather.wind?.speed || 0} m/s</p>
                {weather.wind?.deg && (
                  <p><strong>Direction:</strong> {getWindDirection(weather.wind.deg)} ({weather.wind.deg}°)</p>
                )}
                {weather.wind?.gust && (
                  <p><strong>Gust:</strong> {weather.wind.gust} m/s</p>
                )}
              </div>
            </div>

            {weather.clouds && (
              <div className="weather-card">
                <h4>☁️ Clouds</h4>
                <div className="detail-content">
                  <p><strong>Cloudiness:</strong> {weather.clouds.all}%</p>
                </div>
              </div>
            )}
          </div>

          <div className="weather-footer">
            <p className="coordinates">
              📍 Lat: {location.latitude?.toFixed(4)}, Lon: {location.longitude?.toFixed(4)}
            </p>
            <p className="last-updated">
              🕒 Last updated: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Weather;
