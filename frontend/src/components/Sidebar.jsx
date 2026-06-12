import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Zap, Map as MapIcon, Users, BarChart, LogOut, LayoutDashboard, Sparkles, Moon, Sun, Wallet, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const NavItem = ({ to, icon: Icon, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
        isActive 
          ? 'bg-indigo-100 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 shadow-sm dark:shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
      }`}
    >
      <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
      {label}
    </Link>
  );
};

const Sidebar = () => {
  const navigate = useNavigate();


  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user')) || {};

  const { isDark, toggleTheme } = useTheme();
  const [wallet, setWallet] = useState(Number(user?.walletBalance) || 0);

  useEffect(() => {
    const handleWalletUpdate = () => {
      const updatedUser = JSON.parse(localStorage.getItem('user'));
      if (updatedUser) setWallet(Number(updatedUser.walletBalance) || 0);
    };
    window.addEventListener('walletUpdated', handleWalletUpdate);
    return () => window.removeEventListener('walletUpdated', handleWalletUpdate);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="w-64 bg-[#f8fafc] dark:bg-[#161b33] border-r border-gray-200 dark:border-gray-800 h-full flex flex-col shrink-0 transition-colors duration-300">

      <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
        <Link to="/" className="flex items-center gap-3 text-gray-900 dark:text-white mb-10">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">VoltPod</span>
        </Link>

        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-500 mb-4 px-2 tracking-widest uppercase">Core Features</p>
          <NavItem to="/map" icon={MapIcon} label="Find & Book" />
          {token && <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />}
          
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-800/50">
            <p className="text-[10px] font-bold text-gray-500 mb-4 px-2 tracking-widest uppercase">Account</p>
            {token && <NavItem to="/profile" icon={User} label="My Profile" />}
            {token && <NavItem to="/wallet" icon={Wallet} label="My Wallet" />}
            {user?.role === 'operator' && <NavItem to="/operator" icon={BarChart} label="Revenue" />}
            {user?.role === 'admin' && <NavItem to="/admin" icon={Users} label="Admin Panel" />}
            <NavItem to="/ai" icon={Sparkles} label="AI Assistant" />
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-gray-200 dark:border-gray-800/50 shrink-0 bg-[#f8fafc] dark:bg-[#161b33]">
        {token ? (
          <div className="flex items-center justify-between w-full">

            {/* FIX: Added min-w-0 and flex-1 so long names don't push the logout button off the screen! */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-sm font-bold text-gray-900 dark:text-white truncate block">{user?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/30 truncate max-w-full">
                    <Wallet className="w-3 h-3 shrink-0" /> ₹{wallet.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {/* Premium antigravity theme toggle — compact icon pill */}
              <button
                onClick={toggleTheme}
                className={`relative flex items-center justify-center w-9 h-9 rounded-full transition-all duration-300 overflow-hidden ${
                  isDark
                    ? 'bg-gray-800 hover:shadow-[0_0_14px_4px_rgba(250,204,21,0.45)] shadow-[0_0_8px_2px_rgba(250,204,21,0.2)]'
                    : 'bg-white border border-indigo-100 shadow-md hover:shadow-[0_0_10px_3px_rgba(99,102,241,0.2)]'
                }`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {/* Breathing aura — dark mode only */}
                {isDark && (
                  <span className="absolute inset-0 rounded-full bg-yellow-400/20 blur-md animate-pulse pointer-events-none" />
                )}
                {isDark
                  ? <Sun className="relative z-10 w-4 h-4 text-yellow-400" />
                  : <Moon className="relative z-10 w-4 h-4 text-indigo-500" />}
              </button>
              <button onClick={handleLogout} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-300" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Premium antigravity theme toggle — full-width pill */}
            <button
              onClick={toggleTheme}
              className={`relative w-full flex items-center justify-center gap-2.5 py-2.5 mb-4 rounded-full font-semibold text-sm transition-all duration-300 overflow-hidden ${
                isDark
                  ? 'bg-gray-800 text-yellow-400 hover:shadow-[0_0_18px_5px_rgba(250,204,21,0.35)] shadow-[0_0_10px_2px_rgba(250,204,21,0.15)]'
                  : 'bg-white text-indigo-600 border border-indigo-100 shadow-md hover:shadow-[0_0_12px_4px_rgba(99,102,241,0.18)]'
              }`}
            >
              {/* Breathing aura — dark mode only */}
              {isDark && (
                <span className="absolute inset-0 rounded-full bg-yellow-400/15 blur-md animate-pulse pointer-events-none" />
              )}
              {isDark
                ? <><Sun className="relative z-10 w-4 h-4" /> <span className="relative z-10">Light Mode</span></>
                : <><Moon className="relative z-10 w-4 h-4" /> <span className="relative z-10">Dark Mode</span></>}
            </button>
              <Link to="/login" className="block text-center text-gray-600 dark:text-gray-300 font-semibold py-2">Login</Link>
            <Link to="/register" className="block text-center bg-indigo-600 text-white py-2 rounded-xl font-bold hover:bg-indigo-700 transition-colors">Sign Up</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;