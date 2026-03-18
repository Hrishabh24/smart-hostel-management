import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:2008/student/notifications", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNotifications(res.data);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };


    fetchNotifications();
  }, [token, navigate]);

  return (
    <div className="flex bg-[#0B0F19] min-h-screen text-gray-100 relative">
      <Sidebar />
      <div className="flex-1 p-10">
        <h2 className="text-2xl font-bold mb-6">Notifications</h2>

        {loading && <p className="text-gray-400">Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && !error && (
          <ul className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-gray-400">No notifications.</p>
            ) : (
              notifications.map((n) => (
                <li key={n.id} className="p-4 bg-[#131B2F]/80 backdrop-blur-md border border-white/5 rounded shadow-sm">
                  <p className="mb-1">{n.message}</p>
                  <p className="text-xs text-gray-400">{n.date}</p>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Notifications;