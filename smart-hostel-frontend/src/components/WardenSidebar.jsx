import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Users,
  Bed,
  ClipboardCheck,
  AlertCircle,
  ShieldCheck,
  FileText,
  LogOut,
  ChevronRight,
  Menu,
  X
} from "lucide-react";

import { useState } from "react";

function WardenSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { path: "/warden-dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/warden-dashboard/profile", icon: User, label: "My Profile" },
    { path: "/warden-dashboard/students", icon: Users, label: "Students List" },
    { path: "/warden-dashboard/rooms", icon: Bed, label: "Room Management" },
    { path: "/warden-dashboard/attendance", icon: ClipboardCheck, label: "Attendance" },
    { path: "/warden-dashboard/complaints", icon: AlertCircle, label: "Complaints" },
    { path: "/warden-dashboard/leave-approval", icon: ShieldCheck, label: "Leave Approval" },
    { path: "/warden-dashboard/reports", icon: FileText, label: "Reports" }
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="md:hidden fixed top-4 right-4 z-50 p-2.5 bg-blue-600/80 backdrop-blur-md rounded-xl text-white shadow-xl border border-white/10"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`w-72 bg-[#131B2F]/90 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col justify-between min-h-screen fixed md:sticky top-0 z-50 transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
      <div>
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-black text-xl">Z</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              ZyrraStay
            </h2>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Warden Panel</p>
          </div>
        </div>

        <nav>
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || (location.pathname === "/warden-dashboard/" && item.path === "/warden-dashboard");
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
    </>
  );
}

export default WardenSidebar;