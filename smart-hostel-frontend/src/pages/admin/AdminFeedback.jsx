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
        <div className="text-center py-10 text-gray-400">Loading feedbacks...</div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="text-center py-10 text-gray-500 bg-[#131B2F]/30 rounded-2xl border border-white/5">
          No feedbacks found.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFeedbacks.map((fb) => (
            <div key={fb.id} className="bg-[#1B243B] border border-white/5 rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">{fb.name}</h3>
                  <a href={`mailto:${fb.email}`} className="text-sm text-blue-400 hover:underline">{fb.email}</a>
                </div>
                <div className="flex bg-[#0B0F19] px-2 py-1 rounded-lg border border-white/5 items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-white font-bold text-sm">{fb.rating}/5</span>
                </div>
              </div>
              
              <div className="bg-[#0B0F19]/50 p-4 rounded-xl mb-4 border border-white/5 h-32 overflow-y-auto">
                <p className="text-gray-300 text-sm">{fb.message}</p>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-500 mt-auto">
                <Clock className="w-3.5 h-3.5" />
                <span>{new Date(fb.created_at).toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
