import { useEffect, useState } from "react";
import axios from "axios";

function AdminFees() {
  const [payments, setPayments] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get("http://localhost:2008/admin/payments", {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setPayments(res.data));
  }, [token]);

  return (
    <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
      <h2 className="text-xl font-bold mb-4">Fee Payment History</h2>

      <table className="w-full border">
        <thead>
          <tr className="bg-white/10">
            <th>Student</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((pay, index) => (
            <tr key={index} className="text-center border-t">
              <td>{pay.name}</td>
              <td>₹{pay.amount}</td>
              <td className="text-green-600">{pay.status}</td>
              <td>{new Date(pay.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminFees;