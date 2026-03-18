import { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeSVG as QRCode } from "qrcode.react";
import Loader from "../components/Loader";

function QRDisplay() {
  const [qrData, setQrData] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");

  const generateQR = async (isRetry = false) => {
    try {
      if (!isRetry) setLoading(true); // Don't show loader on background refreshes
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Session expired. Please login again.");
        setLoading(false);
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };
      
      const res = await axios.get("http://localhost:2008/admin/generate-qr", config);
      
      const qrValue = res.data.qrData || res.data.data;
      
      if (!qrValue) {
        throw new Error("Invalid response format from server");
      }
      
      setQrData(qrValue);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setError("");
    } catch (err) {
      console.error("QR Error:", err);
      setError(err.response?.data?.message || err.message || "Failed to sync QR code");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateQR();
    const interval = setInterval(() => generateQR(true), 15000); // Faster refresh for security
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0B0F19] p-4">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-blue-500/10 pointer-events-none"></div>
      
      <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl p-10 max-w-lg w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500"></div>
        
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-3">
            ZyrraStay
          </h1>
          <div className="h-0.5 w-12 bg-white/20 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-200">Daily Attendance QR</h2>
          <p className="text-gray-400 text-sm mt-2 font-medium">Valid for {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}</p>
        </div>

        <div className="relative group">
          {loading ? (
            <div className="h-80 flex flex-col items-center justify-center bg-black/20 rounded-2xl border border-white/5 animate-pulse">
               <Loader message="Syncing with cloud..." />
            </div>
          ) : error ? (
            <div className="h-80 flex flex-col items-center justify-center bg-red-500/5 border border-red-500/20 rounded-2xl p-6 text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-red-400 font-medium mb-4">{error}</p>
              <button
                onClick={() => generateQR()}
                className="px-6 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full hover:bg-red-500/30 transition"
              >
                Retry Connection
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center scale-100 hover:scale-[1.02] transition-transform duration-500">
              <div className="p-8 bg-white rounded-3xl shadow-[0_0_30px_rgba(255,255,255,0.1)] relative">
                <QRCode value={qrData} size={240} level="H" includeMargin={false} />
              </div>
              
              <div className="mt-8 flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-bold text-green-400 uppercase tracking-widest">Live Syncing</span>
              </div>
              
              <p className="text-[10px] text-gray-500 mt-4 uppercase tracking-widest font-bold">
                Last verified: {lastUpdated}
              </p>
            </div>
          )}
        </div>

        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 mt-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-300 mb-1 tracking-wide">STUDENT INSTRUCTIONS</p>
              <p className="text-[11px] text-gray-500 leading-relaxed font-medium">
                Please scan accurately using the ZyrraStay app. Ensure your screen brightness is sufficient and you are within safe distance of the terminal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRDisplay;