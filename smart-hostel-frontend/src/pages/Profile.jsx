import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { Edit2, Mail, Phone, MapPin, Award, DollarSign, AlertCircle } from "lucide-react";
import Loader from "../components/Loader";

const API = "https://smart-hostel-api-rm6j.onrender.com"; // ✅ FIXED

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
        const res = await axios.get(`${API}/student/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("PROFILE DATA:", res.data); // Debug

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
      case "paid":
        return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
      case "due":
      case "failed":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      default:
        return "bg-[#0B0F19]/30 text-gray-300 border border-white/10";
    }
  };

  const attendanceStatus = (attendance) => {
    if (!attendance) return "bg-[#0B0F19]/30";
    if (attendance >= 75) return "bg-green-500/10 border-green-500/20";
    if (attendance >= 50) return "bg-yellow-500/10 border-yellow-500/20";
    return "bg-red-500/10 border-red-500/20";
  };

  return (
    <div className="flex bg-[#0B0F19] min-h-screen text-gray-100">
      <Sidebar />

      <div className="flex-1 overflow-auto">
        {loading && <Loader message="Loading profile..." className="h-screen" />}

        {error && (
          <div className="m-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div className="text-red-700">{error}</div>
          </div>
        )}

        {!loading && !error && (
          <div className="p-6 max-w-6xl mx-auto">

            {/* Header */}
            <div className="mb-8">
              <div className="h-40 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-t-2xl"></div>

              <div className="bg-[#131B2F] rounded-b-2xl p-6 -mt-16">
                <div className="flex items-center gap-6">

                  {/* Profile Image */}
                  <img
                    src={
                      profile.profilePic
                        ? `${API}${profile.profilePic}` // ✅ FIXED
                        : "/default-avatar.png"
                    }
                    alt="profile"
                    className="w-32 h-32 rounded-full border-4 border-blue-500 object-cover"
                  />

                  {/* Name */}
                  <div>
                    <h1 className="text-3xl font-bold">{profile.name}</h1>
                    <p className="text-gray-400 capitalize">{profile.role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cards */}
            {profile.role === "student" && (
              <div className="grid md:grid-cols-3 gap-6 mb-8">

                {/* Attendance */}
                <div className={`${attendanceStatus(profile.attendance)} p-6 rounded-xl`}>
                  <h3>Attendance</h3>
                  <p className="text-3xl font-bold">{profile.attendance}%</p>
                </div>

                {/* Fees */}
                <div className={`${getStatusColor(profile.feeStatus)} p-6 rounded-xl`}>
                  <h3>Fee Status</h3>
                  <p className="text-xl capitalize">{profile.feeStatus}</p>
                </div>

                {/* Complaints */}
                <div className="bg-blue-500/10 p-6 rounded-xl">
                  <h3>Complaints</h3>
                  <p className="text-3xl">{profile.complaints || 0}</p>
                </div>
              </div>
            )}

            {/* Info */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Personal */}
              <div className="bg-[#131B2F] p-6 rounded-xl">
                <h2 className="text-xl mb-4">Personal Info</h2>

                <p><Mail className="inline mr-2" /> {profile.email}</p>
                <p><Phone className="inline mr-2" /> {profile.phone}</p>
                <p><MapPin className="inline mr-2" /> {profile.roomNumber}</p>
              </div>

              {/* Extra */}
              <div className="bg-[#131B2F] p-6 rounded-xl">
                <h2 className="text-xl mb-4">Details</h2>

                <p>Hostel: {profile.hostelName || "ZyrraStay"}</p>
                <p>
                  Joined:{" "}
                  {profile.joinDate
                    ? new Date(profile.joinDate).toDateString()
                    : "N/A"}
                </p>
              </div>

            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
