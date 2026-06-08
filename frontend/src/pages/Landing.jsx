import { Link } from 'react-router-dom';
import { Zap, MapPin, CalendarCheck, BatteryCharging, ShieldCheck, Mail, Briefcase, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="h-full overflow-y-auto bg-[#f8fafc] dark:bg-[#0a0f1a] text-gray-900 dark:text-white custom-scrollbar relative transition-colors duration-300">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#00ff88]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        
        {/* 1. HERO SECTION */}
        <section className="text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-sm font-bold mb-6">
            <Zap className="w-4 h-4" /> Vision 2047: Viksit Bharat
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-['Orbitron'] mb-6 leading-tight">
            The Smartest Way to <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00ff88] to-[#00d4ff]">
              Charge Your EV
            </span>
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Locate nearby stations, check real-time hardware availability, and reserve your charging slot instantly. No more waiting in lines.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/map" className="bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-[#0a0f1a] font-bold text-lg px-8 py-4 rounded-xl hover:shadow-[0_0_20px_rgba(0,255,136,0.4)] transition-all flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5" /> Open Live Map
            </Link>
            <a href="#partner" className="bg-white dark:bg-[#111827] border border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 text-gray-900 dark:text-white font-bold text-lg px-8 py-4 rounded-xl transition-all flex items-center justify-center">
              Partner With Us
            </a>
          </div>
        </section>

        {/* 2. HOW TO USE SECTION */}
        <section className="py-20 border-t border-gray-800">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-['Orbitron'] mb-4">How VoltPod Works</h2>
            <p className="text-gray-400">Your seamless charging experience in three simple steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-gray-800 text-center hover:border-[#00ff88]/30 transition-colors shadow-sm">
              <div className="w-16 h-16 bg-[#00ff88]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#00ff88]">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">1. Locate</h3>
              <p className="text-gray-600 dark:text-gray-400">Use our interactive map to find the nearest EV charging stations tailored to your vehicle's connector type.</p>
            </div>
            <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-gray-800 text-center hover:border-[#00d4ff]/30 transition-colors shadow-sm">
              <div className="w-16 h-16 bg-[#00d4ff]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#00d4ff]">
                <CalendarCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">2. Book</h3>
              <p className="text-gray-600 dark:text-gray-400">Check live slot availability and reserve your charging time in advance. Zero waiting queues.</p>
            </div>
            <div className="bg-white dark:bg-[#111827] p-8 rounded-3xl border border-gray-200 dark:border-gray-800 text-center hover:border-yellow-400/30 transition-colors shadow-sm">
              <div className="w-16 h-16 bg-yellow-400/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-yellow-400">
                <BatteryCharging className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">3. Charge</h3>
              <p className="text-gray-600 dark:text-gray-400">Arrive at your booked time, plug in, and monitor your charging session and costs directly from your dashboard.</p>
            </div>
          </div>
        </section>

        {/* ... (Section 3: Charger Types remains the same, it doesn't mention ChargeMate) ... */}

        {/* 4. PARTNER & CONTACT SECTION */}
        <section id="partner" className="py-20 border-t border-gray-200 dark:border-gray-800">
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2">
              
              {/* Operator Request Form */}
              <div className="p-10 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800">
                <div className="mb-8">
                  <div className="w-12 h-12 bg-[#00ff88]/10 rounded-xl flex items-center justify-center text-teal-600 dark:text-[#00ff88] mb-4">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold font-['Orbitron'] mb-2 text-gray-900 dark:text-white">Become a Station Operator</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Own a commercial space or existing chargers? Partner with us to list your stations, manage live hardware, and earn revenue.</p>
                </div>
                
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); alert("Request sent successfully! Our team will contact you soon."); }}>
                  <input type="text" placeholder="Business / Owner Name" required className="w-full bg-gray-50 dark:bg-[#0a0f1a] border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#00ff88] transition-colors" />
                  <input type="email" placeholder="Business Email" required className="w-full bg-gray-50 dark:bg-[#0a0f1a] border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#00ff88] transition-colors" />
                  <input type="text" placeholder="Station Location (City/Area)" required className="w-full bg-gray-50 dark:bg-[#0a0f1a] border border-gray-300 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white focus:outline-none focus:border-[#00ff88] transition-colors" />
                  <button type="submit" className="w-full bg-gradient-to-r from-[#00ff88] to-[#00d4ff] text-[#0a0f1a] font-bold py-3 rounded-xl hover:shadow-[0_0_15px_rgba(0,255,136,0.3)] transition-all">
                    Submit Partnership Request
                  </button>
                </form>
              </div>

              {/* Admin / Direct Contact */}
              <div className="p-10 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#111827] dark:to-[#0a0f1a]">
                <div className="mb-8">
                  <div className="w-12 h-12 bg-[#00d4ff]/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-[#00d4ff] mb-4">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold font-['Orbitron'] mb-2 text-gray-900 dark:text-white">System Admin Inquiry</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">Interested in becoming a core system administrator, or need to contact the founding team directly? Drop us an email.</p>
                </div>

                <div className="space-y-6">
                  <a href="mailto:admin@voltpod.com?subject=Admin Role Inquiry" className="group block p-5 rounded-2xl border border-gray-300 dark:border-gray-700 hover:border-[#00d4ff] bg-white dark:bg-[#0a0f1a] transition-all shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Mail className="w-6 h-6 text-[#00d4ff]" />
                        <div className="text-left">
                          <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-[#00d4ff] transition-colors">Email the Founders</h4>
                          <p className="text-xs text-gray-500">admin@voltpod.com</p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 dark:text-gray-600 group-hover:text-[#00d4ff] group-hover:translate-x-1 transition-all" />
                    </div>
                  </a>

                  <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
                    <h4 className="font-bold text-gray-800 dark:text-gray-300 mb-2">Need general support?</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-500 mb-4">If you are a user facing issues with a booking or a station, please reach out to our 24/7 support desk.</p>
                    <a href="mailto:support@voltpod.com" className="text-teal-600 dark:text-[#00ff88] hover:underline font-semibold text-sm flex items-center gap-2">
                      <Mail className="w-4 h-4" /> support@voltpod.com
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-gray-200 dark:border-gray-800 text-gray-500 text-sm">
          <p>© 2026 VoltPod. Built for Vision 2047 Viksit Bharat Hackathon.</p>
        </footer>

      </div>
    </div>
  );
};

export default Landing;