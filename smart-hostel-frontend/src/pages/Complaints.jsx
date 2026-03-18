import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function Complaints() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    // load previous complaints
    const fetchHistory = async () => {
      if (!token) return;
      try {
        const res = await axios.get("http://localhost:2008/student/complaints", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistory(res.data);
      } catch (err) {
        console.error("Unable to fetch complaints history:", err);
      }
    };
    fetchHistory();
  }, [token]);

  const submitComplaint = async () => {
    if (!token) {
      setError("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    // optimistic update: clear previous history

    if (!message.trim()) {
      setError("Please enter a complaint message");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await axios.post(
        "http://localhost:2008/complaint",
        { message },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess("Complaint Submitted ✅");
      setMessage("");
      // add to history at top
      setHistory((prev) => [
        { message, created_at: new Date().toISOString() },
        ...prev,
      ]);
      alert("Complaint Submitted ✅");
    } catch (err) {
      console.error("Complaint error:", err);
      if (err.response?.status === 401) {
        setError("Authentication failed. Please login again.");
        localStorage.clear();
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Failed to submit complaint");
      }
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
            <h2 className="text-2xl font-bold mb-4">Raise Complaint</h2>

            {error && <p className="text-red-600 mb-4 font-semibold">{error}</p>}
            {success && <p className="text-green-600 mb-4 font-semibold">{success}</p>}

            <textarea
              className="border p-3 w-full rounded focus:outline-none focus:ring-2 focus:ring-green-400"
              rows="5"
              placeholder="Describe your issue or request..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
            />

            <button
              onClick={submitComplaint}
              disabled={loading}
              className={`mt-4 px-6 py-2 rounded font-semibold ${
                loading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700"
              }`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-4">Your Complaints</h2>
            {history.length === 0 ? (
              <p className="text-gray-400">No past complaints found.</p>
            ) : (
              <ul className="space-y-4 max-h-96 overflow-y-auto">
                {history.map((c, idx) => (
                  <li
                    key={idx}
                    className="p-4 bg-[#131B2F]/80 backdrop-blur-md border border-white/5 rounded shadow-sm flex justify-between items-start"
                  >
                    <div>
                      <p className="mb-1">{c.message}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(c.created_at).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${c.status === 'resolved' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'}`}>
                      {c.status || 'pending'}
                    </span>
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

export default Complaints;
