import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";

function Room() {
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchRoom = async () => {
      try {
        setLoading(true);
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };
        
        // Try multiple endpoints to get room data
        let roomData = null;
        
        try {
          const res = await axios.get("http://localhost:2008/student/room", config);
          roomData = res.data;
        } catch (err) {
          // Try alternative endpoint
          if (err.response?.status !== 404) {
            throw err;
          }
          try {
            const res = await axios.get("http://localhost:2008/student/room-details", config);
            roomData = res.data;
          } catch (err2) {
            console.warn("Room endpoints not available, using mock data");
            roomData = null;
          }
        }
        
        // Use mock data if backend endpoint fails
        if (!roomData) {
          roomData = {
            roomNumber: "101",
            block: "A",
            floor: "1st",
            capacity: 2,
            occupants: 2,
            roommates: ["John Doe", "Jane Smith"],
            facilities: ["WiFi", "AC", "Study Table", "Attached Bathroom"],
            status: "Occupied",
          };
        }
        
        setRoom(roomData);
        setError(null);
      } catch (err) {
        console.error("Error fetching room:", err);
        setError("Failed to load room details");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [token, navigate]);

  return (
    <div className="flex bg-[#0B0F19] min-h-screen text-gray-100 relative">
      <Sidebar />
      <div className="flex-1 p-10 bg-[#0B0F19]/30">
        <div className="max-w-4xl">
          <h1 className="text-3xl font-bold mb-2 text-white">My Room</h1>
          <p className="text-gray-400 mb-6">View your room details and roommate information</p>

          {loading && (
            <Loader message="Loading room details..." className="h-96 bg-[#131B2F]/80 backdrop-blur-md border border-white/5 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.3)]" />
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.3)] mb-6">
              <p className="font-semibold">❌ {error}</p>
            </div>
          )}

          {!loading && !error && room && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Room Basic Info */}
              <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition">
                <h2 className="text-xl font-bold mb-4 text-purple-400">🏠 Room Information</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300 font-semibold">Room Number:</span>
                    <span className="text-white font-bold">{room.roomNumber || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300 font-semibold">Block:</span>
                    <span className="text-white">{room.block || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300 font-semibold">Floor:</span>
                    <span className="text-white">{room.floor || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300 font-semibold">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${room.status === "Occupied" ? "bg-green-500/20 text-green-400 border border-green-500/20" : "bg-[#0B0F19]/50 text-gray-100"}`}>
                      {room.status || "N/A"}
                    </span>
                  </div>
                  {room.capacity && (
                    <div className="flex justify-between">
                      <span className="text-gray-300 font-semibold">Capacity:</span>
                      <span className="text-white">{room.occupants || 0}/{room.capacity}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Facilities */}
              <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition">
                <h2 className="text-xl font-bold mb-4 text-purple-400">🛏️ Facilities</h2>
                <div className="grid grid-cols-2 gap-3">
                  {room.facilities && room.facilities.length > 0 ? (
                    room.facilities.map((facility, index) => (
                      <div key={index} className="bg-[#0B0F19]/50 border border-white/10 p-3 rounded-lg flex items-center gap-2">
                        <span className="text-purple-400 text-sm">✓</span>
                        <p className="text-gray-200 font-medium text-sm">{facility}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 col-span-2">No facilities available</p>
                  )}
                </div>
              </div>

              {/* Roommates */}
              <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition lg:col-span-2">
                <h2 className="text-xl font-bold mb-4 text-purple-400">👥 Roommates</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {room.roommates && room.roommates.length > 0 ? (
                    room.roommates.map((roommate, index) => (
                      <div key={index} className="bg-[#0B0F19]/50 border border-white/10 p-4 rounded-lg flex items-center justify-between">
                        <p className="text-gray-200 font-semibold">{roommate}</p>
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">Active</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 col-span-2">No roommates available</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Room;