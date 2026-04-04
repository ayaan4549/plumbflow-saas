import { motion } from "motion/react";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight,
  MessageSquare,
  ShieldCheck,
  Mail
} from "lucide-react";
import { cn } from "../lib/utils";
import { api } from "../services/api";

export default function AdminOverview({ stats }: { stats: any }) {
  if (!stats) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  const cards = [
    { label: "Total Suppliers", value: stats.plumberCount, icon: <Users className="w-6 h-6 text-white" />, color: "bg-blue-600", trend: "+12%", up: true },
    { label: "Total Bookings", value: stats.bookingCount, icon: <Calendar className="w-6 h-6 text-white" />, color: "bg-purple-600", trend: "+24%", up: true },
    { label: "Active Subscriptions", value: stats.activeSubscriptions, icon: <Zap className="w-6 h-6 text-white" />, color: "bg-amber-600", trend: "+5%", up: true },
    { label: "Monthly Revenue", value: `£${stats.mrr.toLocaleString()}`, icon: <TrendingUp className="w-6 h-6 text-white" />, color: "bg-emerald-600", trend: "+18%", up: true },
  ];

  const handleTriggerSummary = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await api.post("/admin/trigger-summary", {}, token);
      alert("Daily summary email triggered successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to trigger summary email.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Platform <span className="text-blue-500">Overview</span></h1>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">Real-time system monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleTriggerSummary}
            className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-3 transition-all active:scale-95"
          >
            <Mail className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Trigger Summary Email</span>
          </button>
          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">System Online</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden group active:scale-[0.98] transition-all"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${card.color}/10 blur-3xl rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500`} />
            <div className="flex items-center justify-between mb-6">
              <div className={cn("p-3 rounded-2xl shadow-lg", card.color)}>{card.icon}</div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg",
                card.up ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"
              )}>
                {card.trend} {card.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <p className="text-slate-500 text-xs font-black uppercase tracking-widest">{card.label}</p>
            <h3 className="text-4xl font-black text-white mt-2 tracking-tighter">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-white tracking-tight">System Health</h3>
            <button className="text-blue-500 text-xs font-black uppercase tracking-widest hover:text-blue-400 transition-colors">View Logs</button>
          </div>
          <div className="space-y-6">
            {[
              { label: "API Response Time", value: "42ms", status: "Optimal", color: "bg-emerald-500" },
              { label: "Database Connection", value: "Active", status: "Stable", color: "bg-emerald-500" },
              { label: "Email Delivery Rate", value: "99.8%", status: "High", color: "bg-emerald-500" },
              { label: "SMS Gateway Status", value: "Connected", status: "Active", color: "bg-emerald-500" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 group hover:bg-white/[0.07] transition-all">
                <div className="flex items-center gap-4">
                  <div className={cn("w-3 h-3 rounded-full shadow-lg", item.color)} />
                  <span className="font-bold text-slate-300">{item.label}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-white font-black">{item.value}</span>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-linear-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl p-10 rounded-[40px] border border-white/10 shadow-2xl flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-32 -mt-32 group-hover:scale-150 transition-transform duration-700" />
          <ShieldCheck className="w-16 h-16 text-blue-500 mb-8" />
          <h4 className="text-2xl font-black text-white mb-4 tracking-tight leading-tight">God Mode <br />is Active</h4>
          <p className="text-slate-400 font-medium leading-relaxed mb-8">
            You have full platform control. Monitor all activity, manage suppliers, and ensure PlumbFlow reliability.
          </p>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4" /> Secure
            </div>
            <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-widest">
              <Zap className="w-4 h-4" /> Real-time
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
