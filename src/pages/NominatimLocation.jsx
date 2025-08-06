import { useState, useEffect } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { getAddressFromCoordinates, searchLocation } from '../services/api';
import './NominatimLocation.css';

const NominatimLocation = () => {
  const location = useGeolocation();
  const [address, setAddress] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

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

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    try {
      const results = await searchLocation(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching location:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const formatCoordinate = (coord) => {
    return parseFloat(coord).toFixed(6);
  };

  if (location.loading) {
    return (
      <div className="nominatim-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Getting your location...</p>
        </div>
      </div>
    );
  }

  if (location.error) {
    return (
      <div className="nominatim-container">
        <div className="error">
          <h2>❌ Location Error</h2>
          <p>{location.error}</p>
          <p>You can still use the location search feature below.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nominatim-container">
      <h2>🗺️ Address & Geocoding (Nominatim API)</h2>
      
      <div className="nominatim-content">
        {/* Current Location Address */}
        <div className="nominatim-card">
          <h3>📍 Your Current Address</h3>
          {addressLoading ? (
            <div className="loading-small">
              <div className="spinner-small"></div>
              <p>Loading address information...</p>
            </div>
          ) : address ? (
            <div className="address-details">
              <div className="address-main">
                <h4>🏠 Full Address</h4>
                <p className="display-name">{address.display_name}</p>
              </div>
              
              {address.address && (
                <div className="address-breakdown">
                  <h4>📋 Address Components</h4>
                  <div className="address-grid">
                    {address.address.house_number && (
                      <div className="address-item">
                        <span className="label">House Number:</span>
                        <span className="value">{address.address.house_number}</span>
                      </div>
                    )}
                    {address.address.road && (
                      <div className="address-item">
                        <span className="label">Street:</span>
                        <span className="value">{address.address.road}</span>
                      </div>
                    )}
                    {address.address.neighbourhood && (
                      <div className="address-item">
                        <span className="label">Neighbourhood:</span>
                        <span className="value">{address.address.neighbourhood}</span>
                      </div>
                    )}
                    {address.address.suburb && (
                      <div className="address-item">
                        <span className="label">Suburb:</span>
                        <span className="value">{address.address.suburb}</span>
                      </div>
                    )}
                    {address.address.city && (
                      <div className="address-item">
                        <span className="label">City:</span>
                        <span className="value">{address.address.city}</span>
                      </div>
                    )}
                    {address.address.county && (
                      <div className="address-item">
                        <span className="label">County:</span>
                        <span className="value">{address.address.county}</span>
                      </div>
                    )}
                    {address.address.state && (
                      <div className="address-item">
                        <span className="label">State/Province:</span>
                        <span className="value">{address.address.state}</span>
                      </div>
                    )}
                    {address.address.country && (
                      <div className="address-item">
                        <span className="label">Country:</span>
                        <span className="value">{address.address.country}</span>
                      </div>
                    )}
                    {address.address.postcode && (
                      <div className="address-item">
                        <span className="label">Postal Code:</span>
                        <span className="value">{address.address.postcode}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="coordinates-info">
                <h4>🌐 Coordinates</h4>
                <div className="coord-grid">
                  <div className="coord-item">
                    <span className="label">Latitude:</span>
                    <span className="value">{formatCoordinate(address.lat)}</span>
                  </div>
                  <div className="coord-item">
                    <span className="label">Longitude:</span>
                    <span className="value">{formatCoordinate(address.lon)}</span>
                  </div>
                  <div className="coord-item">
                    <span className="label">Place ID:</span>
                    <span className="value">{address.place_id}</span>
                  </div>
                  <div className="coord-item">
                    <span className="label">OSM Type:</span>
                    <span className="value">{address.osm_type}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p>Unable to load address information</p>
          )}
        </div>

        {/* Location Search */}
        <div className="nominatim-card">
          <h3>🔍 Location Search</h3>
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for any location (e.g., 'New York', 'Eiffel Tower', '123 Main St')"
                className="search-input"
              />
              <button type="submit" className="search-btn" disabled={searchLoading}>
                {searchLoading ? '🔄' : '🔍'} Search
              </button>
            </div>
          </form>

          {searchLoading && (
            <div className="loading-small">
              <div className="spinner-small"></div>
              <p>Searching locations...</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="search-results">
              <h4>📍 Search Results</h4>
              <div className="results-list">
                {searchResults.map((result, index) => (
                  <div key={index} className="result-item">
                    <div className="result-header">
                      <h5>{result.display_name.split(',')[0]}</h5>
                      <span className="result-type">{result.type || result.class}</span>
                    </div>
                    <p className="result-address">{result.display_name}</p>
                    <div className="result-coords">
                      <span>📍 {formatCoordinate(result.lat)}, {formatCoordinate(result.lon)}</span>
                      <button
                        onClick={() => window.open(`https://www.google.com/maps?q=${result.lat},${result.lon}`, '_blank')}
                        className="view-map-btn"
                      >
                        View on Map
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !searchLoading && (
            <div className="no-results">
              <p>No results found for "{searchQuery}". Try a different search term.</p>
            </div>
          )}
        </div>

        {/* API Information */}
        <div className="nominatim-card">
          <h3>ℹ️ About Nominatim API</h3>
          <div className="api-info">
            <p>
              <strong>Nominatim</strong> is a free geocoding service powered by OpenStreetMap data. 
              It provides both forward geocoding (address → coordinates) and reverse geocoding (coordinates → address).
            </p>
            <div className="features-list">
              <div className="feature-item">
                <span className="feature-icon">🔄</span>
                <span>Reverse Geocoding: Convert coordinates to human-readable addresses</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔍</span>
                <span>Forward Geocoding: Search for locations and get their coordinates</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🆓</span>
                <span>Free to use with fair usage policy</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🌍</span>
                <span>Global coverage using OpenStreetMap data</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NominatimLocation;
