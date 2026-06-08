import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import Map from '../components/Map';
import StationSidebar from '../components/StationSidebar';

const Home = () => {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Removed the unused socket state to fix the cascading render error

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/stations');
        setStations(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching stations:', error);
        setLoading(false);
      }
    };

    fetchStations();

    // Initialize the socket as a local variable inside the effect
    const newSocket = io('http://localhost:5000');

    // The cleanup function captures newSocket in its closure and safely disconnects it
    return () => newSocket.close();
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden relative text-gray-900 dark:text-white">
      <StationSidebar 
        stations={stations} 
        loading={loading} 
        onSelect={setSelectedStation}
        selectedStation={selectedStation}
      />
      <div className="flex-1 h-full w-full relative z-0">
        <Map 
          stations={stations} 
          selectedStation={selectedStation} 
          onMarkerClick={setSelectedStation} 
        />
      </div>
    </div>
  );
};

export default Home;