// src/pages/OperatorDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { CreditCard, CheckCircle, Wrench, Activity, ListTodo, Zap, QrCode, IndianRupee, XCircle } from 'lucide-react';

// --- SUB-COMPONENT: Live Timer ---
const LiveTimer = ({ startTime }) => {
  const [elapsed, setElapsed] = useState('00:00:00');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const start = new Date(startTime || now);
      const diff = Math.floor((now - start) / 1000);
      
      const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const seconds = String(diff % 60).padStart(2, '0');
      
      setElapsed(`${hours}:${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <span className="font-mono font-bold text-[#00ff88] tracking-wider">{elapsed}</span>;
};

// --- MAIN DASHBOARD COMPONENT ---
const OperatorDashboard = () => {
  const [data, setData] = useState({ stations: [], slots: [], bookings: [], totalRevenue: 0, totalCompleted: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'hardware', 'overview'
  
  // Billing Modal State
  const [billingModal, setBillingModal] = useState({ isOpen: false, task: null, amount: '' });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/operator/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Ensure we always have arrays even if backend sends empty response
      setData({
        ...res.data,
        bookings: res.data.bookings || [],
        slots: res.data.slots || [],
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    const loadInitial = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/operator/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!ignore) {
          setData({
            ...res.data,
            bookings: res.data.bookings || [],
            slots: res.data.slots || [],
          });
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        if (!ignore) setLoading(false);
      }
    };
    loadInitial();
    return () => { ignore = true; };
  }, []);

  const handleSlotStatus = async (slotId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/operator/slots/${slotId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchData(); // Refresh UI
    } catch (err) {
      console.error('Failed to update slot:', err);
    }
  };

  const handleBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/operator/bookings/${bookingId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      fetchData(); // Refresh UI
    } catch (err) {
      console.error('Failed to update booking:', err);
    }
  };

  const handleCompleteAndBill = async () => {
    if (billingModal.task) {
      await handleBookingStatus(billingModal.task._id, 'completed');
      setBillingModal({ isOpen: false, task: null, amount: '' });
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center bg-[#0a0f1a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ff88]"></div>
      </div>
    );
  }

  // Filter out completed/cancelled bookings for the active task view
  const activeTasks = data.bookings.filter(b => b.status === 'upcoming' || b.status === 'active' || b.status === 'pending');

  return (
    <div className="h-screen overflow-y-auto p-8 bg-[#0a0f1a] text-white custom-scrollbar relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-['Orbitron'] text-[#00ff88]">Station Operations</h1>
            <p className="text-gray-400 mt-1">Manage hardware and live charging sessions.</p>
          </div>
          
          <div className="flex bg-[#111827] p-1 rounded-xl border border-gray-800">
            <button 
              onClick={() => setActiveTab('tasks')}
              className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${activeTab === 'tasks' ? 'bg-[#0a0f1a] text-[#00ff88] border border-[#00ff88]/30 shadow-[0_0_10px_rgba(0,255,136,0.1)]' : 'text-gray-400 hover:text-white'}`}
            >
              <ListTodo className="w-4 h-4" /> Live Tasks
            </button>
            <button 
              onClick={() => setActiveTab('hardware')}
              className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${activeTab === 'hardware' ? 'bg-[#0a0f1a] text-[#00d4ff] border border-[#00d4ff]/30 shadow-[0_0_10px_rgba(0,212,255,0.1)]' : 'text-gray-400 hover:text-white'}`}
            >
              <Wrench className="w-4 h-4" /> Hardware
            </button>
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${activeTab === 'overview' ? 'bg-[#0a0f1a] text-yellow-400 border border-yellow-400/30 shadow-[0_0_10px_rgba(250,204,21,0.1)]' : 'text-gray-400 hover:text-white'}`}
            >
              <Activity className="w-4 h-4" /> Revenue
            </button>
          </div>
        </div>

        {/* TAB 1: LIVE TASKS */}
        {activeTab === 'tasks' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-['Orbitron'] mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#00ff88]" /> Action Queue
            </h2>
            {activeTasks.length === 0 ? (
              <div className="bg-[#111827] border border-gray-800 rounded-2xl p-12 text-center text-gray-400">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No active cars waiting. Station is clear.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeTasks.map(task => (
                  <div key={task._id} className={`bg-[#111827] border ${task.status === 'active' ? 'border-[#00ff88]/50 shadow-[0_0_15px_rgba(0,255,136,0.1)]' : 'border-gray-800'} rounded-2xl p-6`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${task.status === 'active' ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-gray-800 text-gray-300'}`}>
                          {task.status}
                        </span>
                        <h3 className="font-bold text-lg mt-2 text-white">{task.userId?.name || 'EV Driver'}</h3>
                        <p className="text-sm text-gray-400">{task.stationId?.name} • Slot {task.slotId?.slotNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[#00ff88] font-bold text-xl">₹{task.totalCost}</p>
                        <p className="text-xs text-gray-500">Advance: ₹{task.advancePaid || 0}</p>
                      </div>
                    </div>
                    
                    {task.status === 'active' && (
                      <div className="bg-[#0a0f1a] p-3 rounded-lg border border-gray-800 mb-4 flex justify-between items-center">
                        <span className="text-sm text-gray-400 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-[#00ff88] animate-pulse" /> Live Session
                        </span>
                        <LiveTimer startTime={task.updatedAt || new Date()} />
                      </div>
                    )}

                    <div className="border-t border-gray-800 pt-4 flex gap-3">
                      {(task.status === 'upcoming' || task.status === 'pending') && (
                        <button 
                          onClick={() => handleBookingStatus(task._id, 'active')}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-[#00d4ff] text-white font-bold py-3 rounded-lg hover:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all flex justify-center items-center gap-2"
                        >
                          <Zap className="w-5 h-5" /> Start Charge
                        </button>
                      )}
                      {task.status === 'active' && (
                        <button 
                          onClick={() => setBillingModal({ isOpen: true, task: task, amount: (task.totalCost - (task.advancePaid || 0)) })}
                          className="flex-1 bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/50 hover:bg-[#00ff88]/20 font-bold py-3 rounded-lg transition-all flex justify-center items-center gap-2"
                        >
                          <XCircle className="w-5 h-5" /> Stop & Bill
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: HARDWARE CONTROL */}
        {activeTab === 'hardware' && (
          <div>
            <h2 className="text-xl font-bold font-['Orbitron'] mb-6 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-[#00d4ff]" /> Charger Fleet Control
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.slots.map(slot => (
                <div key={slot._id} className={`bg-[#111827] border ${slot.status === 'maintenance' ? 'border-red-500/50 bg-red-900/10' : 'border-gray-800'} rounded-2xl p-5 relative overflow-hidden`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold font-['Orbitron'] text-white flex items-center gap-2">
                        <Zap className={`w-6 h-6 ${slot.status === 'maintenance' ? 'text-red-500' : 'text-yellow-400'}`} />
                        Slot {slot.slotNumber}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">{slot.stationId?.name}</p>
                    </div>
                    <span className="bg-gray-800 text-gray-300 text-xs px-2 py-1 rounded border border-gray-700">
                      {slot.powerKW}kW {slot.chargerType}
                    </span>
                  </div>

                  <div className="mt-6">
                    <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Hardware Status Override</label>
                    <select 
                      value={slot.status}
                      onChange={(e) => handleSlotStatus(slot._id, e.target.value)}
                      className={`w-full bg-[#0a0f1a] border rounded-lg px-4 py-3 font-bold focus:outline-none transition-colors appearance-none ${
                        slot.status === 'available' ? 'border-[#00ff88] text-[#00ff88]' :
                        slot.status === 'maintenance' ? 'border-red-500 text-red-500' :
                        'border-gray-600 text-gray-300'
                      }`}
                    >
                      <option value="available" className="text-[#00ff88]">🟢 Available</option>
                      <option value="occupied" className="text-yellow-400">🟡 Occupied</option>
                      <option value="reserved" className="text-blue-400">🔵 Reserved</option>
                      <option value="maintenance" className="text-red-500">🔴 Maintenance (Offline)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: OVERVIEW & REVENUE */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 bg-yellow-400/10 p-4 rounded-full">
                  <CreditCard className="w-12 h-12 text-yellow-400" />
                </div>
                <p className="text-gray-400 font-semibold mb-2">Total Gross Revenue</p>
                <h3 className="text-4xl font-bold text-white">₹{data.totalRevenue}</h3>
              </div>
              <div className="bg-[#111827] border border-gray-800 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute -right-4 -top-4 bg-[#00ff88]/10 p-4 rounded-full">
                  <CheckCircle className="w-12 h-12 text-[#00ff88]" />
                </div>
                <p className="text-gray-400 font-semibold mb-2">Completed Sessions</p>
                <h3 className="text-4xl font-bold text-white">{data.totalCompleted}</h3>
              </div>
            </div>

            <div className="bg-[#111827] rounded-3xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800 bg-[#0a0f1a]/50">
                <h2 className="text-xl font-bold font-['Orbitron'] text-white">Financial Ledger (Completed)</h2>
              </div>
              <div className="p-6">
                {data.bookings.filter(b => b.status === 'completed').length === 0 ? (
                  <p className="text-gray-400 text-center">No completed bookings yet.</p>
                ) : (
                  <div className="space-y-3">
                    {data.bookings.filter(b => b.status === 'completed').map(booking => (
                      <div key={booking._id} className="bg-[#0a0f1a] border border-gray-800 rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <h4 className="font-bold text-white">{booking.stationId?.name}</h4>
                          <p className="text-sm text-gray-500">{booking.date} | {booking.startTime}</p>
                        </div>
                        <div className="text-xl font-bold text-yellow-400">
                          +₹{booking.totalCost}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BILLING MODAL OVERLAY */}
      {billingModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-gray-700 w-full max-w-md rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] p-6">
            <h2 className="text-2xl font-bold font-['Orbitron'] text-white mb-2">Final Settlement</h2>
            <p className="text-sm text-gray-400 mb-6">Stop session and collect remaining balance.</p>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-400 mb-2">Final Amount Due (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input 
                  type="number" 
                  value={billingModal.amount}
                  onChange={(e) => setBillingModal({ ...billingModal, amount: e.target.value })}
                  className="w-full bg-[#0a0f1a] border border-gray-700 rounded-xl py-3 pl-10 pr-4 text-[#00ff88] font-bold text-lg focus:outline-none focus:border-[#00ff88] transition-colors"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Calculated as: Total Cost - Advance Paid</p>
            </div>

            {billingModal.amount > 0 && (
              <div className="flex flex-col items-center bg-[#0a0f1a] p-4 rounded-xl border border-gray-800 mb-6">
                <p className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#00d4ff]"/> Scan to Pay Remaining
                </p>
                {/* 🚨 Replace 'yourupi@bank' below with your actual UPI ID for the demo 🚨 */}
                <div className="p-2 bg-white rounded-lg">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=yourupi@bank&pn=VoltPod&am=${billingModal.amount}&cu=INR`} 
                    alt="Payment QR" 
                    className="rounded"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => setBillingModal({ isOpen: false, task: null, amount: '' })}
                className="flex-1 py-3 bg-transparent border border-gray-700 hover:bg-gray-800 text-gray-300 font-bold rounded-xl transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleCompleteAndBill}
                className="flex-1 py-3 bg-[#00ff88]/10 border border-[#00ff88]/50 hover:bg-[#00ff88]/20 text-[#00ff88] font-bold rounded-xl transition-all flex justify-center items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" /> Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorDashboard;