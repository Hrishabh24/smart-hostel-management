import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function Attendance() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("Initializing scanner...");
  const [successCount, setSuccessCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef(null);
  const token = localStorage.getItem("token");

  // Manual check if already marked
  const checkStatus = async () => {
    try {
      setStatus("Checking current status...");
      const res = await axios.get("http://localhost:2008/student/attendance-percentage", {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Logic for if today is marked
      // { percentage: 0, presentDays: 0, totalDays: 1 }
      if (res.data.presentDays > 0) {
        setMessage("✅ You are already marked for today.");
      } else {
        setMessage("❌ Not marked yet. Please scan the QR.");
      }
      setStatus("Ready to scan.");
    } catch (err) {
      console.error(err);
      setStatus("Could not fetch status.");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const scanner = new Html5QrcodeScanner("reader", { 
      fps: 15, 
      qrbox: { width: 280, height: 280 },
      aspectRatio: 1.0
    });
    
    scannerRef.current = scanner;

    const onScanSuccess = async (decodedText) => {
      if (isProcessing) return;
      
      try {
        setIsProcessing(true);
        setStatus("Processing scan...");
        console.log("QR Scanned:", decodedText);
        
        const response = await axios.post(
          "http://localhost:2008/student/mark-attendance",
          { qrData: decodedText.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Attendance response:", response.data);
        setMessage("Attendance Marked ✅ Successfully");
        setSuccessCount(prev => prev + 1);
        setStatus("Success! Attendance recorded.");
        
        // Stop the scanner after successful mark
        try {
          await scanner.clear();
        } catch (e) { console.warn("Scanner clear failed:", e); }
        
        alert("Attendance Marked ✅ Successfully");
      } catch (err) {
        console.error("Attendance error:", err);
        const errorMsg = err.response?.data?.message || "Failed to mark attendance";
        
        if (errorMsg.toLowerCase().includes("already marked")) {
          setMessage("Attendance already marked for today 📅");
          setStatus("Already recorded today.");
          try {
            await scanner.clear();
          } catch (e) { }
          alert("Attendance was already marked for today.");
        } else {
          setMessage(`Error: ${errorMsg}`);
          setStatus("Error occurred. Trying again...");
          setTimeout(() => setIsProcessing(false), 3000);
        }

        if (err.response?.status === 401) {
          localStorage.clear();
          navigate("/login");
        }
      }
    };

    const onScanError = (errorMessage) => {
      // Noise, ignore
    };

    scanner.render(onScanSuccess, onScanError);
    setStatus("Scanner active. Scan the QR code.");

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => {});
      }
    };
  }, [token, navigate, isProcessing]);

  return (
    <div className="flex bg-[#0B0F19] min-h-screen text-gray-100 relative">
      <Sidebar />
      <div className="flex-1 p-10 bg-[#0B0F19]/30">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Attendance Scanner</h1>
              <p className="text-gray-400">Scan the QR code to mark your attendance</p>
            </div>
            <button 
              onClick={checkStatus}
              className="px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-lg hover:bg-purple-600/30 transition"
            >
              Check Status
            </button>
          </div>

          <div className="mb-6 p-4 rounded-lg bg-gray-800/50 border border-white/5 flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${status.includes('active') ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
            <p className="text-sm font-medium text-gray-300">{status}</p>
          </div>

          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.includes('✅') 
              ? 'bg-green-500/10 border border-green-500/30 text-green-400' 
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}>
              {message.includes('✅') ? '🎉' : '⚠️'}
              <p className="font-semibold">{message}</p>
            </div>
          )}

          <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-2xl rounded-2xl overflow-hidden mb-8">
            <div id="reader" className="w-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-500/5 border border-blue-500/20 p-5 rounded-xl">
              <h3 className="font-bold text-blue-400 mb-2">Instructions</h3>
              <ul className="text-sm space-y-2 text-gray-400 list-disc list-inside">
                <li>Position the QR code inside the scanner frame</li>
                <li>Ensure good lighting for better detection</li>
                <li>Wait for the confirmation popup</li>
              </ul>
            </div>
            <div className="bg-purple-500/5 border border-purple-500/20 p-5 rounded-xl">
              <h3 className="font-bold text-purple-400 mb-2">Quick Tip</h3>
              <p className="text-sm text-gray-400">
                Facing issues? Try clicking "Check Status" to see if your attendance is already marked.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Attendance;
