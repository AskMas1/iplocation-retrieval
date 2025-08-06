import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <h1 className="nav-title">📍 Location App</h1>
        <ul className="nav-links">
          <li>
            <Link 
              to="/" 
              className={location.pathname === '/' ? 'active' : ''}
            >
              IP Location
            </Link>
          </li>
          {/* <li>
            <Link 
              to="/weather" 
              className={location.pathname === '/weather' ? 'active' : ''}
            >
              Weather
            </Link>
          </li> */}
          <li>
            <Link 
              to="/nominatim" 
              className={location.pathname === '/nominatim' ? 'active' : ''}
            >
              Geocoding
            </Link>
          </li>
          {/* <li>
            <Link 
              to="/map" 
              className={location.pathname === '/map' ? 'active' : ''}
            >
              Map View
            </Link>
          </li> */}
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;
