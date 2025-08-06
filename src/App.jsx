import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import IPLocation from './pages/IPLocation';
import Weather from './pages/Weather';
import NominatimLocation from './pages/NominatimLocation';
import MapView from './pages/MapView';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<IPLocation />} />
            <Route path="/weather" element={<Weather />} />
            <Route path="/nominatim" element={<NominatimLocation />} />
            <Route path="/map" element={<MapView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
