import { Link, useNavigate } from "react-router-dom";
import { FaChartLine, FaUserGraduate, FaHotel, FaClipboardCheck, FaBullhorn, FaUserTag, FaFileAlt, FaSignOutAlt, FaUser } from "react-icons/fa";

function WardenSidebar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="w-64 bg-gradient-to-br from-purple-600 to-blue-600 text-white min-h-screen p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-8">Warden Panel</h2>

        <ul className="space-y-4">
          <li><Link to="/warden-dashboard" className="flex items-center gap-3 py-2 px-4 rounded hover:bg-[#131B2F]/10 transition duration-200"><FaChartLine /> Dashboard</Link></li>
          <li><Link to="/warden-dashboard/profile" className="flex items-center gap-3 py-2 px-4 rounded hover:bg-[#131B2F]/10 transition duration-200"><FaUser /> My Profile</Link></li>
          <li><Link to="/warden-dashboard/students" className="flex items-center gap-3 py-2 px-4 rounded hover:bg-[#131B2F]/10 transition duration-200"><FaUserGraduate /> Students List</Link></li>
          <li><Link to="/warden-dashboard/rooms" className="flex items-center gap-3 py-2 px-4 rounded hover:bg-[#131B2F]/10 transition duration-200"><FaHotel /> Room Management</Link></li>
          <li><Link to="/warden-dashboard/attendance" className="flex items-center gap-3 py-2 px-4 rounded hover:bg-[#131B2F]/10 transition duration-200"><FaClipboardCheck /> Attendance</Link></li>
          <li><Link to="/warden-dashboard/complaints" className="flex items-center gap-3 py-2 px-4 rounded hover:bg-[#131B2F]/10 transition duration-200"><FaBullhorn /> Complaints</Link></li>
          <li><Link to="/warden-dashboard/leave-approval" className="flex items-center gap-3 py-2 px-4 rounded hover:bg-[#131B2F]/10 transition duration-200"><FaUserTag /> Leave Approval</Link></li>
          <li><Link to="/warden-dashboard/reports" className="flex items-center gap-3 py-2 px-4 rounded hover:bg-[#131B2F]/10 transition duration-200"><FaFileAlt /> Reports</Link></li>
        </ul>
      </div>

      <button
        onClick={logout}
        className="flex items-center justify-center gap-2 bg-[#131B2F]/80 backdrop-blur-md border border-white/5 text-blue-400 py-2 rounded-lg font-semibold hover:bg-[#0B0F19]/50 transition duration-200"
      >
        <FaSignOutAlt /> Logout
      </button>
    </div>
  );
}

export default WardenSidebar;