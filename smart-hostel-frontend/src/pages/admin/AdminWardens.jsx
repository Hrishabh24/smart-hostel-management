import { useEffect, useState } from "react";
import axios from "axios";

function AdminWardens() {
  const token = localStorage.getItem("token");
  const [wardens, setWardens] = useState([]);

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchWardens();
  }, []);

  const fetchWardens = async () => {
    try {
      const res = await axios.get("http://localhost:2008/admin/wardens", config);
      setWardens(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-8 text-white">Wardens Management</h1>

      <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-lg p-6">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
              <th className="p-3 text-left text-gray-300">Name</th>
              <th className="p-3 text-left text-gray-300">Email</th>
              <th className="p-3 text-left text-gray-300">Phone</th>
              <th className="p-3 text-left text-gray-300">Assigned Block</th>
            </tr>
          </thead>
          <tbody>
            {wardens.map((warden) => (
              <tr key={warden.id} className="border-b border-white/10">
                <td className="p-3">{warden.name}</td>
                <td className="p-3">{warden.email}</td>
                <td className="p-3">{warden.phone}</td>
                <td className="p-3">{warden.block}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AdminWardens;