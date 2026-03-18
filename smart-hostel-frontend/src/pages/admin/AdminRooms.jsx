import { useEffect, useState } from "react";
import axios from "axios";

function AdminRooms() {
  const token = localStorage.getItem("token");
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState({ roomNumber: "", capacity: 2, block: "A", floor: "1st" });
  const [loading, setLoading] = useState(false);

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const res = await axios.get("http://localhost:2008/admin/rooms", config);
      setRooms(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("http://localhost:2008/admin/rooms", newRoom, config);
      setNewRoom({ roomNumber: "", capacity: 2, block: "A", floor: "1st" });
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomNumber) => {
    if (!window.confirm(`Are you sure you want to delete room ${roomNumber}? This will unassign any students in it.`)) return;
    try {
      await axios.delete(`http://localhost:2008/admin/rooms/${roomNumber}`, config);
      fetchRooms();
      alert("Room deleted successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete room");
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Room Management</h1>
      </div>

      <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Add New Room</h2>
        <form onSubmit={handleCreateRoom} className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Room Number</label>
            <input type="text" required value={newRoom.roomNumber} onChange={e => setNewRoom({...newRoom, roomNumber: e.target.value})} className="border p-2 rounded" placeholder="e.g. 101" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Capacity</label>
            <input type="number" required min="1" value={newRoom.capacity} onChange={e => setNewRoom({...newRoom, capacity: e.target.value})} className="border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Block</label>
            <input type="text" required value={newRoom.block} onChange={e => setNewRoom({...newRoom, block: e.target.value})} className="border p-2 rounded w-24" placeholder="e.g. A" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Floor</label>
            <input type="text" required value={newRoom.floor} onChange={e => setNewRoom({...newRoom, floor: e.target.value})} className="border p-2 rounded w-24" placeholder="e.g. 1st" />
          </div>
          <button type="submit" disabled={loading} className="bg-gradient-to-br from-purple-600 to-blue-600 hover:bg-[#131B2F]/10 text-white px-4 py-2 rounded font-medium transition">
            {loading ? "Creating..." : "Create Room"}
          </button>
        </form>
      </div>

      <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-lg p-6">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
              <th className="p-3 text-left text-gray-300">Room Number</th>
              <th className="p-3 text-left text-gray-300">Capacity</th>
              <th className="p-3 text-left text-gray-300">Occupied</th>
              <th className="p-3 text-left text-gray-300">Status</th>
              <th className="p-3 text-left text-gray-300">Action</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room, index) => (
              <tr key={index} className="border-b border-white/10">
                <td className="p-3">{room.roomNumber}</td>
                <td className="p-3">{room.capacity}</td>
                <td className="p-3">{room.occupied}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded text-sm ${room.status === 'Available' ? 'bg-green-500/20 text-green-400 border border-green-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
                    {room.status}
                  </span>
                </td>
                <td className="p-3">
                  <button onClick={() => handleDeleteRoom(room.roomNumber)} className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AdminRooms;