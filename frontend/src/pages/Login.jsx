import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Zap, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

// Module-level: never called during render
const SPARKS = [...Array(12)].map(() => ({
  angle:    Math.random() * 360,
  dist:     Math.random() * 28 + 10,
  duration: Math.random() * 0.6 + 0.4,
  delay:    Math.random() * 1.2,
}));

/* ─── Wheel spoke angles (6 spokes) ─── */
const SPOKE_ANGLES = [0, 60, 120, 180, 240, 300];

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.user.role === 'operator') navigate('/operator');
      else if (res.data.user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Invalid Credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center bg-[#e8ecf2] dark:bg-[#060c1a] relative overflow-hidden transition-colors duration-300">

      {/* ═══════════ EV CHARGING SCENE ═══════════ */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <svg
          viewBox="0 0 1000 580"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Ambient background gradient */}
            <radialGradient id="bg" cx="55%" cy="75%" r="65%">
              <stop offset="0%"   stopColor="#0d1a2e"/>
              <stop offset="100%" stopColor="#04080f"/>
            </radialGradient>
            {/* Cable energy gradient */}
            <linearGradient id="cableGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#00ff88"/>
              <stop offset="100%" stopColor="#00d4ff"/>
            </linearGradient>
            {/* Battery fill gradient */}
            <linearGradient id="battGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#00ff88"/>
              <stop offset="50%"  stopColor="#00d4ff"/>
              <stop offset="100%" stopColor="#818cf8"/>
            </linearGradient>
            {/* Ground reflection */}
            <linearGradient id="groundGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#0d1a2e" stopOpacity="0.6"/>
              <stop offset="100%" stopColor="#04080f" stopOpacity="0"/>
            </linearGradient>
            {/* Car body gradient */}
            <linearGradient id="carGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="#1e2d45"/>
              <stop offset="100%" stopColor="#0f172a"/>
            </linearGradient>
            {/* Soft glow filter */}
            <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="6" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
            <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* ── Background ── */}
          <rect width="1000" height="580" fill="url(#bg)"/>

          {/* Subtle top atmosphere */}
          <ellipse cx="500" cy="0" rx="600" ry="200" fill="#1e40af" opacity="0.06"/>

          {/* Ground floor */}
          <rect x="0" y="490" width="1000" height="90" fill="#050c18"/>
          <line x1="0" y1="490" x2="1000" y2="490" stroke="#1e293b" strokeWidth="1.5"/>

          {/* Ground glow under car */}
          <ellipse cx="490" cy="494" rx="310" ry="18" fill="#00ff88" opacity="0.07"/>

          {/* ── CHARGING STATION ── */}
          <g transform="translate(148,270)">
            {/* Post shadow */}
            <ellipse cx="28" cy="222" rx="22" ry="6" fill="#000" opacity="0.5"/>
            {/* Main post */}
            <rect x="3" y="0" width="50" height="220" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="1.5"/>
            {/* Top cap accent */}
            <rect x="0" y="-6" width="56" height="14" rx="7" fill="#1e40af"/>
            {/* Screen area */}
            <rect x="11" y="18" width="34" height="50" rx="6" fill="#0a1628" stroke="#1d4ed8" strokeWidth="1"/>
            {/* Charging % on screen */}
            <text x="28" y="36" textAnchor="middle" fill="#00ff88" fontSize="9" fontFamily="monospace" fontWeight="bold">VOLT</text>
            <text x="28" y="50" textAnchor="middle" fill="#00d4ff" fontSize="9" fontFamily="monospace" fontWeight="bold">POD</text>
            <text x="28" y="63" textAnchor="middle" fill="#00ff88" fontSize="8" fontFamily="monospace">87%</text>
            {/* Status LED */}
            <circle cx="28" cy="90" r="7" fill="#00ff88" opacity="0.9" filter="url(#softGlow)"/>
            {/* Brand strip */}
            <rect x="8" y="110" width="40" height="4" rx="2" fill="#1d4ed8" opacity="0.6"/>
            {/* Cable exit port */}
            <rect x="19" y="160" width="18" height="12" rx="3" fill="#0a1628" stroke="#334155" strokeWidth="1"/>
          </g>

          {/* ── CHARGING CABLE (animated dashes) ── */}
          {/* Glow backing */}
          <path d="M199 440 C 220 470, 270 490, 318 468" fill="none" stroke="#00ff88" strokeWidth="14" opacity="0.12"/>
          {/* Animated energy flow */}
          <motion.path
            d="M199 440 C 220 470, 270 490, 318 468"
            fill="none"
            stroke="url(#cableGrad)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="14 8"
            animate={{ strokeDashoffset: [110, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            filter="url(#glow)"
          />

          {/* ── CONNECTOR GLOW at car port ── */}
          <motion.circle
            cx="318" cy="468"
            r="14"
            fill="#00ff88"
            opacity={0}
            animate={{ opacity: [0.2, 0.7, 0.2], r: [10, 16, 10] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Sparks at connection */}
          {SPARKS.map((s, i) => (
            <motion.line
              key={i}
              x1="318" y1="468"
              x2={318 + Math.cos(s.angle * Math.PI / 180) * s.dist}
              y2={468 + Math.sin(s.angle * Math.PI / 180) * s.dist}
              stroke="#00ff88"
              strokeWidth="1.5"
              strokeLinecap="round"
              animate={{ opacity: [0, 1, 0], scaleX: [0.3, 1, 0.3] }}
              transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: 'easeOut' }}
            />
          ))}

          {/* ── EV CAR ── */}
          <g transform="translate(300,290)">

            {/* Car shadow */}
            <ellipse cx="200" cy="202" rx="210" ry="14" fill="#000" opacity="0.45"/>

            {/* ── Lower Body / Chassis ── */}
            <path d="M15,110 L15,170 Q15,182 30,182 L370,182 Q385,182 385,170 L385,110 Z"
                  fill="url(#carGrad)" stroke="#334155" strokeWidth="1.5"/>

            {/* ── Upper Cabin ── */}
            <path d="M65,110 Q80,48 145,36 L260,36 Q325,46 340,110 Z"
                  fill="url(#carGrad)" stroke="#334155" strokeWidth="1.5"/>

            {/* ── Windshield ── */}
            <path d="M157,40 L150,107 L235,107 L228,40 Z"
                  fill="#0ea5e9" opacity="0.35" stroke="#1d4ed8" strokeWidth="1"/>

            {/* ── Rear Window ── */}
            <path d="M240,40 L235,107 L312,107 L305,44 Z"
                  fill="#0ea5e9" opacity="0.25" stroke="#1d4ed8" strokeWidth="1"/>

            {/* ── Window pillar ── */}
            <line x1="237" y1="40" x2="235" y2="108" stroke="#334155" strokeWidth="2"/>

            {/* ── Door line ── */}
            <line x1="155" y1="113" x2="155" y2="170" stroke="#334155" strokeWidth="1" opacity="0.5"/>

            {/* ── Body accent stripe ── */}
            <path d="M25,145 L375,145" stroke="#3b82f6" strokeWidth="1" opacity="0.35"/>

            {/* ── Front bumper ── */}
            <path d="M8,110 Q2,130 5,165 L20,165 L20,110 Z" fill="#111827" stroke="#1e293b" strokeWidth="1"/>
            {/* Front headlight */}
            <path d="M8,120 Q4,132 6,148 L18,145 L18,122 Z" fill="#fef3c7" opacity="0.95" filter="url(#softGlow)"/>

            {/* ── Rear ── */}
            <path d="M378,110 Q388,130 385,165 L370,165 L370,110 Z" fill="#111827" stroke="#1e293b" strokeWidth="1"/>
            {/* Taillight */}
            <rect x="375" y="122" width="8" height="24" rx="3" fill="#ef4444" opacity="0.85" filter="url(#softGlow)"/>

            {/* ── Charging port (left side of car) ── */}
            <rect x="14" y="126" width="18" height="13" rx="3" fill="#00ff88" opacity="0.9" filter="url(#softGlow)"/>
            <rect x="16" y="128" width="14" height="9" rx="2" fill="#060c1a"/>
            <circle cx="23" cy="132" r="3" fill="#00ff88"/>

            {/* ── WHEELS ── */}
            {/* Front wheel */}
            <circle cx="95"  cy="181" r="52" fill="#0d1424" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="95"  cy="181" r="37" fill="#111827" stroke="#334155" strokeWidth="1.5"/>
            <motion.g animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: '95px 181px' }}>
              {SPOKE_ANGLES.map(a => (
                <line key={a}
                  x1={95  + Math.cos(a*Math.PI/180)*14} y1={181 + Math.sin(a*Math.PI/180)*14}
                  x2={95  + Math.cos(a*Math.PI/180)*36} y2={181 + Math.sin(a*Math.PI/180)*36}
                  stroke="#475569" strokeWidth="2.5" strokeLinecap="round"/>
              ))}
            </motion.g>
            <circle cx="95"  cy="181" r="10" fill="#1e293b" stroke="#475569" strokeWidth="1.5"/>

            {/* Rear wheel */}
            <circle cx="310" cy="181" r="52" fill="#0d1424" stroke="#1e293b" strokeWidth="2"/>
            <circle cx="310" cy="181" r="37" fill="#111827" stroke="#334155" strokeWidth="1.5"/>
            <motion.g animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} style={{ transformOrigin: '310px 181px' }}>
              {SPOKE_ANGLES.map(a => (
                <line key={a}
                  x1={310 + Math.cos(a*Math.PI/180)*14} y1={181 + Math.sin(a*Math.PI/180)*14}
                  x2={310 + Math.cos(a*Math.PI/180)*36} y2={181 + Math.sin(a*Math.PI/180)*36}
                  stroke="#475569" strokeWidth="2.5" strokeLinecap="round"/>
              ))}
            </motion.g>
            <circle cx="310" cy="181" r="10" fill="#1e293b" stroke="#475569" strokeWidth="1.5"/>

            {/* ── BATTERY INDICATOR above car ── */}
            <g transform="translate(90, -28)">
              {/* Outline */}
              <rect x="0" y="0" width="200" height="26" rx="7" fill="none" stroke="#334155" strokeWidth="1.5"/>
              {/* Terminal nub */}
              <rect x="200" y="8" width="9" height="10" rx="2.5" fill="#334155"/>
              {/* Animated fill */}
              <motion.rect
                x="2" y="2" width="0" height="22" rx="6"
                fill="url(#battGrad)" opacity={0.85}
                animate={{ width: [20, 185, 20] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* ⚡ label */}
              <text x="100" y="18" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="monospace">⚡ CHARGING</text>
            </g>
          </g>

          {/* Ambient top-left atmospheric glow */}
          <motion.ellipse cx="120" cy="200" rx="180" ry="120"
            fill="#3b82f6" opacity={0}
            animate={{ opacity: [0.04, 0.1, 0.04] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}/>
          <motion.ellipse cx="880" cy="180" rx="150" ry="100"
            fill="#6366f1" opacity={0}
            animate={{ opacity: [0.03, 0.09, 0.03] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}/>
        </svg>
      </div>
      {/* ════════════════════════════════════════ */}

      {/* ── LOGIN CARD ── */}
      <div className="bg-white/85 dark:bg-[#111827]/85 backdrop-blur-2xl p-8 md:p-12 rounded-3xl border border-slate-200 dark:border-gray-800 shadow-xl dark:shadow-[0_0_60px_rgba(0,0,0,0.6)] w-full max-w-md relative z-10 transition-colors duration-300">
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-slate-100 dark:bg-[#0a0f1a] rounded-2xl border border-emerald-300/60 dark:border-[#00ff88]/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.2)]">
            <Zap className="w-8 h-8 text-emerald-500 dark:text-[#00ff88]" />
          </div>
        </div>

        <h2 className="text-3xl font-bold font-['Orbitron'] text-center text-slate-800 dark:text-white mb-2">Welcome Back</h2>
        <p className="text-center text-slate-500 dark:text-gray-400 mb-8">Enter your details to access your account.</p>

        {error && (
          <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-sm mb-6 bg-red-50 dark:bg-red-400/10 p-3 rounded-xl border border-red-200 dark:border-red-400/20">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#0a0f1a] border border-slate-200 dark:border-gray-700 rounded-xl py-3 pl-12 pr-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-emerald-400 dark:focus:border-[#00ff88] transition-colors"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-gray-500" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-100 dark:bg-[#0a0f1a] border border-slate-200 dark:border-gray-700 rounded-xl py-3 pl-12 pr-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-600 focus:outline-none focus:border-emerald-400 dark:focus:border-[#00ff88] transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-[#00ff88] dark:to-[#00d4ff] text-white dark:text-[#0a0f1a] font-bold py-4 rounded-xl text-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] dark:hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all flex justify-center items-center mt-4"
          >
            {loading
              ? <div className="w-6 h-6 border-2 border-white dark:border-[#0a0f1a] border-t-transparent rounded-full animate-spin"/>
              : 'Initiate Charge...'}
          </button>
        </form>

        <p className="text-center text-slate-500 dark:text-gray-400 mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-600 dark:text-[#00ff88] font-semibold hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;