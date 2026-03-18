import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUserCheck, FaUserTimes, FaCalendarAlt } from "react-icons/fa";

function ParentAttendance() {
  const [loading, setLoading] = useState(false);
  const [attendance, setAttendance] = useState(null);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          "http://localhost:2008/parent/attendance-percentage",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setAttendance(data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Unable to load data");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetch();
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-2">Student Attendance</h1>
      <p className="text-gray-400 mb-8">View your ward's presence records down below.</p>
      
      {loading && <p className="text-blue-400">Loading...</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}
      
      {attendance && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-[#131B2F]/80 to-[#1A2540]/80 backdrop-blur-md border border-white/5 shadow-lg rounded-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Percentage</p>
              <p className="text-4xl font-bold text-white">{attendance.percentage}%</p>
            </div>
            <div className="bg-purple-500/20 p-4 rounded-full text-purple-400">
              <FaUserCheck className="text-3xl" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#131B2F]/80 to-[#1A2540]/80 backdrop-blur-md border border-white/5 shadow-lg rounded-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Present Days</p>
              <p className="text-4xl font-bold text-white">{attendance.presentDays}</p>
            </div>
            <div className="bg-blue-500/20 p-4 rounded-full text-blue-400">
              <FaCalendarAlt className="text-3xl" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#131B2F]/80 to-[#1A2540]/80 backdrop-blur-md border border-white/5 shadow-lg rounded-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-1">Absent Days</p>
              <p className="text-4xl font-bold text-white">{attendance.totalDays - attendance.presentDays}</p>
            </div>
            <div className="bg-red-500/20 p-4 rounded-full text-red-500">
              <FaUserTimes className="text-3xl" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ParentAttendance;
