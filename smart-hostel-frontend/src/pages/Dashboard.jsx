import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  HiOutlineCalendarDays, 
  HiOutlineCreditCard, 
  HiOutlineHome, 
  HiOutlineChatBubbleLeftRight,
  HiOutlineQrCode,
  HiOutlineViewfinderCircle,
  HiOutlineCurrencyDollar,
  HiOutlineArrowRight
} from "react-icons/hi2";

function StudentDashboard() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [attendancePercentage, setAttendancePercentage] = useState(0);
  const [feeStatus, setFeeStatus] = useState("Unpaid");
  const [roomDetails, setRoomDetails] = useState("Not Assigned");
  const [complaintStatus, setComplaintStatus] = useState(0);
  const [greeting, setGreeting] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    // Set greeting based on time of day
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const loadData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Parallel fetching for better performance
        const [profileRes, paymentRes, complaintsRes, attendanceRes] = await Promise.allSettled([
          axios.get("http://localhost:2008/student/profile", config),
          axios.get("http://localhost:2008/payment-status", config),
          axios.get("http://localhost:2008/student/complaints", config),
          axios.get("http://localhost:2008/student/attendance-percentage", config)
        ]);

        if (profileRes.status === 'fulfilled') setName(profileRes.value.data.name);
        if (paymentRes.status === 'fulfilled') setFeeStatus(paymentRes.value.data.paid ? "Paid" : "Unpaid");
        if (complaintsRes.status === 'fulfilled') setComplaintStatus(complaintsRes.value.data.length);
        if (attendanceRes.status === 'fulfilled') setAttendancePercentage(attendanceRes.value.data.percentage);

        try {
          const roomRes = await axios.get("http://localhost:2008/student/room", config);
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
    <div className="flex bg-[#0B0F19] min-h-screen text-gray-100">
      <Sidebar />

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        {/* Header Section */}
        <header className="mb-12 relative">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative z-10">
            <p className="text-blue-400 font-bold tracking-widest uppercase text-xs mb-3">{greeting} • Welcome back</p>
            <h1 className="text-5xl font-black text-white tracking-tight flex items-center gap-3">
              {name || "Student"} <span className="text-blue-500 text-3xl opacity-50 font-normal">#24</span>
            </h1>
            <p className="text-gray-400 mt-4 text-lg max-w-2xl font-medium leading-relaxed">
              Managing your hostel stay has never been easier. Check your status and quick actions below.
            </p>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
          {/* Attendance Card */}
          <div className="bg-[#131B2F]/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] shadow-2xl group hover:border-blue-500/30 transition-all duration-500">
            <div className="flex items-start justify-between mb-8">
              <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform duration-500">
                <HiOutlineCalendarDays size={28} />
              </div>
              <span className="text-[10px] font-black tracking-widest text-blue-400/50 uppercase">Attendance</span>
            </div>
            <h3 className="text-4xl font-black text-white mb-2">{attendancePercentage}%</h3>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000" 
                style={{ width: `${attendancePercentage}%` }}
              />
            </div>
          </div>

          {/* Fee Status Card */}
          <div className="bg-[#131B2F]/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] shadow-2xl group hover:border-emerald-500/30 transition-all duration-500">
            <div className="flex items-start justify-between mb-8">
              <div className={`p-4 rounded-2xl group-hover:scale-110 transition-transform duration-500 ${feeStatus === "Paid" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"}`}>
                <HiOutlineCreditCard size={28} />
              </div>
              <span className={`text-[10px] font-black tracking-widest uppercase ${feeStatus === "Paid" ? "text-emerald-400/50" : "text-rose-400/50"}`}>Payment</span>
            </div>
            <h3 className="text-4xl font-black text-white mb-2">{feeStatus}</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
              {feeStatus === "Paid" ? "Cleared for current cycle" : "Payment overdue detected"}
            </p>
          </div>

          {/* Room Details Card */}
          <div className="bg-[#131B2F]/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] shadow-2xl group hover:border-amber-500/30 transition-all duration-500">
            <div className="flex items-start justify-between mb-8">
              <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500 group-hover:scale-110 transition-transform duration-500">
                <HiOutlineHome size={28} />
              </div>
              <span className="text-[10px] font-black tracking-widest text-amber-400/50 uppercase">Accommodation</span>
            </div>
            <h3 className="text-4xl font-black text-white mb-2 truncate">{roomDetails}</h3>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Resident since Aug 2025</p>
          </div>

          {/* Complaint Status Card */}
          <div className="bg-[#131B2F]/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] shadow-2xl group hover:border-purple-500/30 transition-all duration-500">
            <div className="flex items-start justify-between mb-8">
              <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-500 group-hover:scale-110 transition-transform duration-500">
                <HiOutlineChatBubbleLeftRight size={28} />
              </div>
              <span className="text-[10px] font-black tracking-widest text-purple-400/50 uppercase">Feedback</span>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-black text-white mb-2">{complaintStatus}</h3>
              <span className="text-sm font-bold text-gray-500">Active</span>
            </div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Responses will show here</p>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-64 bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Quick Operations</h2>
              <p className="text-gray-500 text-sm font-medium mt-1">Frequently used shortcuts for your daily tasks</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <Link to="/attendance" className="group bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] shadow-xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-2">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform">
                <HiOutlineQrCode size={32} />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Mark Attendance</h3>
              <p className="text-white/60 text-sm font-medium leading-relaxed mb-6">Scan official hostel QR code to register your daily attendance.</p>
              <div className="flex items-center gap-2 text-white text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                Launch Scanner <HiOutlineArrowRight />
              </div>
            </Link>

            <Link to="/qr-display" target="_blank" className="group bg-[#131B2F]/60 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] shadow-xl hover:bg-white/5 transition-all duration-500 hover:-translate-y-2">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-8 group-hover:scale-110 transition-transform">
                <HiOutlineViewfinderCircle size={32} />
              </div>
              <h3 className="text-xl font-black text-white mb-2">My ID Pass</h3>
              <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6">Display your unique identification QR code for warden verification.</p>
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                Generate Code <HiOutlineArrowRight />
              </div>
            </Link>

            <Link to="/fees" className="group bg-[#131B2F]/60 backdrop-blur-md border border-white/5 p-8 rounded-[2.5rem] shadow-xl hover:bg-white/5 transition-all duration-500 hover:-translate-y-2">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500 mb-8 group-hover:scale-110 transition-transform">
                <HiOutlineCurrencyDollar size={32} />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Billing Portal</h3>
              <p className="text-gray-400 text-sm font-medium leading-relaxed mb-6">Pay your monthly hostel fees and checkout your payment history.</p>
              <div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-widest group-hover:gap-4 transition-all">
                Secure Payment <HiOutlineArrowRight />
              </div>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default StudentDashboard;
