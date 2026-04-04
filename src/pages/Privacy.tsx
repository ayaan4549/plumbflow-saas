import { motion } from "motion/react";
import { Shield, FileText, Lock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-bold">
            <ArrowLeft className="w-5 h-5" /> Back to Home
          </Link>
          <span className="text-xl font-bold tracking-tight text-slate-900">PlumbFlow Legal</span>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-200">
              <Shield className="text-white w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Privacy Policy</h1>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl p-8 md:p-12 space-y-10 leading-relaxed text-slate-600">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Company Identity</h2>
              <p>
                <strong>Gnei AI Labs Ltd</strong> is the data controller for all personal information processed through the PlumbFlow platform. 
                We are committed to protecting your privacy and ensuring your data is handled securely and in compliance with GDPR.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Data Collected</h2>
              <p>We collect and process the following categories of personal data:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Account Information:</strong> Name, email address, phone number, and business details.</li>
                <li><strong>Booking Details:</strong> Customer names, addresses, phone numbers, and job descriptions submitted through your booking pages.</li>
                <li><strong>Usage Data:</strong> Information on how you interact with our platform, including login times and feature usage.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How Data is Used</h2>
              <p>Your data is used for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Managing Bookings:</strong> To facilitate the scheduling and tracking of plumbing jobs.</li>
                <li><strong>Notifications:</strong> Sending automated SMS alerts via <strong>Twilio</strong> and email notifications via <strong>SendGrid</strong>.</li>
                <li><strong>Service Improvement:</strong> To analyze platform performance and develop new features.</li>
                <li><strong>Support:</strong> To respond to your inquiries and resolve technical issues.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Third-Party Services</h2>
              <p>We share necessary data with trusted third-party providers to deliver our services:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Twilio:</strong> Used for sending SMS notifications to plumbers and customers.</li>
                <li><strong>SendGrid:</strong> Used for sending email notifications and account-related communications.</li>
                <li><strong>Stripe:</strong> Used for processing subscription payments securely.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Data Protection & Storage</h2>
              <p>
                We implement industry-standard security measures to protect your data from unauthorized access, disclosure, or alteration. 
                All data is stored on secure servers with encrypted connections.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. User Rights</h2>
              <p>Under GDPR, you have the following rights regarding your personal data:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Access:</strong> Request a copy of the data we hold about you.</li>
                <li><strong>Deletion:</strong> Request that we delete your personal information.</li>
                <li><strong>Correction:</strong> Request that we update or correct inaccurate data.</li>
                <li><strong>Contact Support:</strong> For any privacy-related inquiries, please contact us through your dashboard.</li>
              </ul>
            </section>

            <div className="pt-10 border-t border-slate-100 text-sm font-bold text-slate-400 uppercase tracking-widest">
              Last Updated: April 2026 • Gnei AI Labs Ltd
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="bg-white border-t border-slate-100 py-12 px-6 text-center">
        <p className="text-slate-500 font-medium">© 2026 PlumbFlow. Powered by Gnei AI Labs Ltd</p>
      </footer>
    </div>
  );
}
