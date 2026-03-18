import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaTachometerAlt, FaClipboardCheck, FaMoneyBillWave, FaUserTag, FaBell, FaSignOutAlt, FaUser } from "react-icons/fa";

function ParentSidebar() {
  const navigate = useNavigate();
  const [childName, setChildName] = useState("");
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const fetchChild = async () => {
      try {
        const { data } = await axios.get("http://localhost:2008/parent/child", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChildName(data.name);
      } catch (err) {
        console.error("Failed to load child info", err);
      }
    };
    if (token) fetchChild();
  }, [token]);

  return (
    <div className="w-64 bg-gradient-to-br from-purple-600 to-blue-600 text-white p-6 flex flex-col justify-between min-h-screen">
      <div>
        <h2 className="text-2xl font-bold mb-2">Parent Panel</h2>
        {childName && <p className="text-sm mb-6">Child: {childName}</p>}

        <ul className="space-y-4">
          <li>
            <Link
              to="/parent-dashboard"
              className="flex items-center gap-3 hover:text-gray-200 transition duration-200"
            >
              <FaTachometerAlt /> Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/parent-dashboard/profile"
              className="flex items-center gap-3 hover:text-gray-200 transition duration-200"
            >
              <FaUser /> My Profile
            </Link>
          </li>
          <li>
            <Link
              to="/parent-dashboard/attendance"
              className="flex items-center gap-3 hover:text-gray-200 transition duration-200"
            >
              <FaClipboardCheck /> Student Attendance
            </Link>
          </li>
          <li>
            <Link
              to="/parent-dashboard/fees"
              className="flex items-center gap-3 hover:text-gray-200 transition duration-200"
            >
              <FaMoneyBillWave /> Fees
            </Link>
          </li>
          <li>
            <Link
              to="/parent-dashboard/leave"
              className="flex items-center gap-3 hover:text-gray-200 transition duration-200"
            >
              <FaUserTag /> Leave Status
            </Link>
          </li>
          <li>
            <Link
              to="/parent-dashboard/notifications"
              className="flex items-center gap-3 hover:text-gray-200 transition duration-200"
            >
              <FaBell /> Notifications
            </Link>
          </li>
        </ul>
      </div>

      <button
        onClick={logout}
        className="flex items-center justify-center gap-2 bg-[#131B2F]/80 backdrop-blur-md border border-white/5 text-purple-400 py-2 px-4 rounded-lg mt-8 font-semibold w-full hover:bg-[#0B0F19]/50 transition duration-200"
      >
        <FaSignOutAlt /> Logout
      </button>
    </div>
  );
}

export default ParentSidebar;
