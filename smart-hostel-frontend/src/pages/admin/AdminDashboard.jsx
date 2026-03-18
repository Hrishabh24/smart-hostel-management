import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

function AdminDashboard() {
  const token = localStorage.getItem("token");

  const [stats, setStats] = useState({
    students: 0,
    rooms: 0,
    complaints: 0,
    fees: 0,
  });

  const [attendanceData, setAttendanceData] = useState([]);
  const [feesData, setFeesData] = useState([]);
  const [complaintsData, setComplaintsData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchStats();
    fetchChartsData();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const studentsRes = await axios.get("http://localhost:2008/admin/students", config);
      const roomsRes = await axios.get("http://localhost:2008/admin/rooms", config);
      const complaintsRes = await axios.get("http://localhost:2008/admin/complaints", config);
      const feesRes = await axios.get("http://localhost:2008/admin/fees", config);

      setStats({
        students: studentsRes.data.length,
        rooms: roomsRes.data.length,
        complaints: complaintsRes.data.length,
        fees: feesRes.data.length,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const fetchChartsData = async () => {
    try {
      // Assuming endpoints for chart data
      const attendanceRes = await axios.get("http://localhost:2008/admin/attendance-chart", config);
      const feesRes = await axios.get("http://localhost:2008/admin/fees-chart", config);
      const complaintsRes = await axios.get("http://localhost:2008/admin/complaints-chart", config);

      setAttendanceData(attendanceRes.data);
      setFeesData(feesRes.data);
      setComplaintsData(complaintsRes.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const res = await axios.get("http://localhost:2008/admin/recent-activity", config);
      setRecentActivity(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-8 text-white">
        Admin Dashboard
      </h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 rounded-xl">
          <h3 className="text-lg font-semibold">Total Students</h3>
          <p className="text-3xl text-purple-400 font-bold">
            {stats.students}
          </p>
        </div>

        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 rounded-xl">
          <h3 className="text-lg font-semibold">Total Rooms</h3>
          <p className="text-3xl text-purple-400 font-bold">
            {stats.rooms}
          </p>
        </div>

        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 rounded-xl">
          <h3 className="text-lg font-semibold">Total Complaints</h3>
          <p className="text-3xl text-purple-400 font-bold">
            {stats.complaints}
          </p>
        </div>

        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 rounded-xl">
          <h3 className="text-lg font-semibold">Total Fees</h3>
          <p className="text-3xl text-purple-400 font-bold">
            {stats.fees}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Attendance Chart</h3>
          <BarChart width={300} height={200} data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="present" fill="#2E7D32" />
          </BarChart>
        </div>

        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Fees Chart</h3>
          <PieChart width={300} height={200}>
            <Pie
              data={feesData}
              cx={150}
              cy={100}
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {feesData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={['#2E7D32', '#FF9800', '#F44336'][index % 3]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Complaints Chart</h3>
          <BarChart width={300} height={200} data={complaintsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#F44336" />
          </BarChart>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <table className="w-full">
          <thead>
            <tr className="bg-[#0B0F19]/50">
              <th className="p-3 text-left text-gray-300">Activity</th>
              <th className="p-3 text-left text-gray-300">Date</th>
              <th className="p-3 text-left text-gray-300">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.map((activity, index) => (
              <tr key={index} className="border-b border-white/10">
                <td className="p-3">{activity.description}</td>
                <td className="p-3">{activity.date}</td>
                <td className="p-3">{activity.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AdminDashboard;