import { motion } from "motion/react";
import { Shield, FileText, Lock, ArrowLeft, Cookie } from "lucide-react";
import { Link } from "react-router-dom";

export default function Cookies() {
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
            <div className="bg-amber-600 p-3 rounded-2xl shadow-lg shadow-amber-200">
              <Cookie className="text-white w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Cookie Policy</h1>
          </div>

          <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl p-8 md:p-12 space-y-10 leading-relaxed text-slate-600">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">1. What are Cookies?</h2>
              <p>
                Cookies are small text files stored on your device when you visit a website. 
                They help us recognize your browser and remember certain information to improve your experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Types of Cookies We Use</h2>
              <ul className="list-disc pl-6 space-y-3">
                <li><strong>Essential Cookies:</strong> These are necessary for the platform to function correctly, such as maintaining your login session and security features.</li>
                <li><strong>Analytics Cookies:</strong> We use these to understand how users interact with PlumbFlow, allowing us to improve performance and usability.</li>
                <li><strong>Functional Cookies:</strong> These remember your preferences, such as your selected currency or language settings.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Purpose of Cookies</h2>
              <p>We use cookies to:</p>
              <ul className="list-disc pl-6 space-y-3">
                <li>Verify your identity and keep you logged in.</li>
                <li>Track platform performance and identify technical issues.</li>
                <li>Store your personalized settings and preferences.</li>
                <li>Ensure the security of your account and data.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Managing Cookies</h2>
              <p>
                You can manage or disable cookies through your browser settings. 
                Please note that disabling essential cookies may prevent you from using certain features of the PlumbFlow platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Third-Party Cookies</h2>
              <p>
                Some of our service providers (such as Stripe for payments) may also place cookies on your device to facilitate their services. 
                These are governed by their respective privacy and cookie policies.
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
