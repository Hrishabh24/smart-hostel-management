import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

function WardMainDashboard() {
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({
    totalStudents: 0,
    presentStudents: 0,
    absentStudents: 0,
    complaints: 0,
    leaveRequests: 0,
  });

  const [attendanceData, setAttendanceData] = useState([]);
  const [complaintsData, setComplaintsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchStats();
    fetchChartsData();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const [studentsRes, attendanceRes, complaintsRes, leaveRes] = await Promise.allSettled([
        axios.get("http://localhost:2008/warden/students", config),
        axios.get("http://localhost:2008/warden/attendance", config),
        axios.get("http://localhost:2008/warden/complaints", config),
        axios.get("http://localhost:2008/warden/leave-requests", config)
      ]);

      const totalStudents = studentsRes.status === 'fulfilled' ? studentsRes.value.data.length : 0;
      
      let presentStudents = 0;
      let absentStudents = 0;
      if (attendanceRes.status === 'fulfilled') {
        presentStudents = attendanceRes.value.data.filter((s) => s.status === 'present').length;
        absentStudents = totalStudents - presentStudents;
      }

      const complaints = complaintsRes.status === 'fulfilled' ? complaintsRes.value.data.filter((c) => c.status !== "resolved").length : 0;
      const leaveRequests = leaveRes.status === 'fulfilled' ? leaveRes.value.data.filter((l) => l.status === "pending").length : 0;

      setStats({
        totalStudents,
        presentStudents,
        absentStudents,
        complaints,
        leaveRequests,
      });

      if (studentsRes.status === 'rejected' || attendanceRes.status === 'rejected' || complaintsRes.status === 'rejected' || leaveRes.status === 'rejected') {
        console.error("Some stats failed to load. Check backend endpoints.");
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartsData = async () => {
    try {
      // Try to fetch chart data from backend, otherwise use mock
      setAttendanceData([
        { name: "Monday", present: 40, absent: 5 },
        { name: "Tuesday", present: 42, absent: 3 },
        { name: "Wednesday", present: 39, absent: 6 },
        { name: "Thursday", present: 41, absent: 4 },
        { name: "Friday", present: 38, absent: 7 },
      ]);

      setComplaintsData([
        { name: "Maintenance", value: 25 },
        { name: "Cleanliness", value: 35 },
        { name: "Noise", value: 20 },
        { name: "Others", value: 20 },
      ]);
    } catch (err) {
      console.error("Error fetching chart data:", err);
    }
  };

  const percentagePresent = stats.totalStudents > 0
    ? ((stats.presentStudents / stats.totalStudents) * 100).toFixed(1)
    : 0;

  return (
    <>
      <h1 className="text-3xl font-bold mb-8 text-white">
        Warden Dashboard
      </h1>

      {error && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 rounded-xl hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition">
              <h3 className="text-lg font-semibold text-gray-300">Total Students</h3>
              <p className="text-3xl text-blue-400 font-bold mt-2">
                {stats.totalStudents}
              </p>
            </div>

            <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 rounded-xl hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition">
              <h3 className="text-lg font-semibold text-gray-300">Present Today</h3>
              <p className="text-3xl text-green-600 font-bold mt-2">
                {stats.presentStudents}
              </p>
              <p className="text-sm text-gray-400 mt-2">{percentagePresent}%</p>
            </div>

            <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 rounded-xl hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition">
              <h3 className="text-lg font-semibold text-gray-300">Absent Today</h3>
              <p className="text-3xl text-red-600 font-bold mt-2">
                {stats.absentStudents}
              </p>
            </div>

            <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 rounded-xl hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition">
              <h3 className="text-lg font-semibold text-gray-300">Open Complaints</h3>
              <p className="text-3xl text-orange-600 font-bold mt-2">
                {stats.complaints}
              </p>
            </div>

            <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 rounded-xl hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition">
              <h3 className="text-lg font-semibold text-gray-300">Leave Requests</h3>
              <p className="text-3xl text-purple-600 font-bold mt-2">
                {stats.leaveRequests}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">Weekly Attendance</h3>
              <BarChart width={500} height={300} data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="present" fill="#4CAF50" />
                <Bar dataKey="absent" fill="#F44336" />
              </BarChart>
            </div>

            <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-4">Complaints by Type</h3>
              <PieChart width={500} height={300}>
                <Pie
                  data={complaintsData}
                  cx={250}
                  cy={150}
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {complaintsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#1976D2', '#FF9800', '#F44336', '#4CAF50'][index % 4]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default WardMainDashboard;