import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function Leave() {
  const navigate = useNavigate();
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // Load leave history
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const res = await axios.get("http://localhost:2008/student/leave-history", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(res.data);
      } catch (err) {
        console.error("Unable to fetch leave history:", err);
      }
    };
    fetchHistory();

  }, [token]);

  const submitLeave = async () => {
    if (!token) {
      setError("Session expired. Please login again.");
      navigate("/login");
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
        "http://localhost:2008/student/leave",
        { reason, startDate, endDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Leave Request Submitted ✅");
      setReason("");
      setStartDate("");
      setEndDate("");

      // Update history list immediately
      const res = await axios.get("http://localhost:2008/student/leave-history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistory(res.data);
    } catch (err) {

      console.error("Leave error:", err);
      setError(err.response?.data?.message || "Failed to submit leave request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex bg-[#0B0F19] min-h-screen text-gray-100 relative">
      <Sidebar />
      <div className="flex-1 p-10">
        <div className="flex flex-col sm:flex-row sm:items-start w-full gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">Leave Requests</h2>

            {error && <p className="text-red-600 mb-4 font-semibold">{error}</p>}
            {success && <p className="text-green-600 mb-4 font-semibold">{success}</p>}

            <input
              type="text"
              className="border p-3 w-full rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Reason for leave"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
            />

            <input
              type="date"
              className="border p-3 w-full rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={loading}
            />

            <input
              type="date"
              className="border p-3 w-full rounded mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              disabled={loading}
            />

            <button
              onClick={submitLeave}
              disabled={loading}
              className={`px-6 py-2 rounded font-semibold ${loading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
                }`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">Leave History</h2>
            {history.length === 0 ? (
              <p className="text-gray-400">No leave requests found.</p>
            ) : (
              <ul className="space-y-4 max-h-96 overflow-y-auto">
                {history.map((l, idx) => (
                  <li key={idx} className="p-4 bg-[#131B2F]/80 backdrop-blur-md border border-white/5 rounded shadow-sm">
                    <p className="mb-1">{l.reason}</p>
                    <p className="text-xs text-gray-400">
                      {l.startDate} to {l.endDate}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Leave;