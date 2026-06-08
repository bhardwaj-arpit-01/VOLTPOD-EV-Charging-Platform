import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Calendar, Clock, Battery, CheckCircle, Wallet, CreditCard, QrCode } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
// Removed useNavigate import since it's not being used

// Added onSuccess to the props
const BookingModal = ({ station, slot, onClose, onSuccess }) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState(60); // Changed to minutes
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const totalCost = station.pricePerUnit * slot.powerKW * (duration / 60);
  const advancePayment = totalCost * 0.30;
  const dueAtStation = totalCost - advancePayment;

  const processBookingAPI = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const [hours, minutes] = time.split(':');
      const totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + parseInt(duration);
      const endHours = Math.floor(totalMinutes / 60) % 24;
      const endMins = totalMinutes % 60;
      const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

      const bookingRes = await axios.post('http://localhost:5000/api/bookings', {
        stationId: station._id, slotId: slot._id, date, startTime: time, endTime, totalCost, paymentMethod
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (paymentMethod === 'wallet') {
        const newBalance = bookingRes.data?.walletBalance ?? (user.walletBalance - advancePayment);
        const updatedUser = { ...user, walletBalance: newBalance };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('walletUpdated'));
      }

      setSuccess(true);
      setLoading(false);

      // Trigger the slot refresh!
      if (onSuccess) onSuccess();

    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to process payment');
      setLoading(false);
    }
  };

  const handleBookClick = () => {
    if (paymentMethod === 'wallet' && user.walletBalance < advancePayment) {
      setError("Insufficient Wallet Balance for 30% advance. Please use UPI.");
      return;
    }
    if (paymentMethod === 'online') {
      setShowQR(true);
    } else {
      processBookingAPI();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-[#111827] w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#0a0f1a]/50">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            {showQR ? 'Scan to Pay Advance' : 'Secure Checkout'}
          </h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {success ? (
          <div className="p-8 flex flex-col items-center text-center">
            <CheckCircle className="w-20 h-20 text-green-500 mb-4" />
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Slot Reserved!</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">30% advance paid. Please pay the remaining ₹{dueAtStation.toFixed(2)} at the station.</p>
            <button onClick={onClose} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors">Done</button>
          </div>
        ) : showQR ? (
          <div className="p-8 flex flex-col items-center text-center">
            <QrCode className="w-12 h-12 text-indigo-500 mb-4" />
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Pay ₹{advancePayment.toFixed(2)} via UPI</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Scan the QR below with PhonePe, GPay, or Paytm to secure your booking.</p>
            
              <div className="bg-white p-4 rounded-xl border-4 border-indigo-100 dark:border-indigo-900 mb-6">
                {/* Dynamically asks for the exact 30% advance payment! Remember to change yourname@upi to your actual UPI ID */}
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=yourname@upi&pn=VoltPod&am=${advancePayment.toFixed(2)}&cu=INR`} alt="Pay UPI" className="w-48 h-48" />
            </div>

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <button onClick={processBookingAPI} disabled={loading} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl transition-colors mb-3">
                {loading ? 'Processing...' : 'I have completed the payment'}
              </button>
              <button onClick={() => setShowQR(false)} disabled={loading} className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold py-3 rounded-xl transition-colors">
                Cancel
            </button>
          </div>
        ) : (
          <div className="p-6">
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2"><Calendar className="w-4 h-4 text-indigo-500" /> Date</label>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none" />
                    </div>
                <div>
                      <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2"><Clock className="w-4 h-4 text-indigo-500" /> Time</label>
                      <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase mb-2"><Battery className="w-4 h-4 text-indigo-500" /> Duration</label>
                    <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-[#0a0f1a] border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none">
                      <option value="5">5 Minutes</option>
                      <option value="10">10 Minutes</option>
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="45">45 Minutes</option>
                      <option value="60">1 Hour</option>
                      <option value="120">2 Hours</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 tracking-wider">Payment Method</h4>
                  <div className="space-y-3">
                    <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'wallet' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" value="wallet" checked={paymentMethod === 'wallet'} onChange={() => setPaymentMethod('wallet')} className="w-4 h-4 text-indigo-600" />
                        <div className="flex items-center gap-2 text-gray-800 dark:text-white font-medium"><Wallet className="w-4 h-4 text-indigo-500" /> VoltPod Wallet</div>
                      </div>
                      <span className="text-xs font-bold text-gray-500">Bal: ₹{user?.walletBalance || 0}</span>
                    </label>

                    <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-gray-200 dark:border-gray-700'}`}>
                      <div className="flex items-center gap-3">
                        <input type="radio" value="online" checked={paymentMethod === 'online'} onChange={() => setPaymentMethod('online')} className="w-4 h-4 text-indigo-600" />
                        <div className="flex items-center gap-2 text-gray-800 dark:text-white font-medium"><CreditCard className="w-4 h-4 text-green-500" /> Custom UPI Scan</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-[#0a0f1a] rounded-xl p-4 border border-gray-200 dark:border-gray-800 mb-6">
                  <div className="flex justify-between text-sm mb-2"><span className="text-gray-600 dark:text-gray-300">Total Booking Cost</span><span className="font-semibold text-gray-800 dark:text-white">₹{totalCost.toFixed(2)}</span></div>
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-600 dark:text-gray-300">30% Advance to Pay Now</span>
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">₹{advancePayment.toFixed(2)}</span>
              </div>
            </div>

                {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

                <button onClick={handleBookClick} disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all">
                  Proceed to Pay ₹{advancePayment.toFixed(2)}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default BookingModal;