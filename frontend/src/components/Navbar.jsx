import { Link, useNavigate } from 'react-router-dom';
import { Zap, User, LogOut, Map as MapIcon, BarChart } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-[#111827] border-b border-[#00ff88]/20 px-6 py-4 flex items-center justify-between z-50 shadow-[0_4px_20px_rgba(0,255,136,0.1)]">
      {/* Brand link stays pointing to "/" (Landing Page) */}
      <Link to="/" className="flex items-center gap-2 text-white hover:text-[#00ff88] transition-colors">
        <Zap className="w-8 h-8 text-[#00ff88]" />
        <span className="text-2xl font-bold font-['Orbitron'] tracking-wider">Charge<span className="text-[#00ff88]">Mate</span></span>
      </Link>
      
      <div className="flex items-center gap-6">
        {/* Map link updated to point to "/map" */}
        <Link to="/map" className="text-gray-300 hover:text-[#00d4ff] flex items-center gap-2 transition-colors">
          <MapIcon className="w-5 h-5" />
          <span className="hidden sm:inline font-semibold">Map</span>
        </Link>
        
        {token ? (
          <>
            <Link to="/dashboard" className="text-gray-300 hover:text-[#00d4ff] flex items-center gap-2 transition-colors">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline font-semibold">Dashboard</span>
            </Link>
            
            {user?.role === 'operator' && (
              <Link to="/operator" className="text-gray-300 hover:text-yellow-400 flex items-center gap-2 transition-colors">
                <BarChart className="w-5 h-5" />
                <span className="hidden sm:inline font-semibold">Revenue</span>
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link to="/admin" className="text-gray-300 hover:text-[#00ff88] flex items-center gap-2 transition-colors">
                <BarChart className="w-5 h-5" />
                <span className="hidden sm:inline font-semibold">Admin Panel</span>
              </Link>
            )}

            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline font-semibold">Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-300 hover:text-white font-semibold">Login</Link>
            <Link to="/register" className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-[#0a0f1a] px-4 py-2 rounded-lg font-bold hover:shadow-[0_0_15px_rgba(0,255,136,0.5)] transition-all">
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;