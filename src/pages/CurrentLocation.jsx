import { useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { getAddressFromCoordinates } from '../services/api';
import './CurrentLocation.css';

const CurrentLocation = () => {
  const location = useGeolocation();
  const [address, setAddress] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    if (location.latitude && location.longitude) {
      setAddressLoading(true);
      getAddressFromCoordinates(location.latitude, location.longitude)
        .then(data => {
          setAddress(data);
          setAddressLoading(false);
        })
        .catch(error => {
          console.error('Error getting address:', error);
          setAddressLoading(false);
        });
    }
  }, [location.latitude, location.longitude]);

  if (location.loading) {
    return (
      <div className="location-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Getting your location...</p>
        </div>
      </div>
    );
  }

  if (location.error) {
    return (
      <div className="location-container">
        <div className="error">
          <h2>❌ Location Error</h2>
          <p>{location.error}</p>
          <p>Please enable location permissions and refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="location-container">
      <h2>📍 Your Current Location</h2>
      
      <div className="location-cards">
        <div className="location-card">
          <h3>🌐 Coordinates</h3>
          <div className="coordinate-info">
            <p><strong>Latitude:</strong> {location.latitude?.toFixed(6)}</p>
            <p><strong>Longitude:</strong> {location.longitude?.toFixed(6)}</p>
            <p><strong>Accuracy:</strong> ±{location.accuracy?.toFixed(0)} meters</p>
          </div>
        </div>

        <div className="location-card">
          <h3>🏠 Address Information</h3>
          {addressLoading ? (
            <div className="loading-small">
              <div className="spinner-small"></div>
              <p>Loading address...</p>
            </div>
          ) : address ? (
            <div className="address-info">
              <p><strong>Display Name:</strong> {address.display_name}</p>
              {address.address && (
                <>
                  {address.address.house_number && address.address.road && (
                    <p><strong>Street:</strong> {address.address.house_number} {address.address.road}</p>
                  )}
                  {address.address.city && (
                    <p><strong>City:</strong> {address.address.city}</p>
                  )}
                  {address.address.state && (
                    <p><strong>State:</strong> {address.address.state}</p>
                  )}
                  {address.address.country && (
                    <p><strong>Country:</strong> {address.address.country}</p>
                  )}
                  {address.address.postcode && (
                    <p><strong>Postal Code:</strong> {address.address.postcode}</p>
                  )}
                </>
              )}
            </div>
          ) : (
            <p>Unable to load address information</p>
          )}
        </div>

        <div className="location-card">
          <h3>🔗 Quick Actions</h3>
          <div className="quick-actions">
            <button 
              onClick={() => window.open(`https://www.google.com/maps?q=${location.latitude},${location.longitude}`, '_blank')}
              className="action-btn"
            >
              📍 View on Google Maps
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`${location.latitude}, ${location.longitude}`);
                alert('Coordinates copied to clipboard!');
              }}
              className="action-btn"
            >
              📋 Copy Coordinates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentLocation;
