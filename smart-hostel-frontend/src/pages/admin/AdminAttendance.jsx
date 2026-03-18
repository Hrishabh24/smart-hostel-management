import { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeSVG as QRCode } from "qrcode.react";

function AdminAttendance() {
  const token = localStorage.getItem("token");
  const [students, setStudents] = useState([]);
  const [qrData, setQrData] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchAttendance();
    generateQR();
  }, []);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:2008/admin/attendance-percentage",
        config
      );
      setStudents(res.data);
      setError("");
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError("Failed to load attendance data");
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async () => {
    try {
      const res = await axios.get("http://localhost:2008/admin/generate-qr", config);
      console.log("QR Response:", res.data);
      
      // Handle different response formats
      const qrValue = res.data.qrData || res.data.data || res.data.qr || JSON.stringify(res.data);
      setQrData(qrValue);
    } catch (err) {
      console.error("Error generating QR:", err.response?.data || err.message);
      let errorMsg = "Failed to generate QR code";
      if (err.response?.status === 401) {
        errorMsg = "Authentication failed. Please login again.";
      } else if (err.response?.status === 404) {
        errorMsg = "QR generation endpoint not found on server.";
      }
      setError(errorMsg);
    }
  };

  const regenerateQR = () => {
    generateQR();
  };

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Live Attendance</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold mb-2"> {error}</p>
          <button
            onClick={regenerateQR}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-semibold"
          >
             Retry Loading QR
          </button>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Daily QR Code</h2>
        {qrData ? (
          <div className="flex flex-col items-center">
            <div className="bg-[#0B0F19]/30 p-6 rounded-lg border-2 border-green-200">
              <QRCode value={qrData} size={256} />
            </div>
            <button
              onClick={regenerateQR}
              className="mt-4 bg-gradient-to-br from-purple-600 to-blue-600 text-white px-4 py-2 rounded hover:bg-[#131B2F]/10"
            >
              🔄 Regenerate QR Code
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-64 bg-[#0B0F19]/50 rounded">
            <p className="text-gray-400">Generating QR Code...</p>
          </div>
        )}
        <p className="mt-2 text-gray-400">Students scan this QR code to mark attendance</p>
      </div>

      <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-lg">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold">Attendance Records</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">Loading attendance data...</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
              <tr>
                <th className="p-3 text-left text-gray-300">Name</th>
                <th className="p-3 text-center text-gray-300">Present Days</th>
                <th className="p-3 text-center text-gray-300">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((s) => (
                  <tr key={s.id} className="text-center border-b border-white/10 hover:bg-[#0B0F19]/30">
                    <td className="p-3 text-left">{s.name}</td>
                    <td className="p-3">{s.present_days}</td>
                    <td className="p-3">{s.percentage}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-gray-400">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default AdminAttendance;