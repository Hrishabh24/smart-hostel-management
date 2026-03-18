import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function StudentDashboard() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [feeStatus, setFeeStatus] = useState("Unpaid");
  const [roomDetails, setRoomDetails] = useState("Not Assigned");
  const [complaintStatus, setComplaintStatus] = useState(0);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const loadData = async () => {
      try {
        // Fetch profile for name
        const profileRes = await axios.get("http://localhost:2008/student/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setName(profileRes.data.name);

        // Fetch payment status
        const paymentRes = await axios.get("http://localhost:2008/payment-status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFeeStatus(paymentRes.data.paid ? "Paid" : "Unpaid");

        // Fetch complaints count
        const complaintsRes = await axios.get("http://localhost:2008/student/complaints", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComplaintStatus(complaintsRes.data.length);

        // Fetch attendance percentage
        const attendanceRes = await axios.get("http://localhost:2008/student/attendance-percentage", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAttendancePercentage(attendanceRes.data.percentage);

        // Fetch real room details
        try {
          const roomRes = await axios.get("http://localhost:2008/student/room", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setRoomDetails(`Room ${roomRes.data.roomNumber}`);
        } catch (err) {
          setRoomDetails("Not Assigned");
        }

      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    };
    loadData();
  }, [token, navigate]);

  return (
    <div className="flex bg-[#0B0F19] min-h-screen text-gray-100 relative">
      <Sidebar />

      <div className="flex-1 p-10 bg-[#0B0F19] min-h-screen relative z-10">
        <h1 className="text-3xl font-bold mb-6">
          Welcome {name || "Student"} 🎓
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition">
            <h3 className="text-xl font-semibold mb-2">Attendance Percentage</h3>
            <p className="text-2xl text-green-600">{attendancePercentage}%</p>
          </div>

          <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition">
            <h3 className="text-xl font-semibold mb-2">Fee Status</h3>
            <p className={`text-2xl ${feeStatus === "Paid" ? "text-green-600" : "text-red-600"}`}>
              {feeStatus}
            </p>
          </div>

          <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition">
            <h3 className="text-xl font-semibold mb-2">Room Details</h3>
            <p className="text-2xl text-blue-600">{roomDetails}</p>
          </div>

          <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition">
            <h3 className="text-xl font-semibold mb-2">Complaint Status</h3>
            <p className="text-2xl text-purple-600">{complaintStatus} Complaints</p>
          </div>
        </div>

        {/* Quick Action Card */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link to="/attendance" className="bg-gradient-to-br from-purple-600/90 to-blue-600/90 hover:from-purple-500 hover:to-blue-500 text-white p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition transform hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">📱 Mark Attendance</h3>
              <p className="text-sm">Scan QR code to mark your attendance</p>
            </Link>

            <Link to="/qr-display" target="_blank" className="bg-gradient-to-br from-cyan-600/90 to-blue-600/90 hover:from-cyan-500 hover:to-blue-500 text-white p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition transform hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">🔲 View QR Code</h3>
              <p className="text-sm">Display QR code for scanning</p>
            </Link>

            <Link to="/fees" className="bg-gradient-to-br from-pink-600/90 to-purple-600/90 hover:from-pink-500 hover:to-purple-500 text-white p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] transition transform hover:scale-105">
              <h3 className="text-xl font-semibold mb-2">💳 Pay Fees</h3>
              <p className="text-sm">Manage your fee payments</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
