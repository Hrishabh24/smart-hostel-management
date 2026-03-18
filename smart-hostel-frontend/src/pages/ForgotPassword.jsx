import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await axios.post("http://localhost:2008/forgot-password", {
        email,
      });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0F19] p-6">
      <div className="w-full max-w-md bg-[#131B2F]/80 backdrop-blur-md border border-white/5 rounded-2xl shadow-xl p-8">
        <h2 className="text-2xl font-semibold text-purple-400 mb-6 text-center">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email address"
            className="w-full p-3 mb-4 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#43A047]"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
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
            disabled={loading}
            className="w-full bg-gradient-to-br from-purple-600 to-blue-600 text-white p-3 rounded-lg font-semibold hover:bg-[#131B2F]/10 transition flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Send Reset Email"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-white">
          <p>
            Remember your password?{" "}
            <Link
              to="/login"
              className="text-purple-400 font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;