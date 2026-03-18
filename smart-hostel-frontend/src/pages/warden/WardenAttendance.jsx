import { useEffect, useState } from "react";
import axios from "axios";

function WardenAttendance() {
  const token = localStorage.getItem("token");
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:2008/warden/attendance", config);
      setAttendance(res.data);
    } catch (err) {
      console.log(err);
      // Use mock data
      setAttendance([
        { id: 1, name: "John Doe", date: "2026-03-09", status: "present" },
        { id: 2, name: "Jane Smith", date: "2026-03-09", status: "present" },
        { id: 3, name: "Mike Johnson", date: "2026-03-09", status: "absent" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-8 text-white">Attendance Management</h1>

      <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-lg p-6">
        {loading ? (
          <p className="text-gray-400">Loading attendance...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                <th className="p-3 text-left text-gray-300">Name</th>
                <th className="p-3 text-left text-gray-300">Date</th>
                <th className="p-3 text-left text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record.id} className="border-b border-white/10 hover:bg-[#0B0F19]/30">
                  <td className="p-3">{record.name}</td>
                  <td className="p-3">{record.date}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${record.status === "present" ? "bg-green-500/20 text-green-400 border border-green-500/20" : "bg-red-500/20 text-red-400 border border-red-500/20"}`}>
                      {record.status}
                    </span>
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

export default WardenAttendance;