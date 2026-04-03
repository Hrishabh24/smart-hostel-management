import React from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, FileText } from "lucide-react";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-[#0B0F19] text-gray-100 p-6 md:p-12 overflow-x-hidden selection:bg-blue-500/30 selection:text-white relative">
      {/* Background Animated Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px]" />
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
            <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
              <FileText size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
              Terms of Use
            </h1>
          </div>
          <p className="text-gray-400 text-lg">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-[#131B2F]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)] space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
            <p className="text-gray-400 leading-relaxed">
              These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and ZyrraStay ("we," "us" or "our"), concerning your access to and use of our hostel management application and related services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. User Accounts & Responsibilities</h2>
            <ul className="list-disc list-inside text-gray-400 leading-relaxed space-y-2">
              <li>You must keep your account and password confidential.</li>
              <li>You are responsible for all activities that occur under your account.</li>
              <li>Any fraudulent, abusive, or otherwise illegal activity may be grounds for termination of your account at our sole discretion.</li>
              <li>Administrative features (e.g. room assignment) cannot be altered directly by students and are managed strictly by verified Wardens/Admins.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Payments & Fees</h2>
            <p className="text-gray-400 leading-relaxed mb-3">
              All financial transactions are conducted strictly through our secure payment gateway (Razorpay). 
            </p>
            <ul className="list-disc list-inside text-gray-400 leading-relaxed space-y-2">
              <li>Fees are due strictly according to the agreed billing cycle.</li>
              <li>Late payments may incur additional fines as dictated by the hostel administration.</li>
              <li>In the event of a payment failure or dispute, please contact our support desk with your Transaction ID.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Code of Conduct</h2>
            <p className="text-gray-400 leading-relaxed">
              We aim to ensure a peaceful and disciplined residential environment. System features such as complaint tickets and leave requests must not be abused. False claims or spamming the warden/desk may lead to disciplinary action by the administration.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Modifications</h2>
            <p className="text-gray-400 leading-relaxed">
              We reserve the right to modify these terms at any time. Significant changes will be explicitly communicated to you via the notifications portal. Continued use of the platform after any such changes constitutes your consent to the updated terms.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
