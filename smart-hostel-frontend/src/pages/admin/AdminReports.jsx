import { useEffect } from "react";
import axios from "axios";

function AdminReports() {
  const token = localStorage.getItem("token");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get("http://localhost:2008/admin/reports", config);
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-8 text-white">Reports & Analytics</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Attendance Report</h3>
          <p>Generate and view attendance analytics here.</p>
        </div>

        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Fee Collection Report</h3>
          <p>View fee payment statistics and reports.</p>
        </div>

        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Complaints Report</h3>
          <p>Analyze complaint trends and resolutions.</p>
        </div>

        <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Room Occupancy Report</h3>
          <p>Check room utilization and availability.</p>
        </div>
      </div>
    </>
  );
}

export default AdminReports;