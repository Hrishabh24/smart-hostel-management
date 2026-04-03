import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaBars, FaTimes, FaQrcode, FaCreditCard, FaClipboardList, FaChartBar,
  FaUsers, FaCheckCircle, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt,
  FaChevronRight, FaHome, FaDesktop, FaTwitter, FaGithub, FaLinkedin
} from "react-icons/fa";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [stats, setStats] = useState({ students: 0, rooms: 0, payments: 0 });
  const [dynamicAlert, setDynamicAlert] = useState({
    title: "Attendance Marked!",
    desc: "System ready.",
    time: "Just now",
    icon: FaCheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/20",
    border: "border-green-500/20"
  });

  // Handle Navbar Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch Live Data & Animate Stats
  useEffect(() => {
    axios.get("http://localhost:2008/public/live-insights")
      .then((res) => {
        const target = {
          students: res.data.students || 0,
          rooms: res.data.rooms || 0,
          payments: res.data.payments || 0
        };
        const duration = 2000;
        const steps = 50;
        const stepTime = Math.max(15, duration / steps);

        const increments = {
          students: Math.ceil((target.students || 1) / steps) || 1,
          rooms: Math.ceil((target.rooms || 1) / steps) || 1,
          payments: Math.ceil((target.payments || 1) / steps) || 1,
        };

        let current = { students: 0, rooms: 0, payments: 0 };
        const handle = setInterval(() => {
          let done = true;
          const next = { ...current };

          Object.keys(target).forEach((key) => {
            if (current[key] < target[key]) {
              done = false;
              next[key] = Math.min(target[key], current[key] + increments[key]);
            }
          });

          current = next;
          setStats(next);

          if (done) clearInterval(handle);
        }, stepTime);
      })
      .catch((err) => console.error("Error fetching live insights", err));

    // Fetch Latest Activity
    axios.get("http://localhost:2008/public/latest-activity")
      .then((res) => {
        if (res.data) {
          const { name, roomNumber, created_at } = res.data;
          
          let timeAgo = "Just now";
          if (created_at) {
             const diffMins = Math.floor((new Date() - new Date(created_at)) / 60000);
             if (diffMins > 0) timeAgo = `${diffMins} min ago`;
             if (diffMins > 60) timeAgo = `${Math.floor(diffMins / 60)} hrs ago`;
             if (diffMins > 1440) timeAgo = `${Math.floor(diffMins / 1440)} days ago`;
          }

          setDynamicAlert({
            title: "Attendance Marked!",
            desc: `${name} scanned QR in Room ${roomNumber || 'N/A'}`,
            time: timeAgo,
            icon: FaCheckCircle,
            color: "text-green-400",
            bg: "bg-green-500/20",
            border: "border-green-500/20"
          });
        }
      })
      .catch((err) => console.error("Error fetching latest activity", err));
  }, []);

  return (
    <div className="home-wrapper font-sans min-h-screen bg-[#0B0F19] text-gray-100 flex flex-col overflow-x-hidden selection:bg-purple-500/30 selection:text-white">

      {/* BACKGROUND ANIMATED BLOBS */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[150px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      {/* NAVBAR */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 border-b ${scrolled
          ? "bg-[#0B0F19]/80 backdrop-blur-xl border-white/10 shadow-lg py-4"
          : "bg-transparent border-transparent py-6"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-[0_0_20px_rgba(147,51,234,0.4)] group-hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] transform transition-all duration-300 group-hover:scale-105">
              <FaHome className="text-white text-xl md:text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center">
                Zyrra<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Stay</span>
              </h1>
            </div>
          </div>

          {/* Desktop Nav Actions */}
          <div className="hidden lg:flex items-center gap-6">
            <Link to="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bg-purple-500 after:bottom-0 after:left-0 after:origin-bottom-right hover:after:scale-x-100 hover:after:origin-bottom-left after:transition-transform after:duration-300">
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-7 py-2.5 text-sm font-bold text-white shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] transform hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10">Create Account</span>
              <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors z-50 relative"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        <div className={`absolute top-full left-0 w-full bg-[#0B0F19]/95 backdrop-blur-xl border-b border-white/10 lg:hidden overflow-hidden transition-all duration-300 flex flex-col ${mobileMenuOpen ? "max-h-64 opacity-100 py-6 px-6 gap-4 shadow-2xl" : "max-h-0 opacity-0 py-0 px-6 gap-0"}`}>
          <Link
            to="/login"
            className="w-full text-center rounded-xl bg-white/5 text-white font-semibold py-3.5 border border-white/10 hover:bg-white/10 transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="w-full text-center rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3.5 shadow-lg hover:from-purple-500 hover:to-blue-500 transition-all"
            onClick={() => setMobileMenuOpen(false)}
          >
            Create Account
          </Link>
        </div>
      </header>

      {/* MAIN HERO SECTION */}
      <main className="flex-grow z-10 pt-32 pb-16 lg:pt-48 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">

          {/* Hero Left Content */}
          <div className="space-y-8 relative z-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium text-xs sm:text-sm shadow-sm backdrop-blur-md">
              <span className="flex h-2 w-2 rounded-full bg-purple-400 animate-pulse"></span>
              The Next Evolution in Dorm Management
            </div>

            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Manage <br /> Spaces with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-blue-400 drop-shadow-[0_0_15px_rgba(192,132,252,0.3)]">
                Absolute Zen.
              </span>
            </h2>

            <p className="text-lg sm:text-xl text-gray-400 leading-relaxed max-w-lg">
              Empower your campus with an ultra-responsive, intelligent ecosystem for attendance, fee collection, and seamless living.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 text-base font-bold text-white shadow-[0_10px_30px_rgba(147,51,234,0.3)] hover:shadow-[0_15px_40px_rgba(147,51,234,0.5)] transform hover:-translate-y-1 transition-all duration-300 gap-3 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <span className="relative z-10">Access Portal</span>
                <FaChevronRight className="relative z-10 text-sm group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center rounded-full bg-white/5 border border-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-md hover:bg-white/10 hover:border-white/20 transform hover:-translate-y-1 transition-all duration-300 gap-3"
              >
                <FaDesktop className="text-gray-400 text-lg" />
                Explore Demo
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="pt-10 flex items-center gap-6 opacity-80">
              <div className="flex -space-x-3">
                {[41, 42, 43, 44].map((i) => (
                  <div key={i} className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-2 border-[#0B0F19] bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 bg-cover shadow-lg" style={{ backgroundImage: `url('https://i.pravatar.cc/100?img=${i}')` }}></div>
                ))}
              </div>
              <div className="text-sm text-gray-300">
                <p className="font-bold text-white text-base">4.9/5 Rating</p>
                <p className="text-gray-400">Trusted by Global Campuses</p>
              </div>
            </div>
          </div>

          {/* Hero Right Visuals - Dynamic Floating Dashboard */}
          <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-auto lg:h-[650px] perspective-1000 z-10">
            {/* Glowing ring behind */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full border border-purple-500/30 shadow-[0_0_50px_rgba(147,51,234,0.2)] animate-[spin_10s_linear_infinite]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] rounded-full border border-blue-500/20 shadow-[0_0_50px_rgba(59,130,246,0.1)] animate-[spin_15s_linear_infinite_reverse]"></div>

            {/* Main Mockup Card */}
            <div className="absolute z-20 top-1/2 left-1/2 w-full max-w-[90%] sm:max-w-md bg-[#131B2F]/80 backdrop-blur-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-3xl p-6 lg:p-8 transform -translate-x-1/2 -translate-y-1/2 hover:rotate-2 hover:scale-105 transition-all duration-500 ease-out">

              {/* Card Header */}
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg border border-white/5">
                    <FaChartBar className="text-xl text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Live Insights</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Real-time sync active</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
              </div>

              <div className="space-y-5">
                {/* Stat block 1 */}
                <div className="bg-gradient-to-br from-purple-600/90 to-blue-600/90 rounded-2xl p-5 text-white shadow-[0_10px_30px_rgba(147,51,234,0.2)] relative overflow-hidden group hover:from-purple-500 hover:to-blue-500 transition-colors">
                  <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="flex justify-between items-end relative z-10">
                    <div>
                      <p className="text-purple-100 font-medium text-sm flex items-center gap-2 mb-2">
                        <FaUsers className="text-purple-200" /> Active Residents
                      </p>
                      <h4 className="text-4xl font-black">{stats.students.toLocaleString()}</h4>
                    </div>
                    <div className="bg-white/20 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md shadow-inner">+12% Peak</div>
                  </div>
                </div>

                {/* Stat block grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                    <p className="text-gray-400 font-medium text-xs flex items-center gap-2 mb-2">
                      <FaHome className="text-blue-400" /> Available Rooms
                    </p>
                    <h4 className="text-2xl font-bold text-white">{stats.rooms.toLocaleString()}</h4>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors">
                    <p className="text-gray-400 font-medium text-xs flex items-center gap-2 mb-2">
                      <FaCreditCard className="text-emerald-400" /> Finances
                    </p>
                    <h4 className="text-2xl font-bold text-white">₹{Math.floor(stats.payments / 1000)}k+</h4>
                  </div>
                </div>
              </div>

              {/* Floating Alert Sub-card */}
              <div className="absolute -bottom-24 right-4 lg:-bottom-20 lg:-right-12 bg-[#1A233A] border border-white/10 shadow-[0_15px_30px_rgba(0,0,0,0.6)] rounded-2xl p-4 w-64 animate-[bounce_5s_infinite] hover:animate-none transition-all duration-500 cursor-pointer group z-30">
                <div className="flex gap-4 items-center">
                  <div className={`${dynamicAlert.bg} ${dynamicAlert.color} p-2.5 rounded-xl border ${dynamicAlert.border} group-hover:scale-110 transition-transform duration-300`}>
                    <dynamicAlert.icon className="text-xl" />
                  </div>
                  <div className="flex-1 transition-all duration-300">
                    <h5 className="font-bold text-sm text-white">{dynamicAlert.title}</h5>
                    <p className="text-xs text-gray-400 mt-0.5">{dynamicAlert.desc}</p>
                    <p className="text-[10px] text-purple-400 mt-1 font-medium">{dynamicAlert.time}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* FEATURES GRID SECTION */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-24 lg:mt-40 relative z-20">
          <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-24">
            <h2 className="text-xs lg:text-sm font-bold tracking-[0.2em] text-purple-400 uppercase mb-4">Ecosystem Architecture</h2>
            <h3 className="text-3xl lg:text-5xl font-extrabold text-white">Smarter tools for a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">flawless experience</span></h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "QR Attendance",
                desc: "Lightning fast check-ins with dynamic daily QR codes. Accurate, effortless, and secure.",
                icon: FaQrcode,
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20",
                glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]"
              },
              {
                title: "FinTech Grade",
                desc: "Integrated payment gateways. View dues, history, and get instant automated receipts.",
                icon: FaCreditCard,
                color: "text-blue-400",
                bg: "bg-blue-500/10",
                border: "border-blue-500/20",
                glow: "group-hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]"
              },
              {
                title: "Leave Control",
                desc: "Submit requests online. Instant warden approvals with push alerts to parents.",
                icon: FaClipboardList,
                color: "text-purple-400",
                bg: "bg-purple-500/10",
                border: "border-purple-500/20",
                glow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]"
              },
              {
                title: "Deep Analytics",
                desc: "Admins navigate comprehensive graphical views of occupancy, finance health, & reports.",
                icon: FaChartBar,
                color: "text-fuchsia-400",
                bg: "bg-fuchsia-500/10",
                border: "border-fuchsia-500/20",
                glow: "group-hover:shadow-[0_0_30px_rgba(217,70,239,0.2)]"
              }
            ].map((f, idx) => (
              <div key={idx} className={`bg-[#131B2F]/50 backdrop-blur-lg border border-white/5 rounded-3xl p-8 hover:-translate-y-2 transition-all duration-300 group ${f.glow} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                  <f.icon className="text-8xl -mr-6 -mt-6 transform rotate-12" />
                </div>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${f.bg} ${f.border} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 relative z-10`}>
                  <f.icon className={`text-2xl ${f.color}`} />
                </div>
                <h4 className="text-xl font-bold text-white mb-3 relative z-10">{f.title}</h4>
                <p className="text-gray-400 leading-relaxed text-sm relative z-10">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#080C14] border-t border-white/5 pt-20 pb-10 z-20 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid gap-12 lg:grid-cols-12 md:grid-cols-2">

          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-blue-500 flex items-center justify-center shadow-lg">
                <FaHome className="text-white text-xl" />
              </div>
              <h4 className="text-2xl font-bold text-white">Zyrra<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Stay</span></h4>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Next-generation campus and residential infrastructure. Crafted with precision for speed, security, and absolute transparency.
            </p>
            <div className="flex gap-4 mt-8">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-blue-500/50 hover:border-blue-500/50 hover:-translate-y-2 hover:scale-110 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-blue-500/50">
                <span className="sr-only">Twitter</span>
                <FaTwitter className="text-lg" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-700/50 hover:border-gray-500/50 hover:-translate-y-2 hover:scale-110 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-gray-500/50">
                <span className="sr-only">GitHub</span>
                <FaGithub className="text-lg" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-600/50 hover:border-indigo-500/50 hover:-translate-y-2 hover:scale-110 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-indigo-500/50">
                <span className="sr-only">LinkedIn</span>
                <FaLinkedin className="text-lg" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-3 lg:col-start-6">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-[0.15em] mb-6">Portals</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/login" className="hover:text-purple-400 transition-colors flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-purple-500"></div> Student Access</Link></li>
              <li><Link to="/login" className="hover:text-blue-400 transition-colors flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-blue-500"></div> Parent Gateway</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-emerald-500"></div> Warden Console</Link></li>
              <li><Link to="/AdminLogin" className="hover:text-fuchsia-400 transition-colors flex items-center gap-2 font-medium"><div className="w-1.5 h-1.5 rounded-sm bg-fuchsia-500"></div> Administrator</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-[0.15em] mb-6 flex items-center gap-2">
              <FaPhoneAlt className="text-purple-400" /> Connect
            </h4>
            <div className="space-y-4 bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/20">
                  <FaEnvelope className="text-lg" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">hello@zyrrastay.com</p>
                  <p className="text-xs text-gray-500 mt-1">Enterprise systems & support</p>
                </div>
              </div>
              <div className="h-px w-full bg-white/5"></div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20">
                  <FaPhoneAlt className="text-lg" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">+91 8471041134</p>
                  <p className="text-xs text-gray-500 mt-1">Available 24/7</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs sm:text-sm text-gray-500">
          <p>© {new Date().getFullYear()} ZyrraStay Technology. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0 font-medium">
            <Link to="/privacy-policy" className="hover:text-blue-400 cursor-pointer transition-colors">Privacy Framework</Link>
            <Link to="/terms-of-use" className="hover:text-blue-400 cursor-pointer transition-colors">Terms of Use</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
