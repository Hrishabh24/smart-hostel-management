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
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStatus = async () => {
      if (!token) {
        setFetchingStatus(false);
        return;
      }
      try {
        const { data } = await axios.get("http://localhost:2008/payment-status", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.paid) {
          setPaid(true);
          setPaymentInfo({ amount: data.amount, date: data.date });
        }
      } catch (err) {
        console.error("Could not fetch payment status:", err);
      } finally {
        setFetchingStatus(false);
      }
    };
    fetchStatus();
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
      studentName: "Resident User", // In real app, get from profile
      hostelName: "ZyrraStay Premium"
    };

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ZyrraStay</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .receipt-card { max-width: 600px; margin: 0 auto; border: 2px solid #eee; padding: 40px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); }
            .header { text-align: center; border-bottom: 2px solid #f4f4f4; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 900; color: #3b82f6; letter-spacing: -1px; }
            .title { font-size: 14px; color: #666; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; }
            .details { margin-bottom: 30px; }
            .row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f9f9f9; }
            .label { font-weight: 600; color: #888; font-size: 14px; }
            .value { font-weight: 700; color: #222; font-size: 14px; }
            .total-row { background: #f8faff; padding: 20px; border-radius: 12px; margin-top: 20px; display: flex; justify-content: space-between; align-items: center; }
            .total-label { font-weight: 800; color: #1e40af; }
            .total-value { font-size: 24px; font-weight: 900; color: #1e40af; }
            .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #aaa; }
            .stamp { color: #10b981; font-weight: 900; border: 3px solid #10b981; display: inline-block; padding: 5px 15px; border-radius: 8px; transform: rotate(-10deg); margin-top: 20px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <div class="logo">ZYRRASTAY</div>
              <div class="title">Payment Receipt</div>
            </div>
            <div class="details">
              <div class="row"><span class="label">Transaction ID</span><span class="value">${receiptData.transactionId}</span></div>
              <div class="row"><span class="label">Payment Date</span><span class="value">${receiptData.date}</span></div>
              <div class="row"><span class="label">Student Name</span><span class="value">${receiptData.studentName}</span></div>
              <div class="row"><span class="label">Hostel Unit</span><span class="value">${receiptData.hostelName}</span></div>
              <div class="row"><span class="label">Status</span><span class="value" style="color: #10b981;">SUCCESSFUL</span></div>
            </div>
            <div class="total-row">
              <span class="total-label">Total Amount Paid</span>
              <span class="total-value">₹${receiptData.amount}.00</span>
            </div>
            <div style="text-align: center;">
              <div class="stamp">PAID</div>
            </div>
            <div class="footer">
              This is a computer-generated receipt and does not require a signature.<br>
              © 2026 ZyrraStay Premium Residencies. All rights reserved.
            </div>
          </div>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => { window.close(); }, 500);
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
                        <p className="text-gray-400 text-sm">March 2026 Residency Billing</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Due In</p>
                      <div className="flex items-center gap-1 text-yellow-500 font-bold">
                        <Clock size={14} />
                        <span>12 Days</span>
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
                    <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                      <span className="text-white font-bold text-lg">Total Amount Due</span>
                      <span className="text-3xl font-black text-white">₹5,000.00</span>
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
                        Pay Securely Now
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
