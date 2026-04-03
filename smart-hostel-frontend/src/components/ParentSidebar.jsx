import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  LayoutDashboard,
  User,
  ClipboardCheck,
  CreditCard,
  ShieldCheck,
  Bell,
  LogOut,
  ChevronRight
} from "lucide-react";

function ParentSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const menuItems = [
    { path: "/parent-dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/parent-dashboard/profile", icon: User, label: "My Profile" },
    { path: "/parent-dashboard/attendance", icon: ClipboardCheck, label: "Student Attendance" },
    { path: "/parent-dashboard/fees", icon: CreditCard, label: "Fees" },
    { path: "/parent-dashboard/leave", icon: ShieldCheck, label: "Leave Status" },
    { path: "/parent-dashboard/notifications", icon: Bell, label: "Notifications" }
  ];

  return (
    <div className="w-72 bg-[#131B2F]/40 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col justify-between min-h-screen sticky top-0">
      <div>
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-black text-xl">Z</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              ZyrraStay
            </h2>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Parent Panel</p>
          </div>
        </div>

        {childName && (
          <div className="px-4 py-3 mb-6 mx-2 rounded-xl bg-blue-600/10 border border-blue-500/20">
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-0.5">Linked Student</p>
            <p className="text-sm font-semibold text-white truncate">{childName}</p>
          </div>
        )}

        <nav>
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (location.pathname === "/parent-dashboard/" && item.path === "/parent-dashboard");
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center justify-between group px-4 py-3 rounded-2xl transition-all duration-300 ${isActive
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={20} className={isActive ? "text-white" : "group-hover:text-blue-400 transition-colors"} />
                      <span className="font-bold text-sm">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight size={14} className="opacity-50" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <div className="space-y-4">
        <button
          onClick={logout}
          className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl border border-white/5 bg-white/5 text-gray-400 font-bold text-sm hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all duration-300 group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          Logout Account
        </button>
      </div>
    </div>
  );
}

export default ParentSidebar;
