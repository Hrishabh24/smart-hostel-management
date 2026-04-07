/* eslint-disable */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, Star, Clock, AlertCircle } from "lucide-react";

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const API = "http://localhost:2008"; // Fallback if needed

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API}/admin/feedbacks`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFeedbacks(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
        setError("Failed to load feedbacks.");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedbacks();
  }, [API]);

  const filteredFeedbacks = feedbacks.filter(fb =>
    (fb.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (fb.email || "").toLowerCase().includes(search.toLowerCase()) ||
    (fb.message || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">User Feedback</h1>
        <p className="text-gray-400">View and analyze feedback submitted from the home page.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-[#131B2F]/80 backdrop-blur-md p-4 rounded-2xl border border-white/5 mb-6 flex items-center gap-3">
        <Search className="text-gray-400 w-5 h-5 ml-2" />
        <input
          type="text"
          placeholder="Search by name, email, or content..."
          className="bg-transparent border-none outline-none text-white w-full placeholder-gray-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 flex flex-col items-center justify-center gap-4">
          <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <p className="font-medium tracking-wide">Loading feedbacks...</p>
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="text-center py-20 text-gray-500 bg-[#131B2F]/30 rounded-3xl border border-white/5 shadow-inner">
          <p className="font-medium tracking-widest uppercase text-sm">No feedbacks found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFeedbacks.map((fb) => (
            <div key={fb.id} className="bg-gradient-to-br from-[#1B243B]/80 to-[#131B2F]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:border-purple-500/50 hover:shadow-[0_10px_30px_rgba(168,85,247,0.15)] transition-all duration-300 flex flex-col group relative overflow-hidden h-[300px]">
              {/* Decorative Background Element */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 blur-[30px] group-hover:bg-purple-500/20 transition-all duration-500 rounded-full"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-blue-600 flex items-center justify-center text-white font-black text-lg shadow-[0_5px_15px_rgba(147,51,234,0.3)]">
                    {fb.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg tracking-wide leading-tight">{fb.name}</h3>
                    <a href={`mailto:${fb.email}`} className="text-xs text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider font-semibold">{fb.email}</a>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#0B0F19]/60 p-5 rounded-2xl mb-5 border border-white/5 h-32 overflow-y-auto shadow-inner relative z-10">
                <p className="text-gray-300 text-sm leading-relaxed">"{fb.message}"</p>
              </div>
              
              <div className="flex items-center justify-between mt-auto relative z-10 border-t border-white/5 pt-4">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold tracking-wide uppercase">
                  <Clock className="w-3.5 h-3.5 text-purple-400/70" />
                  <span>{new Date(fb.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'})}</span>
                </div>
                <div className="flex bg-[#0B0F19] px-3 py-1.5 rounded-xl border border-white/5 items-center gap-1.5 shadow-sm">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" />
                  <span className="text-white font-bold text-sm leading-none">{fb.rating}/5</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
