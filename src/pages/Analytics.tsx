import { useState, useEffect } from "react";
import { api } from "../services/api";
import { motion } from "motion/react";
import { TrendingUp, Users, Calendar, DollarSign, BarChart3, PieChart } from "lucide-react";
import { cn } from "../lib/utils";

export default function Analytics({ plumber }: { plumber?: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currencySymbols: Record<string, string> = {
    GBP: "£",
    USD: "$",
    EUR: "€"
  };
  const symbol = currencySymbols[plumber?.currency || "GBP"] || "£";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    api.get("/analytics", token)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20 text-white">Loading analytics...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Analytics Overview</h2>
        <div className="inline-flex text-[10px] font-bold text-slate-500 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 uppercase tracking-widest self-start sm:self-auto">
          Demo data for illustration purposes only
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: "Total Revenue", value: `${symbol}${data.totalRevenue}`, icon: DollarSign, color: "bg-emerald-600" },
          { label: "Avg. Job Value", value: `${symbol}80`, icon: TrendingUp, color: "bg-blue-600" },
          { label: "Conversion Rate", value: "12%", icon: BarChart3, color: "bg-purple-600" },
          { label: "Active Customers", value: "48", icon: Users, color: "bg-amber-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 backdrop-blur-xl p-6 md:p-8 rounded-3xl md:rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color}/10 blur-3xl rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500`} />
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-lg", stat.color)}>
                <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
            </div>
            <p className="text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-white mt-1 md:mt-2">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl md:rounded-[40px] p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-extrabold text-white mb-6 md:mb-8 flex items-center gap-3">
            <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-500" /> Monthly Bookings
          </h3>
          <div className="h-48 md:h-64 flex items-end justify-between gap-2 md:gap-4">
            {data.monthlyBookings.map((m: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 md:gap-3">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(m.count / Math.max(...data.monthlyBookings.map((x: any) => x.count || 1))) * 100}%` }}
                  className="w-full bg-linear-to-t from-blue-600/20 to-blue-600 rounded-t-lg md:rounded-t-xl relative group min-h-[4px]"
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-950 text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {m.count} jobs
                  </div>
                </motion.div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{m.month.substring(0, 3)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl md:rounded-[40px] p-6 md:p-8">
          <h3 className="text-lg md:text-xl font-extrabold text-white mb-6 md:mb-8 flex items-center gap-3">
            <PieChart className="w-5 h-5 md:w-6 md:h-6 text-purple-500" /> Job Distribution
          </h3>
          <div className="space-y-4 md:space-y-6">
            {data.jobTypes.map((type: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs md:text-sm font-bold">
                  <span className="text-slate-400">{type.name}</span>
                  <span className="text-white">{type.count} jobs</span>
                </div>
                <div className="h-2 md:h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(type.count / Math.max(1, data.jobTypes.reduce((acc: number, curr: any) => acc + curr.count, 0))) * 100}%` }}
                    className="h-full bg-linear-to-r from-blue-600 to-purple-600 rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
