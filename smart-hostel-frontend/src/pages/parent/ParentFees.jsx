import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaRegCheckCircle, FaExclamationCircle } from "react-icons/fa";

function ParentFees() {
  const [paid, setPaid] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStatus = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const { data } = await axios.get(
          "http://localhost:2008/parent/payment-status",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (data.paid) {
          setPaid(true);
          setPaymentInfo({ amount: data.amount, date: data.date });
        }
      } catch (err) {
        console.error("Could not fetch payment status:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatus();
  }, [token]);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-white mb-2">Fee Status</h2>
      <p className="text-gray-400 mb-8">View the recent fee payment records for your ward.</p>

      {loading ? (
        <p className="text-blue-400">Loading payment status...</p>
      ) : (
        <div className="max-w-md">
          {paid ? (
            <div className="bg-gradient-to-br from-[#131B2F]/80 to-[#1A2540]/80 backdrop-blur-md border border-white/5 shadow-lg rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <div className="flex items-center gap-4 mb-4">
                <FaRegCheckCircle className="text-4xl text-green-400" />
                <div>
                  <h3 className="text-xl font-bold text-white">Payment Successful</h3>
                  <p className="text-sm text-green-400 font-medium">All dues are cleared</p>
                </div>
              </div>
              
              <hr className="border-white/10 my-4" />
              
              {paymentInfo ? (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount Paid</span>
                    <span className="text-white font-semibold">₹{paymentInfo.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Date</span>
                    <span className="text-white font-semibold">{new Date(paymentInfo.date).toLocaleDateString()}</span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-300">Fees already paid.</p>
              )}
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#131B2F]/80 to-[#1A2540]/80 backdrop-blur-md border border-red-500/20 shadow-lg shadow-red-500/10 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
              
              <div className="flex items-center gap-4 mb-4">
                <FaExclamationCircle className="text-4xl text-red-500" />
                <div>
                  <h3 className="text-xl font-bold text-white">Payment Pending</h3>
                  <p className="text-sm text-red-400 font-medium">Please clear the dues</p>
                </div>
              </div>
              
              <p className="text-gray-300 text-sm mt-4">
                Currently, parents cannot pay fees directly through this portal. The student must initiate the payment from their dashboard.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ParentFees;
