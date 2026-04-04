import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../services/api";
import { Wrench, Loader2, AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin({ onLogin }: { onLogin: (token: string, user: any) => void }) {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/admin/login", data);
      onLogin(response.token, response.admin);
      navigate("/admin");
    } catch (err: any) {
      console.error(err);
      setError("Invalid admin credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
      >
        <Link to="/" className="flex items-center gap-2 mb-12">
          <div className="bg-linear-to-br from-red-600 to-purple-600 p-2.5 rounded-2xl shadow-lg shadow-red-500/20">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white">PlumbFlow Admin</span>
        </Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="bg-slate-900/50 backdrop-blur-2xl p-10 rounded-[40px] w-full max-w-md relative z-10 border border-white/10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-white mb-3">Admin Access</h1>
          <p className="text-slate-400 font-medium text-lg">System-wide control panel.</p>
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Admin Email</label>
            <input
              {...register("email")}
              type="email"
              className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-slate-800/50 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
              placeholder="admin@plumbflow.com"
            />
            {errors.email && <p className="text-red-400 text-xs font-bold mt-2 ml-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2 ml-1">Password</label>
            <input
              {...register("password")}
              type="password"
              className="w-full px-6 py-4 rounded-2xl border border-white/10 bg-slate-800/50 text-white focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all placeholder:text-slate-600"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-400 text-xs font-bold mt-2 ml-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-slate-950 py-5 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-3 disabled:opacity-70 group"
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
              <>
                Enter Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-white/5 text-center">
          <Link to="/login" className="text-slate-500 text-sm font-bold hover:text-white transition-colors">
            Supplier Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
