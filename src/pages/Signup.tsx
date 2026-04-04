import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../services/api";
import { Wrench, Loader2, AlertCircle, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase";

const signupSchema = z.z.object({
  businessName: z.string().min(2, "Business name is too short"),
  ownerName: z.string().min(2, "Owner name is too short"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().min(10, "Invalid phone number"),
  subdomain: z.string().min(3, "Subdomain must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers, and hyphens allowed"),
});

type SignupForm = z.infer<typeof signupSchema>;

export default function Signup({ onSignup }: { onSignup: (token: string, user: any) => void }) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupForm) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/signup", data);
      onSignup(response.token, response.plumber);
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      
      const response = await api.post("/auth/google", { idToken });
      onSignup(response.token, response.plumber);
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google Sign-In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <Link to="/" className="flex items-center gap-2 mb-12">
          <div className="bg-linear-to-br from-blue-600 to-purple-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
            <Wrench className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white">PlumbFlow</span>
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="bg-slate-900/50 backdrop-blur-2xl p-10 rounded-[40px] w-full max-w-xl relative z-10 border border-white/10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-white mb-3">Create your account</h1>
          <p className="text-slate-400 font-medium text-lg">Join the UK's fastest growing plumbing network.</p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 text-red-400 p-4 rounded-2xl mb-8 flex items-start gap-3 border border-red-500/20"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-bold">{error}</p>
          </motion.div>
        )}

        <div className="space-y-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-slate-800/50 border border-white/10 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-3 disabled:opacity-70"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-black text-slate-600">
              <span className="bg-slate-900/50 px-4">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Business Name</label>
              <input
                {...register("businessName")}
                className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-slate-800/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                placeholder="e.g. Glasgow Heating Pros"
              />
              {errors.businessName && <p className="text-red-400 text-xs font-bold mt-2 ml-1">{errors.businessName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Owner Name</label>
              <input
                {...register("ownerName")}
                className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-slate-800/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                placeholder="John Doe"
              />
              {errors.ownerName && <p className="text-red-400 text-xs font-bold mt-2 ml-1">{errors.ownerName.message}</p>}
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Phone Number</label>
              <input
                {...register("phone")}
                className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-slate-800/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                placeholder="07123 456789"
              />
              {errors.phone && <p className="text-red-400 text-xs font-bold mt-2 ml-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Desired Subdomain</label>
            <div className="relative group">
              <input
                {...register("subdomain")}
                className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-slate-800/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-40 placeholder:text-slate-600"
                placeholder="my-business"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm pointer-events-none group-focus-within:text-blue-500 transition-colors">
                .plumbflow.co.uk
              </span>
            </div>
            {errors.subdomain && <p className="text-red-400 text-xs font-bold mt-2 ml-1">{errors.subdomain.message}</p>}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Email Address</label>
              <input
                {...register("email")}
                type="email"
                className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-slate-800/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-red-400 text-xs font-bold mt-2 ml-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Password</label>
              <input
                {...register("password")}
                type="password"
                className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-slate-800/50 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-400 text-xs font-bold mt-2 ml-1">{errors.password.message}</p>}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-slate-950 py-5 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 disabled:opacity-70 group"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-slate-500 mt-10 font-medium">
          Already have an account? <Link to="/login" className="text-white font-bold hover:text-blue-400 transition-colors">Log in</Link>
        </p>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap justify-center gap-6 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
          <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
          <Link to="/cookies" className="hover:text-slate-400 transition-colors">Cookies</Link>
        </div>
        <p className="text-center text-[10px] text-slate-700 font-bold uppercase tracking-[0.2em] mt-4">
          © 2026 PlumbFlow • Gnei AI Labs Ltd
        </p>
      </motion.div>
    </div>
  );
}
