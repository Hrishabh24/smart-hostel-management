import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Loader from "./components/Loader";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:2008/login", {
        email,
        password,
      });

      const { token, role } = res.data;

      // ❌ Block admin from this page
      if (role === "admin") {
        setError("Admin cannot login from this page.");
        setLoading(false);
        return;
      }

      // ✅ Save token & role
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      // 🔥 Role Based Redirect
      if (role === "warden") {
        navigate("/warden-dashboard");
      } else if (role === "parent") {
        navigate("/parent-dashboard");
      } else {
        navigate("/dashboard"); // student default
      }

    } catch (err) {
      setError(err.response?.data?.message || "Login Failed");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0F19] p-6 relative overflow-hidden">
      
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />

      <div className="flex w-full max-w-5xl bg-[#131B2F]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative z-10">

        {/* LEFT PANEL */}
        <div className="hidden md:flex flex-col justify-center p-12 w-1/2 bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-r border-white/5 text-white relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
          
          <div className="relative z-10">
            <h2 className="text-4xl font-extrabold mb-4 tracking-tight">
              Zyrra<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Stay</span>
            </h2>

            <p className="text-lg mb-8 text-gray-300 leading-relaxed">
              Experience the next evolution of campus living. Secure, transparent, and effortlessly smart.
            </p>

            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div> FinTech Grade Security</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Role Based Access</li>
              <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Real-Time Sync Ecosystem</li>
            </ul>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col justify-center p-10 w-full md:w-1/2 bg-[#0B0F19]/50">
          <h2 className="text-3xl font-bold text-white mb-8">
            Welcome Back
          </h2>

          <form onSubmit={handleLogin}>

            {/* Email */}
            <input
              type="email"
              placeholder="Email Address"
              className="w-full p-4 mb-5 bg-[#131B2F] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-500"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
            />

            {/* Password with Eye */}
            <div className="relative mb-6">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full p-4 bg-[#131B2F] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-500 pr-12"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                required
              />

              <span
                className="absolute right-4 top-4 cursor-pointer text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </span>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 text-red-500 text-sm">
                {error}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-xl font-bold shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] transform hover:-translate-y-0.5 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader inline className="h-5 w-5 text-white" size={18} />
              ) : (
                "Authenticate"
              )}
            </button>

          </form>

          {/* Links */}
          <div className="mt-8 text-center text-sm text-gray-400 space-y-3">
            <p>
              New to ZyrraStay?{" "}
              <Link
                to="/signup"
                className="text-purple-400 font-semibold hover:text-purple-300 hover:underline transition-colors"
              >
                Create Account
              </Link>
            </p>

            <p>
              <Link
                to="/forgot-password"
                className="text-blue-400 font-semibold hover:text-blue-300 hover:underline transition-colors"
              >
                Forgot Intelligence Key?
              </Link>
            </p>

            <div className="pt-4 border-t border-white/5 mt-4">
              <p>
                <Link
                  to="/AdminLogin"
                  className="text-fuchsia-400 font-semibold hover:text-fuchsia-300 hover:underline transition-colors"
                >
                  Administrator Portal
                </Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;
