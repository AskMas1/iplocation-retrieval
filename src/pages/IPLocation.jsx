import { useState, useEffect } from 'react';
import { getIPLocationData } from '../services/api';
import './IPLocation.css';

const IPLocation = () => {
  const [ipData, setIpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchIPLocation = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getIPLocationData();
        setIpData(data);
      } catch (err) {
        setError('Failed to fetch IP location data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchIPLocation();
  }, []);

  if (loading) {
    return (
      <div className="ip-location-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Getting your IP location data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ip-location-container">
        <div className="error">
          <h2>❌ Error</h2>
          <p>{error}</p>
          <p>Showing demo data instead.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ip-location-container">
      <h2>🌐 IP-Based Location (IP-API)</h2>
      
      {ipData && (
        <div className="ip-content">
          <div className="ip-cards">
            <div className="ip-card">
              <h3>📡 Network Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">IP Address:</span>
                  <span className="value">{ipData.query}</span>
                </div>
                <div className="info-item">
                  <span className="label">ISP:</span>
                  <span className="value">{ipData.isp}</span>
                </div>
                <div className="info-item">
                  <span className="label">Organization:</span>
                  <span className="value">{ipData.org}</span>
                </div>
                <div className="info-item">
                  <span className="label">AS Number:</span>
                  <span className="value">{ipData.as}</span>
                </div>
                <div className="info-item">
                  <span className="label">Status:</span>
                  <span className="value">{ipData.status}</span>
                </div>
              </div>
            </div>

            <div className="ip-card">
              <h3>📍 Geographic Location</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Country:</span>
                  <span className="value">{ipData.country}</span>
                </div>
                <div className="info-item">
                  <span className="label">Region:</span>
                  <span className="value">{ipData.regionName}</span>
                </div>
                <div className="info-item">
                  <span className="label">City:</span>
                  <span className="value">{ipData.city}</span>
                </div>
                <div className="info-item">
                  <span className="label">Postal Code:</span>
                  <span className="value">{ipData.zip}</span>
                </div>
                <div className="info-item">
                  <span className="label">Latitude:</span>
                  <span className="value">{ipData.lat}</span>
                </div>
                <div className="info-item">
                  <span className="label">Longitude:</span>
                  <span className="value">{ipData.lon}</span>
                </div>
                <div className="info-item">
                  <span className="label">Timezone:</span>
                  <span className="value">{ipData.timezone}</span>
                </div>
              </div>
            </div>

            {ipData.domains && ipData.domains.length > 0 && (
              <div className="ip-card">
                <h3>🌍 Associated Domains</h3>
                <div className="domains-list">
                  {ipData.domains.map((domain, index) => (
                    <div key={index} className="domain-item">
                      <span className="domain-icon">🔗</span>
                      <span className="domain-name">{domain}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="ip-card">
              <h3>🔧 Quick Actions</h3>
              <div className="quick-actions">
                <button 
                  onClick={() => window.open(`https://www.google.com/maps?q=${ipData.lat},${ipData.lon}`, '_blank')}
                  className="action-btn"
                >
                  📍 View Location on Map
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(ipData.query);
                    alert('IP address copied to clipboard!');
                  }}
                  className="action-btn"
                >
                  📋 Copy IP Address
                </button>
                <button 
                  onClick={() => {
                    const locationText = `${ipData.city}, ${ipData.regionName}, ${ipData.country}`;
                    navigator.clipboard.writeText(locationText);
                    alert('Location copied to clipboard!');
                  }}
                  className="action-btn"
                >
                  📍 Copy Location
                </button>
              </div>
            </div>
          </div>

          <div className="ip-summary">
            <div className="summary-card">
              <h3>📊 Location Summary</h3>
              <p className="summary-text">
                Your IP address <strong>{ipData.query}</strong> is registered to <strong>{ipData.isp}</strong> 
                and appears to be located in <strong>{ipData.city}, {ipData.regionName}, {ipData.country}</strong>.
                {ipData.timezone && (
                  <> The timezone for this location is <strong>{ipData.timezone}</strong>.</>
                )}
              </p>
              <div className="accuracy-note">
                <p><strong>Note:</strong> IP-based location is approximate and may not reflect your exact physical location. 
                It represents the location of your internet service provider's infrastructure.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IPLocation;
