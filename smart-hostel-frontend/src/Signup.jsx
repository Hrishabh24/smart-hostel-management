import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import Loader from "./components/Loader";

function Signup() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
        studentEmail: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            ...(name === "role" && value !== "parent" ? { studentEmail: "" } : {}),
        }));
        setError("");
    };

    // Password strength logic
    const getPasswordStrength = () => {
        const { password } = formData;
        if (password.length < 8) return "Weak";
        if (/[A-Z]/.test(password) && /\d/.test(password)) return "Strong";
        return "Medium";
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters.");
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        if (formData.role === "parent" && !formData.studentEmail.trim()) {
            setError("Please enter the student's email to connect.");
            setLoading(false);
            return;
        }

        try {
            await axios.post("http://localhost:2008/register", {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });

            // Auto-login after signup
            const loginRes = await axios.post("http://localhost:2008/login", {
              email: formData.email,
              password: formData.password,
            });

            const { token, role } = loginRes.data;
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);

            // If parent, connect to student
            if (role === "parent") {
              try {
                await axios.post(
                  "http://localhost:2008/parent/link-student",
                  { studentEmail: formData.studentEmail },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
              } catch (linkErr) {
                setError(linkErr.response?.data?.message || "Failed to link parent to student");
                setLoading(false);
                return;
              }
            }

            // Redirect based on role
            if (role === "warden") {
              navigate("/warden-dashboard");
            } else if (role === "parent") {
              navigate("/parent-dashboard");
            } else if (role === "admin") {
              navigate("/admin-dashboard");
            } else {
              navigate("/dashboard");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Signup Failed");
        }

        setLoading(false);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#0B0F19] p-6 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />

            <div className="flex w-full max-w-5xl bg-[#131B2F]/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative z-10">

                {/* LEFT BRAND PANEL */}
                <div className="hidden md:flex flex-col justify-center p-12 w-1/2 bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-r border-white/5 text-white relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl font-extrabold mb-4 tracking-tight">
                            Zyrra<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Stay</span>
                        </h2>
                        <p className="text-lg mb-8 text-gray-300 leading-relaxed">Secure. Efficient. Transparent.</p>
                        <ul className="space-y-4 text-sm text-gray-300">
                            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div> FinTech Grade Security</li>
                            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Role Based Access</li>
                            <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div> Real-Time Sync Ecosystem</li>
                        </ul>
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="flex flex-col justify-center p-10 w-full md:w-1/2 bg-[#0B0F19]/50">
                    <h2 className="text-3xl font-bold text-white mb-8">Create Your Account</h2>

                    <form onSubmit={handleSignup}>
                        <input type="text" name="name" placeholder="Full Name" className="w-full p-4 mb-4 bg-[#131B2F] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-500" onChange={handleChange} required />
                        <input type="email" name="email" placeholder="Email Address" className="w-full p-4 mb-4 bg-[#131B2F] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-500" onChange={handleChange} required />

                        <div className="relative mb-2">
                            <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" className="w-full p-4 bg-[#131B2F] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-500 pr-12" onChange={handleChange} required />
                            <span className="absolute right-4 top-4 cursor-pointer text-gray-400 hover:text-white transition-colors" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </span>
                        </div>

                        <div className="text-sm mb-4 px-1">Strength: <span className={getPasswordStrength() === "Strong" ? "text-green-500 font-medium" : getPasswordStrength() === "Medium" ? "text-yellow-500 font-medium" : "text-red-500 font-medium"}>{getPasswordStrength()}</span></div>

                        <input type="password" name="confirmPassword" placeholder="Confirm Password" className="w-full p-4 mb-5 bg-[#131B2F] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-500" onChange={handleChange} required />

                        <select name="role" className="w-full p-4 mb-5 bg-[#131B2F] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" onChange={handleChange}>
                            <option value="student">Student</option>
                            <option value="warden">Warden</option>
                            <option value="parent">Parent</option>
                        </select>

                        {formData.role === "parent" && (
                            <input
                                type="email"
                                name="studentEmail"
                                placeholder="Student Email to Connect"
                                className="w-full p-4 mb-5 bg-[#131B2F] border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-gray-500"
                                value={formData.studentEmail}
                                onChange={handleChange}
                                required
                            />
                        )}

                        {error && <div className="mb-4 text-red-500 text-sm px-1">{error}</div>}

                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-xl font-bold shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)] transform hover:-translate-y-0.5 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? <Loader inline className="h-5 w-5 text-white" size={18} /> : "Complete Registration"}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-gray-400 space-y-3">
                        <p>
                            Already part of ZyrraStay?{" "}
                            <Link
                                to="/login"
                                className="text-purple-400 font-semibold hover:text-purple-300 hover:underline transition-colors"
                            >
                                Sign In
                            </Link>
                        </p>

                        <div className="pt-4 border-t border-white/5 mt-4">
                          <p>
                              Administrator Portal?{" "}
                              <Link
                                  to="/AdminLogin"
                                  className="text-fuchsia-400 font-semibold hover:text-fuchsia-300 hover:underline transition-colors"
                              >
                                  Admin Login
                              </Link>
                          </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

export default Signup;
