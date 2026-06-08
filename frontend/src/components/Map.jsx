import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { LocateFixed } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

// MapController handles the Leaflet map API directly (external system)
const MapController = ({ selectedStation, userLocationData }) => {
  const map = useMap();

  // Fly to station when selected
  useEffect(() => {
    if (selectedStation) {
      map.flyTo([selectedStation.coordinates.lat, selectedStation.coordinates.lng], 15, { animate: true, duration: 1.5 });
    }
  }, [selectedStation, map]);

  // Fly to user when user clicks "Locate Me"
  useEffect(() => {
    if (userLocationData) {
      map.flyTo([userLocationData.lat, userLocationData.lng], 15, { animate: true, duration: 1.5 });
    }
  }, [userLocationData, map]);

  return null;
};

const customMarkerIcon = (color) => {
  return divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid #111827; box-shadow: 0 0 10px ${color}; display: flex; align-items: center; justify-content: center;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const userMarkerIcon = divIcon({
  className: 'custom-icon',
  html: `<div style="background-color: #00d4ff; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 15px #00d4ff;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const Map = ({ stations, selectedStation, onMarkerClick }) => {
  const defaultCenter = [23.2599, 77.4126]; // Bhopal center
  const [userLocationData, setUserLocationData] = useState(null);
  const { isDark } = useTheme();


  const locateUser = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocationData({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            timestamp: Date.now()
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location. Please check your browser's location permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  useEffect(() => {
    locateUser();
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* Set zoomControl to false here so we can place it manually using <ZoomControl /> below */}
      <MapContainer 
        center={defaultCenter} 
        zoom={12} 
        className="w-full h-full z-0" 
        zoomControl={false}
        scrollWheelZoom={true} // Allows trackpad scrolling
        wheelPxPerZoomLevel={120} // Makes scroll wheel zooming slightly smoother/less aggressive
      >
        <TileLayer
          url={`https://{s}.basemaps.cartocdn.com/${isDark ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`}
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Adds the manual +/- buttons back, placed top-right so they don't block mobile UI */}
        <ZoomControl position="topright" />
        
        <MapController 
          selectedStation={selectedStation} 
          userLocationData={userLocationData} 
        />
        
        {userLocationData && (
          <Marker position={[userLocationData.lat, userLocationData.lng]} icon={userMarkerIcon}>
            <Popup className="custom-popup">
              <div className="bg-[#111827] text-white p-2 rounded-lg border border-[#00d4ff]/30 text-center">
                <h3 className="font-bold text-[#00d4ff] text-sm mb-1">You are here</h3>
              </div>
            </Popup>
          </Marker>
        )}

        {stations.map((station) => (
          <Marker 
            key={station._id} 
            position={[station.coordinates.lat, station.coordinates.lng]}
            icon={customMarkerIcon('#00ff88')}
            eventHandlers={{
              click: () => onMarkerClick(station),
            }}
          >
            <Popup className="custom-popup">
              <div className="bg-[#111827] text-white p-2 rounded-lg border border-[#00ff88]/30">
                <h3 className="font-bold text-[#00ff88]">{station.name}</h3>
                <p className="text-sm text-gray-300">{station.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Locate Me Button positioned safely in the bottom right corner */}
      <button 
        onClick={locateUser}
        className="absolute bottom-8 right-6 z-[400] bg-[#111827] border border-[#00d4ff]/50 p-3 rounded-full shadow-[0_0_15px_rgba(0,212,255,0.3)] text-[#00d4ff] hover:bg-gray-800 transition-all group"
        title="Locate Me"
      >
        <LocateFixed className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};

export default Map;