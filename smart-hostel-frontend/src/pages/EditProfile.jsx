import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AdminSidebar from "../components/AdminSidebar";
import WardenSidebar from "../components/WardenSidebar";
import ParentSidebar from "../components/ParentSidebar";
import { ChevronLeft, Save, AlertCircle, CheckCircle, Loader as LoaderIcon, Camera } from "lucide-react";
import Loader from "../components/Loader";

function EditProfile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    roomNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role"); // Use this to render the correct sidebar if profile hasn't loaded yet

  const getProfilePicUrl = (url) => {
    if (!url) return '/default-avatar.png';
    if (url.startsWith('http')) return url;
    return `https://smart-hostel-api-rm6j.onrender.com${url}`;
  };

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
        setFormData({
          name: res.data.name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
          roomNumber: res.data.roomNumber || "",
        });
        setProfilePicUrl(res.data.profilePic || "");
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token, navigate]);

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (formData.phone && !/^[0-9\-\+\s\(\)]+$/.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Optional: Clear any existing file validation error
      if (validationErrors.profilePic) {
        setValidationErrors(prev => ({ ...prev, profilePic: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await axios.put(
        "http://localhost:2008/student/profile",
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (selectedFile) {
        const formDataPic = new FormData();
        formDataPic.append("profilePic", selectedFile);
        await axios.post(
          "http://localhost:2008/student/upload-profile-pic",
          formDataPic,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data"
            }
          }
        );
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(getProfilePath());
      }, 2000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  const renderSidebar = () => {
    // Only student role needs sidebar here. Admin, Warden, Parent use layouts.
    if (userRole === 'student' || !userRole) {
      return <Sidebar />;
    }
    return null;
  };

  const getProfilePath = () => {
    if (userRole === 'student') return '/profile';
    return `/${userRole}-dashboard/profile`;
  };

  const isLayoutParent = window.location.pathname.includes('-dashboard');

  return (
    <div className={`flex bg-[#0B0F19] min-h-screen text-gray-100 ${!isLayoutParent ? '' : 'p-0'}`}>
      {!isLayoutParent && <Sidebar />}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <Loader message="Loading profile..." className="h-screen" />
        ) : (
          <div className="p-4 md:p-6 lg:p-8 max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => navigate(getProfilePath())}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Profile
              </button>

              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Edit Profile
              </h1>
              <p className="text-gray-400 mt-2">
                Update your personal information
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-4">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="text-green-300">
                  <p className="font-semibold">Profile updated successfully!</p>
                  <p className="text-sm opacity-80">Syncing with system database...</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && !success && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-red-300 font-medium">{error}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 rounded-xl shadow-sm border border-white/10 p-6 md:p-8">
              <div className="space-y-6">

                {/* Profile Picture Upload */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <img
                      src={previewUrl || getProfilePicUrl(profilePicUrl)}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.4)] bg-[#131B2F]/80 backdrop-blur-md border border-white/5"
                    />
                    <label
                      htmlFor="profile-pic-upload"
                      className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full cursor-pointer hover:bg-blue-700 transition shadow-[0_15px_40px_rgba(0,0,0,0.5)] border-2 border-white"
                    >
                      <Camera className="w-5 h-5" />
                    </label>
                    <input
                      id="profile-pic-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={submitting}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-3">Upload a new photo</p>
                </div>

                {/* Name Field */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 bg-[#0B0F19]/50 text-white rounded-lg border ${validationErrors.name
                        ? "border-red-500/50 focus:ring-red-500"
                        : "border-white/10 focus:ring-blue-500"
                      } focus:outline-none focus:ring-2 transition-all placeholder:text-gray-600`}
                    disabled={submitting}
                  />
                  {validationErrors.name && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span className="text-lg">!</span> {validationErrors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={`w-full px-4 py-3 bg-[#0B0F19]/50 text-white rounded-lg border ${validationErrors.email
                        ? "border-red-500/50 focus:ring-red-500"
                        : "border-white/10 focus:ring-blue-500"
                      } focus:outline-none focus:ring-2 transition-all placeholder:text-gray-600`}
                    disabled={submitting}
                  />
                  {validationErrors.email && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span className="text-lg">!</span> {validationErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter your phone number"
                    className={`w-full px-4 py-3 bg-[#0B0F19]/50 text-white rounded-lg border ${validationErrors.phone
                        ? "border-red-500/50 focus:ring-red-500"
                        : "border-white/10 focus:ring-blue-500"
                      } focus:outline-none focus:ring-2 transition-all placeholder:text-gray-600`}
                    disabled={submitting}
                  />
                  {validationErrors.phone && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <span className="text-lg">!</span> {validationErrors.phone}
                    </p>
                  )}
                </div>

                {/* Room Number Field - Only for Students */}
                {userRole === 'student' && (
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Room Number
                    </label>
                    <input
                      type="text"
                      name="roomNumber"
                      value={formData.roomNumber}
                      onChange={handleChange}
                      placeholder="Enter your room number"
                      className="w-full px-4 py-3 bg-[#0B0F19]/50 text-white rounded-lg border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                      disabled={submitting}
                    />
                    <p className="text-gray-400 text-sm mt-1">
                      This field is typically read-only and managed by admin
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-6 mt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => navigate(getProfilePath())}
                    className="flex-1 px-6 py-3 rounded-xl border border-white/5 text-gray-400 font-semibold hover:bg-white/5 hover:text-white transition-all duration-200"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <LoaderIcon className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Synchronize Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Additional Info */}
            <div className="mt-8 p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex gap-4 items-start">
              <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                <span className="font-bold text-blue-400 block mb-1">System Integrity Note</span> 
                Some administrative fields (Room Assignment, System Access) are locked. These must be updated through the Central Management Hub. Contact your warden for protocol details.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EditProfile;
