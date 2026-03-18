import { useEffect, useState } from "react";
import axios from "axios";

function AdminParents() {
  const token = localStorage.getItem("token");
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignParentId, setAssignParentId] = useState("");
  const [assignStudentId, setAssignStudentId] = useState("");
  const [message, setMessage] = useState(null);

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    fetchParents();
    fetchStudents();
  }, []);

  const fetchParents = async () => {
    try {
      const res = await axios.get("http://localhost:2008/admin/parents", config);
      setParents(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get("http://localhost:2008/admin/students", config);
      setStudents(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const assign = async (e) => {
    e.preventDefault();
    if (!assignParentId || !assignStudentId) return;
    try {
      await axios.post(
        "http://localhost:2008/admin/assign-parent",
        { parentId: assignParentId, studentId: assignStudentId },
        config
      );
      setMessage("Assigned successfully");
      fetchParents();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.message || "Assignment failed");
    }
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-8 text-white">Parents Management</h1>

      {message && <p className="mb-4 text-green-600">{message}</p>}

      <form onSubmit={assign} className="mb-8 bg-[#131B2F]/80 backdrop-blur-md border border-white/5 p-6 rounded shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <h2 className="text-xl font-semibold mb-4">Assign Student to Parent</h2>
        <div className="flex flex-col sm:flex-row sm:space-x-4">
          <select
            value={assignParentId}
            onChange={(e) => setAssignParentId(e.target.value)}
            className="border p-2 rounded mb-4 sm:mb-0"
          >
            <option value="">Select parent</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.email})
              </option>
            ))}
          </select>
          <select
            value={assignStudentId}
            onChange={(e) => setAssignStudentId(e.target.value)}
            className="border p-2 rounded mb-4 sm:mb-0"
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.email})
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Assign
          </button>
        </div>
      </form>

      <div className="bg-[#131B2F]/80 backdrop-blur-md border border-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] rounded-lg p-6">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
              <th className="p-3 text-left text-gray-300">Name</th>
              <th className="p-3 text-left text-gray-300">Email</th>
              <th className="p-3 text-left text-gray-300">Phone</th>
              <th className="p-3 text-left text-gray-300">Student</th>
            </tr>
          </thead>
          <tbody>
            {parents.map((parent) => (
              <tr key={parent.id} className="border-b border-white/10">
                <td className="p-3">{parent.name}</td>
                <td className="p-3">{parent.email}</td>
                <td className="p-3">{parent.phone}</td>
                <td className="p-3">{parent.student}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AdminParents;