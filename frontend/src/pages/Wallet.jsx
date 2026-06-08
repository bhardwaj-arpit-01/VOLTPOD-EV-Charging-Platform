import { useState } from 'react';
import axios from 'axios';
import { Wallet as WalletIcon, Building, ArrowDownToLine, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

const Wallet = () => {
  // ANTI-CRASH FIX: Added || {} so it never breaks if a user isn't fully loaded
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const handleConnectBank = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/auth/wallet/connect', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedUser = { ...user, bankConnected: res.data.bankConnected };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMsg({ text: res.data.bankConnected ? 'Bank Account Connected Successfully!' : 'Bank Account Disconnected.', type: 'success' });
    } catch (err) {
      console.error('Error connecting bank:', err);
      setMsg({ text: 'Failed to update bank connection.', type: 'error' });
    }
    setLoading(false);
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const handleRedeem = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/auth/wallet/redeem', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const updatedUser = { ...user, walletBalance: res.data.walletBalance };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event('walletUpdated')); 
      
      setMsg({ text: res.data.msg, type: 'success' });
    } catch (err) {
      console.error('Error redeeming funds:', err);
      setMsg({ text: err.response?.data?.msg || 'Failed to redeem funds.', type: 'error' });
    }
    setLoading(false);
    setTimeout(() => setMsg({ text: '', type: '' }), 5000);
  };

  return (
    <div className="h-full overflow-y-auto p-8 bg-[#eef2f6] dark:bg-[#0a0f1a] custom-scrollbar transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight mb-8">My Wallet & Payments</h1>
        
        {msg.text && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 ${msg.type === 'success' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'}`}>
            {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="font-medium">{msg.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-2 text-indigo-100 mb-2">
              <WalletIcon className="w-5 h-5" />
              <span className="font-semibold uppercase tracking-wider text-sm">Available Balance</span>
            </div>
            {/* ANTI-CRASH FIX: Safely wrap walletBalance in a Number() parser */}
            <h2 className="text-5xl font-bold mb-6">₹{Number(user?.walletBalance || 0).toFixed(2)}</h2>
            <div className="flex gap-4">
              <button disabled className="bg-white/20 hover:bg-white/30 px-5 py-2 rounded-xl font-semibold backdrop-blur-sm transition-colors text-sm cursor-not-allowed">
                + Top Up Wallet
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-3xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Bank & Withdrawals</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#0a0f1a]/50 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${user?.bankConnected ? 'bg-green-100 text-green-600 dark:bg-green-900/30' : 'bg-gray-200 text-gray-500 dark:bg-gray-800'}`}>
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white">{user?.bankConnected ? 'HDFC Bank ****4921' : 'No Bank Linked'}</p>
                    <p className="text-xs text-gray-500 mt-1">For automatic refunds & redemption</p>
                  </div>
                </div>
                <button onClick={handleConnectBank} disabled={loading} className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${user?.bankConnected ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                  {user?.bankConnected ? 'Disconnect' : 'Connect'}
                </button>
              </div>
              <div className="pt-2">
                <button onClick={handleRedeem} disabled={loading || !user?.bankConnected || user?.walletBalance <= 0} className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ArrowDownToLine className="w-5 h-5" />}
                  Redeem Balance to Bank
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">Transfers take 1-2 business days. Requires linked bank.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6">
          <h4 className="font-bold text-blue-800 dark:text-blue-400 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> VoltPod Cancellation & Refund Policy
          </h4>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2 ml-7 list-disc">
            <li>Bookings require a <strong>30% advance payment</strong> to secure your slot.</li>
            <li>Cancel <strong>2+ hours</strong> before slot: 100% refund of advance.</li>
            <li>Cancel <strong>under 2 hours</strong> before slot: 50% refund of advance.</li>
            <li>If your bank is connected, refunds route directly to your bank account. Otherwise, they instantly return to your VoltPod Wallet.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Wallet;