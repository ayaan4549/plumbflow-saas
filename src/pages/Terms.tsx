import { motion } from "motion/react";
import { Shield, FileText, Lock, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
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
            <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
              <FileText className="text-white w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Terms & Conditions</h1>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl p-8 md:p-12 space-y-10 leading-relaxed text-slate-600">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Introduction</h2>
              <p>
                Welcome to PlumbFlow. This platform is owned and operated by <strong>Gnei AI Labs Ltd</strong> ("Company", "we", "us", or "our"). 
                By accessing or using our services, you agree to be bound by these Terms & Conditions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Description of Services</h2>
              <p>
                PlumbFlow is a Software-as-a-Service (SaaS) platform designed for plumbing and heating engineers. 
                Our services include website generation, automated booking systems, customer management dashboards, and notification alerts.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Subscription & Billing</h2>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Monthly Billing:</strong> Services are provided on a monthly subscription basis. Billing occurs at the start of each cycle.</li>
                <li><strong>Plan Upgrades/Downgrades:</strong> You may change your plan at any time. Upgrades take effect immediately, while downgrades apply at the start of the next billing cycle.</li>
                <li><strong>Cancellation:</strong> You can cancel your subscription at any time through your dashboard. No refunds are provided for partial months.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. User Responsibilities</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. 
                You agree to provide accurate information and keep your business details up to date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Acceptable Use</h2>
              <p>
                You agree not to use PlumbFlow for any unlawful purposes or to transmit any malicious code. 
                Spamming customers via our notification systems is strictly prohibited and may result in immediate account termination.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Service Availability & Disclaimer</h2>
              <p>
                While we strive for 99.9% uptime, PlumbFlow is provided "as is" without warranties of any kind. 
                Gnei AI Labs Ltd is not liable for any business loss resulting from temporary service interruptions.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Gnei AI Labs Ltd shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account if you violate these terms or if your subscription payments fail.
              </p>
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
