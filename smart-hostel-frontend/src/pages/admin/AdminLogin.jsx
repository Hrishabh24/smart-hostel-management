import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API = "https://smart-hostel-api-rm6j.onrender.com"; // ✅ FIXED

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API}/login`, {
        email,
        password,
      });

      console.log("Response:", res.data); // 🔍 Debug

      const { token, role } = res.data;

      if (role !== "admin") {
        setError("Access denied. Admin only.");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      navigate("/admin-dashboard");

    } catch (err) {
      console.error("Login Error:", err); // 🔍 Debug

      setError(
        err.response?.data?.message ||
        err.message ||
        "Login Failed"
      );
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0F19] px-4 relative overflow-hidden">
      
      {/* Background Effect */}
      <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] rounded-full bg-fuchsia-600/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-[#131B2F]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 relative z-10">

        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-t-3xl"></div>

        <h2 className="text-3xl font-extrabold text-center text-white mt-4 tracking-tight">
          Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Portal</span>
        </h2>

        <p className="text-center text-gray-400 mt-2 mb-8 text-sm">
          Please enter your credentials to access the management dashboard.
        </p>

        <form onSubmit={handleAdminLogin}>

          {/* Email */}
          <div className="mb-5">
            <label className="block text-gray-300 mb-2 font-medium text-sm text-left">
              Email Address
            </label>
            <input
              type="email"
              placeholder="admin@hostel.com"
              className="w-full p-4 bg-[#0B0F19] border border-white/10 text-white rounded-xl"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              required
            />
          </div>

          {/* Password */}
          <div className="mb-5 relative">
            <label className="block text-gray-300 mb-2 font-medium text-sm text-left">
              Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full p-4 bg-[#0B0F19] border border-white/10 text-white rounded-xl"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              required
            />

            <span
              className="absolute right-4 top-[2.7rem] cursor-pointer text-sm text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </span>

            <div className="text-right mt-3 text-sm">
              <Link
                to="/forgot-password"
                className="text-fuchsia-400 font-medium hover:underline"
              >
                Forgot Intelligence Key?
              </Link>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-xl font-bold"
          >
            {loading ? "Loading..." : "Access System →"}
          </button>

        </form>

        <div className="mt-8 text-center text-gray-400 text-sm border-t pt-6">
          System Issue?{" "}
          <span className="text-purple-400 font-medium cursor-pointer">
            Contact Tech Core
          </span>
        </div>

      </div>
    </div>
  );
}

export default AdminLogin;
