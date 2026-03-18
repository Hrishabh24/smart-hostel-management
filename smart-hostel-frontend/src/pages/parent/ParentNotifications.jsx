import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaBell } from "react-icons/fa";

function ParentNotifications() {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          "http://localhost:2008/parent/notifications",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNotes(data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Unable to load notifications");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetch();
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
      <p className="text-gray-400 mb-8">Stay updated with alerts and messages regarding your ward.</p>
      
      {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}
      {loading && <p className="text-blue-400 mb-4">Loading notifications...</p>}
      
      {!loading && notes.length === 0 ? (
        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-lg rounded-xl p-8 text-center">
          <FaBell className="text-4xl text-gray-500 mx-auto mb-4 opacity-50" />
          <p className="text-gray-400 font-medium">No new notifications</p>
        </div>
      ) : (
        <ul className="space-y-4 max-w-3xl">
          {notes.map((n, i) => (
            <li key={i} className="flex gap-4 p-5 bg-gradient-to-r from-[#131B2F]/80 to-[#1A2540]/80 backdrop-blur-md border border-white/5 rounded-xl shadow-lg hover:shadow-blue-500/10 transition group">
              <div className="bg-blue-500/20 p-3 rounded-full h-fit text-blue-400 group-hover:bg-blue-500/40 transition">
                <FaBell className="text-lg" />
              </div>
              <div className="flex-1">
                <p className="text-white text-lg font-medium mb-1">{n.message}</p>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 font-medium">
                    {new Date(n.created_at).toLocaleString(undefined, {
                      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                  {!n.readStatus && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ParentNotifications;
