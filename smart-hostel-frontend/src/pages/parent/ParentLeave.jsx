import React, { useEffect, useState } from "react";
import axios from "axios";

function ParentLeave() {
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    if (!token) return;
    try {
      const { data } = await axios.get(
        "http://localhost:2008/parent/leave-history",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Unable to load leave history");
    }
  };

  const submitLeave = async () => {
    if (!token) {
      setError("Session expired. Please login again.");
      return;
    }

    if (!reason.trim() || !startDate || !endDate) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(
        "http://localhost:2008/parent/leave",
        { reason, startDate, endDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Leave Request Submitted ✅");
      setReason("");
      setStartDate("");
      setEndDate("");

      fetchHistory();
    } catch (err) {
      console.error("Leave error:", err);
      setError(err.response?.data?.message || "Failed to submit leave request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-start w-full gap-8">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white mb-6">Leave Request (For Ward)</h1>

          {error && <p className="text-red-600 mb-4 font-semibold">{error}</p>}
          {success && <p className="text-green-600 mb-4 font-semibold">{success}</p>}

          <input
            type="text"
            className="bg-[#131B2F]/80 text-white border border-white/5 p-3 w-full rounded mb-4 focus:outline-none focus:border-purple-400"
            placeholder="Reason for leave"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
          />

          <input
            type="date"
            className="bg-[#131B2F]/80 text-white border border-white/5 p-3 w-full rounded mb-4 focus:outline-none focus:border-purple-400"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={loading}
          />

          <input
            type="date"
            className="bg-[#131B2F]/80 text-white border border-white/5 p-3 w-full rounded mb-4 focus:outline-none focus:border-purple-400"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={loading}
          />

          <button
            onClick={submitLeave}
            disabled={loading}
            className={`px-6 py-2 rounded font-semibold transition ${loading
                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:opacity-90 shadow-lg hover:shadow-purple-500/30"
              }`}
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-6">Leave History</h2>
          {history.length === 0 ? (
            <p className="text-gray-400">No leave records found.</p>
          ) : (
            <ul className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
              {history.map((l, idx) => (
                <li key={idx} className="p-4 bg-[#131B2F]/80 backdrop-blur-md border border-white/5 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-white">{l.reason}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      l.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      l.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {l.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {l.startDate} to {l.endDate}
                  </p>
                  <p className="text-xs text-blue-400 mt-2 capitalize font-medium">
                    Requested by: {l.requestedBy || 'student'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default ParentLeave;
