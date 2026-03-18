import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AdminSidebar from "../components/AdminSidebar";
import WardenSidebar from "../components/WardenSidebar";
import ParentSidebar from "../components/ParentSidebar";
import { Edit2, Mail, Phone, MapPin, Award, DollarSign, AlertCircle } from "lucide-react";
import Loader from "../components/Loader";

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:2008/student/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'due':
      case 'failed':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-[#0B0F19]/30 text-gray-300 border border-white/10';
    }
  };

  const attendanceStatus = (attendance) => {
    if (!attendance) return 'bg-[#0B0F19]/30';
    if (attendance >= 75) return 'bg-green-500/10 border-green-500/20';
    if (attendance >= 50) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const renderSidebar = () => {
    // Only render sidebar if student. Admin, Warden, and Parent use layouts that already include a sidebar.
    if (profile.role === 'student' || !profile.role) {
      return <Sidebar />;
    }
    return null;
  };

  const getEditPath = () => {
    if (profile.role === 'student') return '/edit-profile';
    return `/${profile.role}-dashboard/edit-profile`;
  };

  const isLayoutParent = window.location.pathname.includes('-dashboard');

  return (
    <div className={`flex bg-[#0B0F19] min-h-screen text-gray-100 ${!isLayoutParent ? '' : 'p-0'}`}>
      {!isLayoutParent && <Sidebar />}
      <div className="flex-1 overflow-auto">
        {/* Loading & Error States */}
        {loading && (
          <Loader message="Loading profile..." className="h-screen" />
        )}

        {error && (
          <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {!loading && !error && (
          <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
            {/* Cover Banner & Profile Header */}
            <div className="relative mb-8">
              {/* Gradient Cover Banner */}
              <div className="h-40 md:h-48 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-t-2xl shadow-[0_8px_30px_rgba(0,0,0,0.4)]"></div>

              {/* Profile Section */}
              <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 rounded-b-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] px-6 md:px-8 pb-8">
                <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-20 relative z-10">
                  {/* Profile Image */}
                   <div className="flex-shrink-0 relative group">
                    <img
                      src={profile.profilePic ? `http://localhost:2008${profile.profilePic}` : '/default-avatar.png'}
                      alt={profile.name}
                      className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-blue-600/50 shadow-[0_0_50px_rgba(37,99,235,0.3)] bg-[#0B0F19]/80 transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 rounded-full border-2 border-white/10 pointer-events-none"></div>
                  </div>

                  {/* Profile Name & Role */}
                  <div className="flex-1 pb-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                      {profile.name || 'User Name'}
                    </h1>
                    <p className="text-lg text-gray-400 capitalize mb-3">
                      {profile.role || 'Student'}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => navigate(getEditPath())}
                        className="flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)] hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit Profile
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics Cards - Only for Students */}
            {profile.role === 'student' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Attendance Card */}
                <div className={`${attendanceStatus(profile.attendance)} rounded-xl p-6 shadow-sm border border-opacity-20 transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-300 font-semibold">Attendance</h3>
                    <Award className="w-5 h-5 text-blue-600 opacity-60" />
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">
                    {profile.attendance != null ? `${profile.attendance}%` : '—'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {profile.attendance >= 75 ? '✓ Good attendance' : profile.attendance >= 50 ? '⚠ Needs improvement' : '⚠ Critical'}
                  </p>
                </div>

                {/* Fee Status Card */}
                <div className={`${getStatusColor(profile.feeStatus)} rounded-xl p-6 shadow-sm border transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Fee Status</h3>
                    <DollarSign className="w-5 h-5 opacity-60" />
                  </div>
                  <p className="text-2xl font-bold mb-1 capitalize">
                    {profile.feeStatus || 'Unknown'}
                  </p>
                  <p className="text-sm opacity-75">
                    {profile.feeStatus === 'paid' ? 'All fees paid' : profile.feeStatus === 'pending' ? 'Pending payment' : 'Action required'}
                  </p>
                </div>

                {/* Complaints Card */}
                <div className="bg-blue-500/10 rounded-xl p-6 shadow-sm border border-blue-500/20 transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-gray-300 font-semibold">Complaints</h3>
                    <AlertCircle className="w-5 h-5 text-blue-400 opacity-60" />
                  </div>
                  <p className="text-4xl font-bold text-white mb-1">
                    {profile.complaints || '0'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {profile.complaints ? 'Pending resolution' : 'No active complaints'}
                  </p>
                </div>
              </div>
            )}

            {/* Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information Card */}
              <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 rounded-xl shadow-sm border border-white/10 p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-200">
                <h2 className="text-xl font-bold text-white mb-5">Personal Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400 font-medium">Email</p>
                      <p className="text-white font-medium">{profile.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Phone className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400 font-medium">Phone</p>
                      <p className="text-white font-medium">{profile.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-400 font-medium">{profile.role === 'student' ? 'Room Number' : 'Office/Identity'}</p>
                      <p className="text-white font-medium">{profile.roomNumber || (profile.role === 'student' ? 'Not assigned' : 'Hostel Staff')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information Card */}
              <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 rounded-xl shadow-sm border border-white/10 p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-all duration-200">
                <h2 className="text-xl font-bold text-white mb-5">Additional Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 font-medium mb-2">{profile.role === 'student' ? 'Enrollment Status' : 'System Access'}</p>
                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm font-semibold border border-blue-500/20">
                      {profile.enrollmentStatus || 'Active Access'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-medium mb-2">Hostel Name</p>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-building"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M8 10h.01"/><path d="M16 10h.01"/><path d="M8 14h.01"/><path d="M16 14h.01"/></svg>
                      </div>
                      <p className="text-white font-medium">{profile.hostelName || 'ZyrraStay'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 font-medium mb-2">Member Since</p>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar-days"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
                      </div>
                      <p className="text-white font-medium">
                        {profile.joinDate
                          ? new Date(profile.joinDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
