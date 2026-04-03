import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaClipboardCheck, FaMoneyBillWave, FaUserTag } from "react-icons/fa";

function ParentDashboard() {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [attRes, feeRes, leaveRes] = await Promise.allSettled([
          axios.get("http://localhost:2008/parent/attendance-percentage", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:2008/parent/payment-status", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:2008/parent/leave-history", {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);
        
        setSummary({
          attendance: attRes.status === 'fulfilled' ? attRes.value.data : null,
          fees: feeRes.status === 'fulfilled' ? feeRes.value.data : null,
          leaves: leaveRes.status === 'fulfilled' ? leaveRes.value.data : []
        });
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetch();
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-white mb-2">Parent Dashboard</h1>
      <p className="text-gray-400 mb-8">
        Welcome! Here is the latest overview of your ward's status.
      </p>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && <p className="text-blue-400 mb-4">Loading dashboard...</p>}

      {!loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Link
              to="attendance"
              className="bg-gradient-to-br from-[#131B2F]/80 to-[#1A2540]/80 backdrop-blur-md border border-white/5 shadow-lg hover:shadow-purple-500/20 rounded-xl p-6 transition group block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-500/20 p-3 rounded-lg text-purple-400 group-hover:bg-purple-500/40 transition">
                  <FaClipboardCheck className="text-2xl" />
                </div>
                {summary.attendance && (
                  <span className="text-2xl font-bold text-white">
                    {summary.attendance.percentage}%
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">Attendance</h2>
              <p className="text-sm text-gray-400">View detailed presence records</p>
            </Link>

            <Link
              to="fees"
              className="bg-gradient-to-br from-[#131B2F]/80 to-[#1A2540]/80 backdrop-blur-md border border-white/5 shadow-lg hover:shadow-blue-500/20 rounded-xl p-6 transition group block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-500/20 p-3 rounded-lg text-blue-400 group-hover:bg-blue-500/40 transition">
                  <FaMoneyBillWave className="text-2xl" />
                </div>
                {summary.fees && (
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${summary.fees.paid ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                    {summary.fees.paid ? "Paid" : "Pending"}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">Fee Status</h2>
              <p className="text-sm text-gray-400">Check payments and dues</p>
            </Link>

            <Link
              to="leave"
              className="bg-gradient-to-br from-[#131B2F]/80 to-[#1A2540]/80 backdrop-blur-md border border-white/5 shadow-lg hover:shadow-teal-500/20 rounded-xl p-6 transition group block"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="bg-teal-500/20 p-3 rounded-lg text-teal-400 group-hover:bg-teal-500/40 transition">
                  <FaUserTag className="text-2xl" />
                </div>
                {summary.leaves && (
                  <span className="text-xl font-bold text-white">
                    {summary.leaves.length} Requests
                  </span>
                )}
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">Leave Requests</h2>
              <p className="text-sm text-gray-400">Request leave for your ward</p>
            </Link>
          </div>

          <div className="bg-gradient-to-br from-[#131B2F]/80 to-[#1A2540]/80 backdrop-blur-md border border-white/5 shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Recent Leave Summary</h2>
            {summary.leaves && summary.leaves.length > 0 ? (
              <div className="space-y-3">
                {summary.leaves.slice(0, 3).map((l, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-[#0B0F19]/50 p-4 rounded-lg border border-white/5">
                    <div>
                      <p className="font-semibold text-white">{l.reason}</p>
                      <p className="text-xs text-gray-400">{l.startDate} to {l.endDate}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      l.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                      l.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No leave requests found.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default ParentDashboard;
