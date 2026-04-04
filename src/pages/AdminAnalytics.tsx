import { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Zap, 
  ArrowUpRight, 
  Loader2,
  PieChart as PieIcon,
  Activity
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion } from "motion/react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function AdminAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const analytics = await api.get("/admin/analytics", token);
      setData(analytics);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b"];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Platform <span className="text-blue-500">Analytics</span></h1>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">Deep dive into platform performance and growth</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <Activity className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-black text-white uppercase tracking-widest">Live Data</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bookings Trend */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-500" /> Bookings Trend
            </h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last 30 Days</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.bookingsPerDay}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '16px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supplier Growth */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-purple-500" /> Supplier Growth
            </h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last 6 Months</span>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.supplierGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '16px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#8b5cf6' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
              <PieIcon className="w-5 h-5 text-amber-500" /> Plan Distribution
            </h3>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Current Distribution</span>
          </div>
          <div className="h-80 w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.planDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.planDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '16px', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4 pr-10">
              {data.planDistribution.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs font-black text-white uppercase tracking-widest">{entry.name}</span>
                  <span className="text-xs font-bold text-slate-500">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SMS Usage & System Load */}
        <div className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl flex flex-col justify-center">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
              <Zap className="w-5 h-5 text-blue-500" /> System Usage
            </h3>
          </div>
          <div className="space-y-10">
            <div>
              <div className="flex justify-between mb-4">
                <span className="text-sm font-bold text-slate-400">Total SMS Sent</span>
                <span className="text-sm font-black text-white">{data.totalSmsUsage}</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  className="h-full bg-blue-600 rounded-full shadow-lg shadow-blue-500/20"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-4">
                <span className="text-sm font-bold text-slate-400">Backup SMS Reminders</span>
                <span className="text-sm font-black text-white">{data.backupSmsCount}</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "42%" }}
                  className="h-full bg-purple-600 rounded-full shadow-lg shadow-purple-500/20"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-4">
                <span className="text-sm font-bold text-slate-400">Database Load</span>
                <span className="text-sm font-black text-white">18%</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "18%" }}
                  className="h-full bg-emerald-600 rounded-full shadow-lg shadow-emerald-500/20"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
