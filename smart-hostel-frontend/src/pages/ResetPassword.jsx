import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("http://localhost:2008/reset-password", {
        token,
        newPassword,
      });
      setMessage(res.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0F19] p-6">
      <div className="w-full max-w-md bg-[#131B2F]/80 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-purple-400 mb-6 text-center">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit}>
          {/* New Password */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              className="w-full p-3 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#43A047]"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError("");
                setMessage("");
              }}
              required
            />
            <span
              className="absolute right-3 top-3 cursor-pointer text-gray-400"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirm Password */}
          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full p-3 mb-4 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#43A047]"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError("");
              setMessage("");
            }}
            required
          />

          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 text-green-500 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full bg-gradient-to-br from-purple-600 to-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-[#131B2F]/10 transition flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;