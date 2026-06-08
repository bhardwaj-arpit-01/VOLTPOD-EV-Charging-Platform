import { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Calendar, Clock, MapPin, Zap, XCircle, Battery } from 'lucide-react';

const Dashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState([]);
  const [predicting, setPredicting] = useState(true);

  useEffect(() => {
    const fetchBookingsData = () => {
      const token = localStorage.getItem('token');
      axios.get('http://localhost:5000/api/bookings/my', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setBookings(res.data);
        setLoading(false);
      }).catch(error => {
        console.error('Error fetching bookings:', error);
        setLoading(false);
      });
    };

    fetchBookingsData();

    const fetchPredictions = async () => {
      try {
        const currentHour = new Date().getHours();
        const currentDay = new Date().getDay();
        const hoursToPredict = [currentHour, (currentHour + 2) % 24, (currentHour + 4) % 24];

        const mlData = await Promise.all(
          hoursToPredict.map(hr => axios.get(`http://localhost:8000/api/predict?hour=${hr}&day=${currentDay}&station_id=1`))
        );
        setPredictions(mlData.map(res => res.data));
        setPredicting(false);
      } catch (error) {
        console.error('Error fetching predictions:', error);
        setPredicting(false);
      }
    };

    fetchPredictions();

    const socket = io('http://localhost:5000');
    socket.on('slotStatusChanged', fetchBookingsData);
    return () => socket.close();
  }, []);

  const handleCancel = async (id) => {
    try {
      const token = localStorage.getItem('token');

      // 1. Cancel the booking via backend
      const cancelRes = await axios.put(`http://localhost:5000/api/bookings/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Fetch the updated bookings list
      const res = await axios.get('http://localhost:5000/api/bookings/my', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(res.data);

      // 3. THE MISSING FIX: Update Local Storage & Trigger Wallet Badge
      if (cancelRes.data.walletBalance !== undefined) {
        const currentUser = JSON.parse(localStorage.getItem('user')) || {};
        const updatedUser = { ...currentUser, walletBalance: cancelRes.data.walletBalance };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Tell the Sidebar to refresh the number instantly
        window.dispatchEvent(new Event('walletUpdated'));
      }

    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-8 bg-[#eef2f6] dark:bg-[#0a0f1a] custom-scrollbar transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Dashboard Overview</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#f8fafc] dark:bg-[#111827] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden min-h-[500px]">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Recent Bookings</h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
                ) : bookings.length === 0 ? (
                    <div className="text-center text-gray-400 p-12"><Zap className="w-12 h-12 mx-auto mb-4" /><p>No active bookings.</p></div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking._id} className="bg-gray-50 dark:bg-[#0a0f1a]/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 flex flex-col transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${booking.status === 'upcoming' || booking.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : booking.status === 'completed' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{booking.status}</span>
                              <span className="text-xs font-bold text-gray-400">Slot {booking.slotId?.slotNumber}</span>
                            </div>
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white">{booking.stationId?.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5" /> {booking.stationId?.address}</p>
                          </div>
                          <div className="flex flex-col sm:items-end justify-between">
                            <div className="text-right">
                              <p className="font-bold text-xl text-gray-800 dark:text-white">₹{booking.totalCost}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-end gap-1 mt-1"><Calendar className="w-3.5 h-3.5" /> {booking.date}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-end gap-1"><Clock className="w-3.5 h-3.5" /> {booking.startTime} - {booking.endTime}</p>
                            </div>
                            {(booking.status === 'upcoming' || booking.status === 'active') && (
                              <button onClick={() => handleCancel(booking._id)} className="mt-4 sm:mt-0 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2"><XCircle className="w-4 h-4" /> Cancel Slot</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-[#f8fafc] dark:bg-[#111827] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 transition-colors duration-300">
              <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-6 uppercase tracking-widest">Live AI Insights</h3>
              <div className="space-y-6">
                <div className="flex gap-4"><div className="mt-1"><Zap className="w-5 h-5 text-yellow-500" /></div><div><p className="font-bold text-sm text-gray-800 dark:text-white">Best station right now</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">MP Nagar Hub • 2 free slots • ₹18/kWh</p></div></div>
                <div className="flex gap-4"><div className="mt-1"><Clock className="w-5 h-5 text-indigo-500" /></div><div><p className="font-bold text-sm text-gray-800 dark:text-white">Best time to charge today</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">2:00–4:00 PM — lowest predicted wait</p></div></div>
                <div className="flex gap-4"><div className="mt-1"><Battery className="w-5 h-5 text-green-500" /></div><div><p className="font-bold text-sm text-gray-800 dark:text-white">Vs petrol this week</p><p className="text-xs text-gray-500 dark:text-gray-400 mt-1">You saved ~₹640 by charging EV</p></div></div>
              </div>
            </div>

            <div className="bg-[#f8fafc] dark:bg-[#111827] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 transition-colors duration-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">AI Wait Time Forecast</h3>
                <span className="flex items-center gap-1 text-[10px] bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 px-2 py-1 rounded font-bold uppercase">Random Forest ML</span>
              </div>
              {predicting ? (
                <div className="flex justify-center p-6"><div className="animate-spin w-6 h-6 border-2 border-indigo-600 rounded-full border-t-transparent"></div></div>
              ) : predictions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">ML Model Offline. Start Python server.</p>
              ) : (
                <div className="space-y-5">
                  {predictions.map((pred, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300 font-medium w-16">{idx === 0 ? 'Now' : `${pred.hour}:00`}</span>
                      <div className="flex-1 h-2 mx-4 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden flex">
                        <div className={`h-full rounded-full transition-all duration-1000 ${pred.color === 'green' ? 'bg-green-500' : pred.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${pred.busyness_percentage}%` }}></div>
                      </div>
                      <span className={`font-bold text-xs w-10 text-right ${pred.color === 'green' ? 'text-green-500' : pred.color === 'yellow' ? 'text-yellow-500' : 'text-red-500'}`}>{pred.status}</span>
                     </div>
                   ))}
                    </div>
              )}
              <p className="text-[10px] text-gray-400 mt-6 text-center">Live Scikit-Learn Regression - MP Nagar Hub</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;