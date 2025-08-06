import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { useGeolocation } from '../hooks/useGeolocation';
import { getNearbyPlaces } from '../services/api';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Fix for default markers in react-leaflet
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.divIcon({
  html: '📍',
  className: 'custom-div-icon',
  iconSize: [30, 30],
  iconAnchor: [15, 30]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapView = () => {
  const location = useGeolocation();
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [placesLoading, setPlacesLoading] = useState(false);
  const [showAccuracyCircle, setShowAccuracyCircle] = useState(true);
  const [mapCenter, setMapCenter] = useState([51.505, -0.09]); // Default to London
  const [zoom, setZoom] = useState(13);

  useEffect(() => {
    if (location.latitude && location.longitude) {
      setMapCenter([location.latitude, location.longitude]);
      setZoom(15);
      
      // Load nearby places
      setPlacesLoading(true);
      getNearbyPlaces(location.latitude, location.longitude)
        .then(data => {
          setNearbyPlaces(data.slice(0, 10)); // Limit to 10 places
          setPlacesLoading(false);
        })
        .catch(error => {
          console.error('Error getting nearby places:', error);
          setPlacesLoading(false);
        });
    }
  }, [location.latitude, location.longitude]);

  const createPlaceIcon = (place) => {
    // Create different icons based on place type
    const getPlaceEmoji = (place) => {
      const type = place.type || place.class || '';
      const amenity = place.amenity || '';
      
      if (amenity.includes('restaurant') || amenity.includes('food')) return '🍽️';
      if (amenity.includes('hospital')) return '🏥';
      if (amenity.includes('school')) return '🏫';
      if (amenity.includes('bank')) return '🏦';
      if (amenity.includes('shop') || amenity.includes('store')) return '🏪';
      if (amenity.includes('gas') || amenity.includes('fuel')) return '⛽';
      if (type.includes('tourism')) return '🏛️';
      if (type.includes('leisure')) return '🎯';
      return '📌';
    };

    return L.divIcon({
      html: getPlaceEmoji(place),
      className: 'place-icon',
      iconSize: [25, 25],
      iconAnchor: [12, 25]
    });
  };

  if (location.loading) {
    return (
      <div className="map-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Getting your location...</p>
        </div>
      </div>
    );
  }

  if (location.error) {
    return (
      <div className="map-container">
        <div className="error">
          <h2>❌ Location Error</h2>
          <p>{location.error}</p>
          <p>Map requires location access to show your position.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="map-container">
      <h2>🗺️ Interactive Map</h2>
      
      <div className="map-controls">
        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={showAccuracyCircle}
              onChange={(e) => setShowAccuracyCircle(e.target.checked)}
            />
            Show accuracy circle
          </label>
        </div>
        
        <div className="location-info">
          <span>📍 {location.latitude?.toFixed(6)}, {location.longitude?.toFixed(6)}</span>
          <span>🎯 Accuracy: ±{location.accuracy?.toFixed(0)}m</span>
        </div>
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: '500px', width: '100%' }}
          className="leaflet-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* User location marker */}
          {location.latitude && location.longitude && (
            <>
              <Marker position={[location.latitude, location.longitude]}>
                <Popup>
                  <div className="popup-content">
                    <h3>📍 Your Location</h3>
                    <p><strong>Coordinates:</strong><br />
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</p>
                    <p><strong>Accuracy:</strong> ±{location.accuracy?.toFixed(0)} meters</p>
                  </div>
                </Popup>
              </Marker>
              
              {/* Accuracy circle */}
              {showAccuracyCircle && (
                <Circle
                  center={[location.latitude, location.longitude]}
                  radius={location.accuracy || 100}
                  pathOptions={{
                    color: '#667eea',
                    fillColor: '#667eea',
                    fillOpacity: 0.1,
                    weight: 2
                  }}
                />
              )}
            </>
          )}
          
          {/* Nearby places markers */}
          {nearbyPlaces.map((place, index) => (
            place.lat && place.lon && (
              <Marker
                key={index}
                position={[parseFloat(place.lat), parseFloat(place.lon)]}
                icon={createPlaceIcon(place)}
              >
                <Popup>
                  <div className="popup-content">
                    <h3>{place.display_name?.split(',')[0] || 'Unknown Place'}</h3>
                    <p><strong>Type:</strong> {place.type || place.class || 'Unknown'}</p>
                    {place.amenity && <p><strong>Amenity:</strong> {place.amenity}</p>}
                    <p><strong>Address:</strong><br />{place.display_name}</p>
                    <button
                      onClick={() => window.open(`https://www.google.com/maps?q=${place.lat},${place.lon}`, '_blank')}
                      className="popup-btn"
                    >
                      View on Google Maps
                    </button>
                  </div>
                </Popup>
              </Marker>
            )
          ))}
        </MapContainer>
      </div>

      <div className="map-info">
        <div className="info-section">
          <h3>🎯 Map Legend</h3>
          <div className="legend">
            <div className="legend-item">
              <span className="legend-icon">📍</span>
              <span>Your Location</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon">🍽️</span>
              <span>Restaurants</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon">🏥</span>
              <span>Hospitals</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon">🏪</span>
              <span>Shops</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon">📌</span>
              <span>Other Places</span>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h3>📊 Nearby Places</h3>
          {placesLoading ? (
            <div className="loading-small">
              <div className="spinner-small"></div>
              <p>Loading nearby places...</p>
            </div>
          ) : (
            <div className="places-list">
              {nearbyPlaces.length > 0 ? (
                nearbyPlaces.slice(0, 5).map((place, index) => (
                  <div key={index} className="place-item">
                    <span className="place-name">
                      {place.display_name?.split(',')[0] || 'Unknown Place'}
                    </span>
                    <span className="place-type">
                      {place.type || place.class || 'Unknown'}
                    </span>
                  </div>
                ))
              ) : (
                <p>No nearby places found</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
