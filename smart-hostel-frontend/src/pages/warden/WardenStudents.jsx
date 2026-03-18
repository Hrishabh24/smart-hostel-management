import { useEffect, useState } from "react";
import axios from "axios";

function WardenStudents() {
  const token = localStorage.getItem("token");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:2008/warden/students", config);
      setStudents(res.data);
    } catch (err) {
      console.log(err);
      // Use mock data
      setStudents([
        { id: 1, name: "John Doe", email: "john@example.com", roomNumber: "101", status: "Active" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", roomNumber: "102", status: "Active" },
        { id: 3, name: "Mike Johnson", email: "mike@example.com", roomNumber: "103", status: "Active" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRoom = async (studentId, currentRoom) => {
    const action = currentRoom ? "reassign" : "assign";
    const newRoom = window.prompt(`Enter new room number to ${action}:`, currentRoom || "");
    if (!newRoom || newRoom === currentRoom) return;

    try {
      await axios.put("http://localhost:2008/warden/assign-room", { studentId, roomNumber: newRoom }, config);
      fetchStudents();
      alert(`Room ${action}ed successfully!`);
    } catch (err) {
      alert("Failed to assign room. Make sure the room exists.");
    }
  };

  const handleUnassignRoom = async (studentId, currentRoom) => {
    if (!currentRoom) return;
    if (!window.confirm(`Are you sure you want to remove room ${currentRoom} from this student?`)) return;

    try {
      await axios.put("http://localhost:2008/warden/unassign-room", { studentId, roomNumber: currentRoom }, config);
      fetchStudents();
      alert("Room removed successfully!");
    } catch (err) {
      alert("Failed to remove room assignment.");
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-8 text-white">Students List</h1>

      <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-lg p-6">
        {loading ? (
          <p className="text-gray-400">Loading students...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                <th className="p-3 text-left text-gray-300">Name</th>
                <th className="p-3 text-left text-gray-300">Email</th>
                <th className="p-3 text-left text-gray-300">Room</th>
                <th className="p-3 text-left text-gray-300">Status</th>
                <th className="p-3 text-left text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id} className="border-b border-white/10 hover:bg-[#0B0F19]/30">
                  <td className="p-3">{student.name}</td>
                  <td className="p-3">{student.email}</td>
                  <td className="p-3">
                    {student.roomNumber || student.room ? (
                      <span className="bg-green-500/20 text-green-400 border border-green-500/20 px-2 py-1 rounded text-sm font-medium">
                        Assigned ({student.roomNumber || student.room})
                      </span>
                    ) : (
                      <span className="bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-1 rounded text-sm font-medium">
                        Not Assigned
                      </span>
                    )}
                  </td>
                  <td className="p-3">{student.status}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={() => handleAssignRoom(student.id, student.roomNumber || student.room)} className="text-sm bg-gradient-to-br from-purple-600 to-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded">
                      {student.roomNumber || student.room ? "Reassign" : "Assign"}
                    </button>
                    {(student.roomNumber || student.room) && (
                      <button onClick={() => handleUnassignRoom(student.id, student.roomNumber || student.room)} className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default WardenStudents;