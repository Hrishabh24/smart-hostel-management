import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Users,
  Bed,
  ClipboardCheck,
  CreditCard,
  AlertCircle,
  ShieldCheck,
  FileText,
  Settings,
  LogOut,
  ChevronRight
} from "lucide-react";

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { path: "/admin-dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin-dashboard/profile", icon: User, label: "My Profile" },
    { path: "/admin-dashboard/students", icon: Users, label: "Students" },
    { path: "/admin-dashboard/rooms", icon: Bed, label: "Rooms" },
    { path: "/admin-dashboard/attendance", icon: ClipboardCheck, label: "Attendance" },
    { path: "/admin-dashboard/fees", icon: CreditCard, label: "Fees" },
    { path: "/admin-dashboard/complaints", icon: AlertCircle, label: "Complaints" },
    { path: "/admin-dashboard/wardens", icon: ShieldCheck, label: "Wardens" },
    { path: "/admin-dashboard/parents", icon: Users, label: "Parents" },
    { path: "/admin-dashboard/reports", icon: FileText, label: "Reports" },
    { path: "/admin-dashboard/settings", icon: Settings, label: "Settings" }
  ];

  return (
    <div className="w-72 bg-[#131B2F]/40 backdrop-blur-xl border-r border-white/5 p-6 flex flex-col justify-between min-h-screen sticky top-0">
      <div>
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <span className="text-white font-black text-xl">Z</span>
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              ZyrraStay
            </h2>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Admin Panel</p>
          </div>
        </div>

        <nav>
          <ul className="space-y-1.5">
            {menuItems.map((item) => {
              // Matches exact path or starts with path (if it's not root-like, but since they all start with /admin-dashboard we check equality for active state exactly as student panel)
              const isActive = location.pathname === item.path || (location.pathname === "/admin-dashboard/" && item.path === "/admin-dashboard");
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

export default AdminSidebar;
