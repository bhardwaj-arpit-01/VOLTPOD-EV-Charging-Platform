import { Zap, Mail, Car, ShieldCheck } from 'lucide-react';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user')) || {};

  return (
    <div className="h-full overflow-y-auto p-8 bg-[#f8fafc] dark:bg-[#0a0f1a] transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold font-['Orbitron'] text-gray-900 dark:text-white mb-8">My Profile</h1>

        {/* Profile Card */}
        <div className="bg-white dark:bg-[#111827] rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
          
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-[#00ff88] dark:to-[#00d4ff] relative">
            <div className="absolute -bottom-12 left-8 w-24 h-24 bg-white dark:bg-[#161b33] rounded-full flex items-center justify-center border-4 border-white dark:border-[#0a0f1a] shadow-lg">
              <span className="text-4xl font-bold text-indigo-600 dark:text-[#00ff88]">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>

          <div className="pt-16 pb-8 px-8">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user?.name || 'VoltPod User'}</h2>
                <div className="flex items-center gap-2 mt-1 text-gray-500 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email || 'No email provided'}</span>
                </div>
              </div>
              <span className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-indigo-200 dark:border-indigo-500/30">
                <ShieldCheck className="w-4 h-4" /> {user?.role || 'User'}
              </span>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Registered EV Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-[#0a0f1a] p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <Car className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Vehicle Model</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {user?.vehicle?.name || 'Not specified'}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-[#0a0f1a] p-4 rounded-xl border border-gray-200 dark:border-gray-800 flex items-center gap-4">
                  <div className="p-3 bg-green-100 dark:bg-[#00ff88]/10 rounded-lg text-green-600 dark:text-[#00ff88]">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Battery Capacity</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {user?.vehicle?.batteryCapacity ? `${user.vehicle.batteryCapacity} kWh` : 'Not specified'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;