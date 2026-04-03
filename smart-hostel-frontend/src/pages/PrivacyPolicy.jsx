import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 p-6 md:p-12 overflow-x-hidden selection:bg-purple-500/30 selection:text-white relative">
      {/* Background Animated Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-400 font-medium mb-8 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Home
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-400">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Privacy Framework
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p className="text-gray-400 leading-relaxed">
              Welcome to ZyrraStay. We are committed to protecting your personal information and your right to privacy.
              This Privacy Framework explains what data we collect, how it is used, and what rights you have in relation to it.
              By using our applications and services, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Data We Collect</h2>
            <ul className="list-disc list-inside text-gray-400 leading-relaxed space-y-2">
              <li><strong className="text-gray-300">Personal Identification:</strong> Name, email address, phone number, profile pictures.</li>
              <li><strong className="text-gray-300">Hostel Data:</strong> Room assignments, attendance logs, leave requests, complaint history.</li>
              <li><strong className="text-gray-300">Financial Data:</strong> Fee payment statuses and transaction references (we do not store your full banking or credit card details on our servers; they are processed securely via Razorpay).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-400 leading-relaxed mb-3">Your information is strictly used to:</p>
            <ul className="list-disc list-inside text-gray-400 leading-relaxed space-y-2">
              <li>Provide and maintain our hostel management services.</li>
              <li>Notify you about attendance, leave approvals, and fee dues.</li>
              <li>Provide customer support through our Warden and Service Desks.</li>
              <li>Ensure the safety and security of all residents.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
            <p className="text-gray-400 leading-relaxed">
              We use state-of-the-art encryption technologies and follow FinTech grade security practices. Our backend uses secure SSL transmission and hashed passwords via bcrypt. While no online service is 100% secure, we continuously monitor our systems to prevent unauthorized access.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
            <p className="text-gray-400 leading-relaxed">
              If you have any questions or concerns about our privacy practices, please contact us at: <br/><br/>
              <strong className="text-white">Email:</strong> privacy@zyrrastay.com<br/>
              <strong className="text-white">Support:</strong> +91 8471041134
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
