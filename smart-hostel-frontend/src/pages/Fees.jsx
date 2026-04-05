import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  CreditCard, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Download, 
  ShieldCheck, 
  Info,
  Calendar
} from "lucide-react";
import Loader from "../components/Loader";

function Fees() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(true);
  const [error, setError] = useState(null);
  const [paid, setPaid] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [studentName, setStudentName] = useState("Student");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStatusAndProfile = async () => {
      if (!token) {
        setFetchingStatus(false);
        return;
      }
      try {
        // Fetch payment status
        // Since /payment-status might not exist or work this way, we'll try it
        try {
          const { data: payData } = await axios.get("http://localhost:2008/payment-status", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (payData && payData.paid) {
            setPaid(true);
            setPaymentInfo({ amount: payData.amount, date: payData.date });
          }
        } catch (payErr) {
          console.error("Could not fetch payment status:", payErr);
        }

        // Fetch user profile for name
        try {
          const { data: profile } = await axios.get("http://localhost:2008/student/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (profile && profile.name) {
            setStudentName(profile.name);
          }
        } catch (profileErr) {
          console.error("Could not fetch student profile:", profileErr);
        }

      } finally {
        setFetchingStatus(false);
      }
    };
    fetchStatusAndProfile();
  }, [token]);

  const handlePayment = async () => {
    if (!token) {
      setError("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    if (paid) {
      setError("Fees already paid.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: keyData } = await axios.get("http://localhost:2008/razorpay-key");
      const { data } = await axios.post(
        "http://localhost:2008/create-order",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key: keyData.key,
        amount: data.amount,
        currency: data.currency,
        name: "ZyrraStay Premium",
        description: "Hostel Maintenance & Services Fee",
        image: "https://cdn-icons-png.flaticon.com/512/607/607414.png", // Demo logo
        order_id: data.id,
        handler: async function (response) {
          try {
            await axios.post(
              "http://localhost:2008/payment-success",
              { amount: data.amount / 100, status: "success" },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            setPaid(true);
            setPaymentInfo({ amount: data.amount / 100, date: new Date().toISOString() });
          } catch (err) {
            console.error("Error saving payment:", err);
            alert("Payment successful but failed to sync. Please keep your transaction ID.");
          }
        },
        prefill: {
          name: "Student Name", // In real app, get from profile
          email: "student@example.com",
        },
        theme: {
          color: "#3B82F6",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.response?.data?.message || "Payment failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = () => {
    const receiptData = {
      transactionId: `TXN${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date(paymentInfo?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      amount: paymentInfo?.amount || 5000,
      studentName: studentName,
      hostelName: "ZyrraStay Premium"
    };

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ZyrraStay</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;800;900&display=swap" rel="stylesheet">
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              padding: 40px; 
              color: #1a1a2e; 
              background-color: #f3f4f6;
              height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 0;
            }
            .receipt-wrapper {
              background: #ffffff; 
              width: 100%;
              max-width: 650px; 
              border-radius: 24px; 
              box-shadow: 0 40px 80px rgba(0,0,0,0.08); 
              position: relative; 
              overflow: hidden;
            }
            .header-strip {
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              height: 12px;
              width: 100%;
            }
            .content {
              padding: 50px 60px;
              position: relative;
              background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
              background-size: 20px 20px;
              background-position: -10px -10px;
            }
            .watermark { 
              position: absolute; 
              top: 40%; 
              left: 50%; 
              transform: translate(-50%, -50%) rotate(-30deg); 
              font-size: 130px; 
              opacity: 0.02; 
              font-weight: 900; 
              letter-spacing: -2px;
              pointer-events: none; 
              text-transform: uppercase; 
              color: #1e3a8a;
            }
            .header { 
              display: flex; 
              justify-content: space-between; 
              align-items: center;
              border-bottom: 2px dashed #e2e8f0; 
              padding-bottom: 30px; 
              margin-bottom: 40px; 
              position: relative; 
              z-index: 1; 
            }
            .logo { 
              font-size: 32px; 
              font-weight: 900; 
              background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              letter-spacing: -1px; 
            }
            .logo-sub { font-size: 10px; letter-spacing: 4px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-top: -2px; display: block; }
            .title { 
              font-size: 12px; 
              color: #475569; 
              background: #f1f5f9;
              padding: 8px 16px;
              border-radius: 8px;
              font-weight: 800; 
              text-transform: uppercase; 
              letter-spacing: 2px; 
            }
            .details { 
              margin-bottom: 40px; 
              position: relative; 
              z-index: 1; 
              background: #fff;
              border-radius: 16px;
              padding: 20px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
              border: 1px solid #f1f5f9;
            }
            .row { 
              display: flex; 
              justify-content: space-between; 
              padding: 16px 10px; 
              border-bottom: 1px solid #f8fafc; 
            }
            .row:last-child { border-bottom: none; }
            .label { font-weight: 600; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
            .value { font-weight: 800; color: #0f172a; font-size: 15px; }
            .student-name { color: #1e40af; }
            .total-row { 
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); 
              padding: 30px; 
              border-radius: 16px; 
              margin-top: 20px; 
              display: flex; 
              justify-content: space-between; 
              align-items: center; 
              border: 1px solid #e2e8f0;
            }
            .total-label { font-weight: 800; color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
            .total-value { font-size: 32px; font-weight: 900; color: #1e3a8a; }
            .footer { 
              text-align: center; 
              margin-top: 50px; 
              padding-top: 30px;
              border-top: 1px solid #f1f5f9;
              font-size: 11px; 
              color: #94a3b8; 
              line-height: 1.6;
              font-weight: 400;
            }
            .stamp { 
              color: #10b981; 
              font-weight: 900; 
              font-size: 24px;
              border: 4px solid #10b981; 
              display: inline-block; 
              padding: 8px 24px; 
              border-radius: 12px; 
              transform: rotate(-5deg); 
              margin-top: 20px; 
              letter-spacing: 4px;
              box-shadow: 0 4px 15px rgba(16, 185, 129, 0.2);
              background: rgba(16, 185, 129, 0.05);
            }
            .barcode {
              text-align: center;
              margin-top: 30px;
              opacity: 0.5;
            }
            .barcode-lines {
              display: inline-block;
              height: 40px;
              width: 2px;
              background: #000;
              box-shadow: 4px 0 0 #000, 10px 0 0 #000, 14px 0 0 #000, 20px 0 0 #000, 26px 0 0 #000, 28px 0 0 #000, 36px 0 0 #000, 40px 0 0 #000, 48px 0 0 #000, 52px 0 0 #000, 60px 0 0 #000, 66px 0 0 #000, 72px 0 0 #000, 80px 0 0 #000, 84px 0 0 #000, 92px 0 0 #000, 98px 0 0 #000, 100px 0 0 #000, 108px 0 0 #000, 114px 0 0 #000, 120px 0 0 #000, 124px 0 0 #000, 130px 0 0 #000, 136px 0 0 #000, 142px 0 0 #000;
            }
            @media print { 
              body { background-color: white; padding: 0; }
              .receipt-wrapper { box-shadow: none; max-width: 100%; border-radius: 0; }
              .no-print { display: none; } 
            }
          </style>
        </head>
        <body>
          <div class="receipt-wrapper">
            <div class="header-strip"></div>
            <div class="content">
              <div class="watermark">ZYRRASTAY</div>
              
              <div class="header">
                <div>
                  <div class="logo">ZYRRASTAY</div>
                  <span class="logo-sub">Premium Residencies</span>
                </div>
                <div class="title">Official Receipt</div>
              </div>

              <div class="details">
                <div class="row"><span class="label">Transaction ID</span><span class="value">${receiptData.transactionId}</span></div>
                <div class="row"><span class="label">Payment Date</span><span class="value">${receiptData.date}</span></div>
                <div class="row"><span class="label">Student Name</span><span class="value student-name">${receiptData.studentName}</span></div>
                <div class="row"><span class="label">Hostel Unit</span><span class="value">${receiptData.hostelName}</span></div>
                <div class="row"><span class="label">Status</span><span class="value" style="color: #10b981; display: flex; align-items: center; gap: 6px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  SUCCESSFUL
                </span></div>
              </div>

              <div class="total-row">
                <span class="total-label">Total Amount Paid</span>
                <span class="total-value">₹${receiptData.amount}.00</span>
              </div>

              <div style="text-align: center;">
                <div class="stamp">PAID</div>
              </div>

              <div class="barcode">
                <div class="barcode-lines"></div>
                <div style="font-size: 10px; font-family: monospace; margin-top: 8px; letter-spacing: 2px; color: #888;">${receiptData.transactionId}</div>
              </div>

              <div class="footer">
                This is a computer-generated receipt and does not require a physical signature.<br>
                For any discrepancies, contact billing@zyrrastay.com<br>
                <strong>© 2026 ZyrraStay Premium Residencies. All rights reserved.</strong>
              </div>
            </div>
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => { 
                window.print();
                setTimeout(() => { window.close(); }, 500);
              }, 300); // Slight delay for fonts to load
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (fetchingStatus) {
    return (
      <div className="flex bg-[#0B0F19] min-h-screen">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader message="Verifying payment status..." />
        </div>
      </div>
    );
  }

  const todayDate = new Date();
  const currentDay = todayDate.getDate();
  const currentMonthStr = todayDate.toLocaleString('default', { month: 'long' });
  const currentYearStr = todayDate.getFullYear();
  const isLate = currentDay > 15;
  const lateDays = isLate ? currentDay - 15 : 0;
  const lateFeeAmount = lateDays * 100;
  const totalAmountDue = 5000 + lateFeeAmount;

  return (
    <div className="flex bg-[#0B0F19] min-h-screen text-gray-100 selection:bg-blue-500/30">
      <Sidebar />
      <div className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Hostel Fees</h1>
            <p className="text-gray-400 font-medium">Manage your residency payments and billing history</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 animate-shake">
              <AlertCircle size={20} />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Payment Section */}
            <div className="lg:col-span-2 space-y-8">
              {paid ? (
                <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                    <CheckCircle size={120} />
                  </div>
                  
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-green-500/20 rounded-2xl text-green-400">
                      <CheckCircle size={32} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold">Payment Completed</h2>
                      <p className="text-gray-400 text-sm">Thank you! Your residency is secured for this month.</p>
                    </div>
                  </div>

                  <div className="bg-black/20 rounded-2xl p-6 border border-white/5 space-y-4">
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-gray-400 font-medium">Transaction Amount</span>
                      <span className="text-2xl font-black text-white">₹{paymentInfo?.amount || 5000}</span>
                    </div>
                    <div className="flex justify-between items-center pb-4 border-b border-white/5">
                      <span className="text-gray-400 font-medium">Payment Date</span>
                      <span className="text-white font-bold">{new Date(paymentInfo?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-medium">Status</span>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-black uppercase tracking-wider border border-green-500/30">Verified</span>
                    </div>
                  </div>

                  <button 
                    onClick={downloadReceipt}
                    className="mt-8 w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all text-gray-300 hover:text-white"
                  >
                    <Download size={18} />
                    Download Payment Receipt
                  </button>
                </div>
              ) : (
                <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
                        <CreditCard size={32} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">Maintenance Fee</h2>
                        <p className="text-gray-400 text-sm">{currentMonthStr} {currentYearStr} Residency Billing</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">
                        {isLate ? "Status" : "Due In"}
                      </p>
                      <div className={`flex items-center gap-1 font-bold ${isLate ? 'text-red-500' : 'text-yellow-500'}`}>
                        {isLate ? <AlertCircle size={14} /> : <Clock size={14} />}
                        <span>{isLate ? `Overdue by ${lateDays} days` : `${15 - currentDay} Days`}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-gray-400 font-medium text-sm">
                      <span>Room Rent & Electricity</span>
                      <span>₹4200.00</span>
                    </div>
                    <div className="flex justify-between text-gray-400 font-medium text-sm">
                      <span>WiFi & Shared Amenities</span>
                      <span>₹800.00</span>
                    </div>
                    {isLate && (
                      <div className="flex justify-between text-red-400 font-medium text-sm">
                        <span>Late Fees (₹100/day for {lateDays} days)</span>
                        <span>₹{lateFeeAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                      <span className="text-white font-bold text-lg">Total Amount Due</span>
                      <span className={`text-3xl font-black ${isLate ? 'text-red-400' : 'text-white'}`}>₹{totalAmountDue.toLocaleString()}.00</span>
                    </div>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-black text-lg transition-all shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)] disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing Secure Payment...
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={22} />
                        Pay Securely Now (₹{totalAmountDue.toLocaleString()})
                      </>
                    )}
                  </button>
                  
                  <div className="mt-6 flex items-center justify-center gap-4 grayscale opacity-40">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Razorpay_logo.svg/1200px-Razorpay_logo.svg.png" alt="Razorpay" className="h-4" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">256-bit SSL Encrypted</span>
                  </div>
                </div>
              )}

              {/* Security Note */}
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6 flex items-start gap-4">
                 <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 shrink-0">
                    <ShieldCheck size={20} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-blue-300 mb-1">Secure Transactions</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                      All payments are processed securely via Razorpay. Your sensitive information is never stored on our servers. In case of any technical failure, your money is safe and will be refunded within 3-5 business days.
                    </p>
                 </div>
              </div>
            </div>

            {/* Side Info */}
            <div className="space-y-6">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
                <h3 className="text-sm font-black text-gray-300 uppercase tracking-widest mb-6">Policies & Info</h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="shrink-0 p-2 bg-purple-500/10 rounded-lg text-purple-400">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white mb-1">Billing Cycle</p>
                      <p className="text-[11px] text-gray-500 font-medium">Fees are generated on the 1st of every month.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="shrink-0 p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                      <Info size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white mb-1">Late Payment</p>
                      <p className="text-[11px] text-gray-500 font-medium">₹100/day fine after the 15th of the month.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 rounded-3xl p-8 text-center relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-2">Need Help?</h3>
                  <p className="text-sm text-gray-400 mb-6 font-medium">Our support team is available 24/7 for billing issues.</p>
                  <button 
                    onClick={() => navigate("/support")}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold transition-colors"
                  >
                    Contact Warden
                  </button>
                </div>
                <div className="absolute -bottom-10 -right-10 opacity-5 transition-all group-hover:scale-120 group-hover:-rotate-12">
                   <AlertCircle size={150} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Fees;
