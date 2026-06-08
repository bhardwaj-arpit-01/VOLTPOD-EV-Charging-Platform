import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Profile from './pages/Profile';
import AIAssistant from './pages/AIAssistant';
import Sidebar from './components/Sidebar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import OperatorDashboard from './pages/OperatorDashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Wallet from './pages/Wallet';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="flex flex-row h-screen bg-[#eef2f6] dark:bg-[#0a0f1a] font-sans text-gray-800 dark:text-white transition-colors duration-300">
          <Sidebar />
          <div className="flex-1 overflow-hidden relative">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/map" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/ai" element={<AIAssistant />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/operator" element={<OperatorDashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;