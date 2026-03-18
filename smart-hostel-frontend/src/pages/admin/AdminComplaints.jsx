import { useEffect, useState } from "react";
import axios from "axios";
import { CheckCircle, Clock, AlertTriangle, ShieldCheck } from "lucide-react";

function AdminComplaints() {
  const token = localStorage.getItem("token");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:2008/admin/complaints", config);
      setComplaints(res.data);
    } catch (err) {
      console.log("Could not fetch complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:2008/warden/complaint/${id}`, { status }, config);
      setComplaints(complaints.map(c => c.id === id ? { ...c, status } : c));
    } catch (err) {
      console.error("Error updating complaint:", err);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "resolved":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/20";
      case "pending":
        return "bg-amber-500/20 text-amber-400 border-amber-500/20";
      default:
        return "bg-blue-500/20 text-blue-400 border-blue-500/20";
    }
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-10 animate-fade-in">
        <h1 className="text-4xl font-black text-white tracking-tight mb-2">Complaint Management</h1>
        <p className="text-gray-400 font-medium">Handle student grievances and maintenance requests</p>
      </div>

      <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-black/20 border-b border-white/5">
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Student</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Description</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Category</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-500 font-bold animate-pulse">
                    Loading Complaints Architecture...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-10 text-center text-gray-500 font-bold">
                    No active complaints recorded.
                  </td>
                </tr>
              ) : (
                complaints.map((complaint) => (
                  <tr key={complaint.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white">
                          {complaint.student.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-200">{complaint.student}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <p className="text-sm text-gray-400 max-w-sm leading-relaxed">{complaint.description}</p>
                    </td>
                    <td className="p-6 text-center">
                      <span className="text-[10px] font-black uppercase text-blue-400 bg-blue-500/10 px-2 py-1 rounded">
                        {complaint.category || 'general'}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-300">
                          {new Date(complaint.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                        <span className="text-[10px] text-gray-500 font-black uppercase">
                          {new Date(complaint.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(complaint.status)}`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="p-6 text-right">
                      {complaint.status === "pending" ? (
                        <button
                          onClick={() => updateStatus(complaint.id, "resolved")}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black transition-all shadow-lg shadow-emerald-900/20 hover:scale-105 active:scale-95 flex items-center gap-2 ml-auto"
                        >
                          <ShieldCheck size={14} />
                          Resolve
                        </button>
                      ) : (
                        <div className="flex items-center gap-1 justify-end text-emerald-500 text-xs font-black">
                          <CheckCircle size={14} />
                          COMPLETED
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminComplaints;