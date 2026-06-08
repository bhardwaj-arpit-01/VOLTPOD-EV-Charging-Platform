import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Zap, CheckCircle, CreditCard } from 'lucide-react';

const Admin = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('http://localhost:5000/api/bookings', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setBookings(res.data);
      setLoading(false);
    })
    .catch(error => {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    });
  }, []);

  const revenue = bookings.reduce((acc, curr) => acc + curr.totalCost, 0);
  const activeBookings = bookings.filter(b => b.status === 'upcoming' || b.status === 'active').length;

  const revenueData = bookings.reduce((acc, curr) => {
    const date = curr.date;
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.revenue += curr.totalCost;
    } else {
      acc.push({ date, revenue: curr.totalCost });
    }
    return acc;
  }, []).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7);

  const stationData = bookings.reduce((acc, curr) => {
    if (!curr.stationId) return acc;
    const name = curr.stationId.name;
    const existing = acc.find(item => item.name === name);
    if (existing) {
      existing.bookings += 1;
    } else {
      acc.push({ name, bookings: 1 });
    }
    return acc;
  }, []).sort((a, b) => b.bookings - a.bookings).slice(0, 5);

  return (
    <div className="h-full overflow-y-auto p-8 bg-[#f4f5f8] custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Admin Overview</h1>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <>
            {/* Top Stat Cards updated to VoltPod Light Theme */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-3xl relative overflow-hidden transition-all hover:shadow-md">
                <div className="absolute -right-4 -top-4 bg-indigo-50 p-4 rounded-full">
                  <CreditCard className="w-12 h-12 text-indigo-500" />
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Total Revenue</p>
                <h3 className="text-3xl font-bold text-gray-800">₹{revenue}</h3>
              </div>
              <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-3xl relative overflow-hidden transition-all hover:shadow-md">
                <div className="absolute -right-4 -top-4 bg-green-50 p-4 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Total Bookings</p>
                <h3 className="text-3xl font-bold text-gray-800">{bookings.length}</h3>
              </div>
              <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-3xl relative overflow-hidden transition-all hover:shadow-md">
                <div className="absolute -right-4 -top-4 bg-yellow-50 p-4 rounded-full">
                  <Zap className="w-12 h-12 text-yellow-500" />
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Active Sessions</p>
                <h3 className="text-3xl font-bold text-gray-800">{activeBookings}</h3>
              </div>
              <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-3xl relative overflow-hidden transition-all hover:shadow-md">
                <div className="absolute -right-4 -top-4 bg-purple-50 p-4 rounded-full">
                  <Users className="w-12 h-12 text-purple-500" />
                </div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Busiest Station</p>
                <h3 className="text-xl font-bold text-gray-800 truncate pr-12">{stationData[0]?.name || 'N/A'}</h3>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-3xl">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Revenue (Last 7 Days)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#f3f4f6', borderRadius: '12px', color: '#1f2937', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} dot={{ fill: '#4f46e5', strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white border border-gray-100 shadow-sm p-6 rounded-3xl">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6">Top Stations by Bookings</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stationData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={true} vertical={false} />
                      <XAxis type="number" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis dataKey="name" type="category" stroke="#6b7280" width={150} tick={{fontSize: 12}} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#f3f4f6', borderRadius: '12px', color: '#1f2937', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} cursor={{fill: '#f9fafb'}} />
                      <Bar dataKey="bookings" fill="#06b6d4" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Ledger Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">All Bookings Master Ledger</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-semibold text-xs tracking-wider border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Station</th>
                      <th className="px-6 py-4">Date & Time</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map(booking => (
                      <tr key={booking._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-800">{booking.userId?.name || 'Unknown'}</div>
                          <div className="text-gray-500 text-xs">{booking.userId?.email || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-600">{booking.stationId?.name || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-800">{booking.date}</div>
                          <div className="text-gray-500 text-xs">{booking.startTime}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-800 font-bold">₹{booking.totalCost}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                            booking.status === 'upcoming' || booking.status === 'active' ? 'bg-green-100 text-green-700' :
                            booking.status === 'completed' ? 'bg-indigo-100 text-indigo-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;