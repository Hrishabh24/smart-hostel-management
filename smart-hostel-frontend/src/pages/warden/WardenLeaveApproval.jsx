import { useEffect, useState } from "react";
import axios from "axios";

function WardenLeaveApproval() {
  const token = localStorage.getItem("token");
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:2008/warden/leave-requests", config);
      setLeaveRequests(res.data);
    } catch (err) {
      console.log(err);
      // Use mock data
      setLeaveRequests([
        { id: 1, student: "John Doe", startDate: "2026-03-10", endDate: "2026-03-12", reason: "Family emergency", status: "pending" },
        { id: 2, student: "Jane Smith", startDate: "2026-03-15", endDate: "2026-03-20", reason: "Vacation", status: "approved" },
        { id: 3, student: "Mike Johnson", startDate: "2026-03-11", endDate: "2026-03-13", reason: "Medical checkup", status: "pending" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const updateLeaveStatus = async (id, newStatus, type) => {
    try {
      await axios.put(
        `http://localhost:2008/warden/leave-requests/${id}`,
        { status: newStatus, type },
        config
      );
      setLeaveRequests(leaveRequests.map(l => (l.id === id && l.type === type) ? { ...l, status: newStatus } : l));
    } catch (err) {
      console.error("Error updating leave status:", err);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-8 text-white">Leave Approval</h1>

      <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-lg p-6">
        {loading ? (
          <p className="text-gray-400">Loading leave requests...</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                <th className="p-3 text-left text-gray-300">Student</th>
                <th className="p-3 text-left text-gray-300">Start Date</th>
                <th className="p-3 text-left text-gray-300">End Date</th>
                <th className="p-3 text-left text-gray-300">Requested By</th>
                <th className="p-3 text-left text-gray-300">Reason</th>
                <th className="p-3 text-left text-gray-300">Status</th>
                <th className="p-3 text-left text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.map((leave) => (
                <tr key={leave.id} className="border-b border-white/10 hover:bg-[#0B0F19]/30">
                  <td className="p-3">{leave.student}</td>
                  <td className="p-3">{leave.startDate}</td>
                  <td className="p-3">{leave.endDate}</td>
                  <td className="p-3 capitalize">{leave.type || 'student'}</td>
                  <td className="p-3">{leave.reason}</td>
                  <td className="p-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${leave.status === "approved" ? "bg-green-500/20 text-green-400 border border-green-500/20" : leave.status === "rejected" ? "bg-red-500/20 text-red-400 border border-red-500/20" : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/20"}`}>
                      {leave.status}
                    </span>
                  </td>
                  <td className="p-3 space-x-2">
                    {leave.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateLeaveStatus(leave.id, "approved", leave.type)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-semibold"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updateLeaveStatus(leave.id, "rejected", leave.type)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-semibold"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default WardenLeaveApproval;