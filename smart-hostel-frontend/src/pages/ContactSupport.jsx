import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { MessageSquare, Shield, HelpCircle, Send, History, CheckCircle } from "lucide-react";

function ContactSupport() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchHistory();
  }, [token]);

  const fetchHistory = async () => {
    if (!token) return;
    try {
      const res = await axios.get("http://localhost:2008/student/complaints", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHistory(res.data);
    } catch (err) {
      console.error("Unable to fetch support history:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }

    if (!message.trim()) return;

    setLoading(true);
    try {
      await axios.post(
        "http://localhost:2008/complaint",
        { message, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("");
      fetchHistory();
      alert(`Your request to ${category.toUpperCase()} has been sent!`);
    } catch (err) {
      console.error("Support submission error:", err);
      alert("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "general", name: "General Help", icon: <HelpCircle size={20} />, description: "Basic hostel queries" },
    { id: "warden", name: "Contact Warden", icon: <Shield size={20} />, description: "Critical or personal issues" },
    { id: "desk", name: "Contact Desk", icon: <MessageSquare size={20} />, description: "Maintenance & service desk" },
  ];

  return (
    <div className="flex bg-[#0B0F19] min-h-screen text-gray-100">
      <Sidebar />
      <div className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <header className="mb-10">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Support Center</h1>
            <p className="text-gray-400 font-medium">Get in touch with the hostel administration</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <Send size={22} className="text-blue-500" />
                  Send a Message
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-4 uppercase tracking-widest">Select Category</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setCategory(cat.id)}
                          className={`p-4 rounded-2xl border transition-all text-left ${
                            category === cat.id
                              ? "bg-blue-600/20 border-blue-500 text-blue-400"
                              : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                          }`}
                        >
                          <div className="mb-2">{cat.icon}</div>
                          <p className="font-bold text-sm mb-1">{cat.name}</p>
                          <p className="text-[10px] opacity-60 leading-tight">{cat.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-widest">Message</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={`Explain your ${category} request in detail...`}
                      rows="6"
                      className="w-full bg-black/20 border border-white/10 rounded-2xl p-4 text-gray-200 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    ></textarea>
                  </div>

                  <button
                    disabled={loading || !message.trim()}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/40"
                  >
                    {loading ? "Sending..." : "Dispatch Message"}
                  </button>
                </form>
              </div>
            </div>

            {/* History Section */}
            <div className="space-y-6">
               <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col h-full">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <History size={22} className="text-purple-500" />
                    Interaction History
                  </h2>
                  
                  <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                    {history.length === 0 ? (
                      <div className="text-center py-10 opacity-40">
                        <MessageSquare size={40} className="mx-auto mb-2" />
                        <p className="text-sm font-bold">No history found</p>
                      </div>
                    ) : (
                      history.map((item, idx) => (
                        <div key={idx} className="bg-black/20 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-md">
                               {item.category || 'general'}
                             </span>
                             <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${item.status === 'resolved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {item.status === 'resolved' && <CheckCircle size={10} />}
                                {item.status || 'pending'}
                             </span>
                          </div>
                          <p className="text-xs text-gray-300 line-clamp-3 mb-2">{item.message}</p>
                          <p className="text-[10px] text-gray-500 font-bold">
                            {new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactSupport;
