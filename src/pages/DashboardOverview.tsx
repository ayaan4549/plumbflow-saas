import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { Calendar, Clock, CheckCircle, TrendingUp, XCircle, ArrowRight, MessageSquare, Zap, Bot } from "lucide-react";
import { cn } from "../lib/utils";
import { format } from "date-fns";

import { motion } from "motion/react";

export default function DashboardOverview({ plumber, onOpenAI }: { plumber: any; onOpenAI?: () => void }) {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    api.get("/bookings", token)
      .then(setBookings)
      .catch(console.error);
  }, [plumber]);

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    completed: bookings.filter(b => b.status === "completed").length,
  };

  const smsLimit = plumber.plan === "premium" ? "Unlimited" : (plumber.plan === "pro" ? 50 : 0);
  const smsUsagePercent = typeof smsLimit === "number" ? (plumber.smsUsage / smsLimit) * 100 : 0;

  const currencySymbols: Record<string, string> = {
    GBP: "£",
    USD: "$",
    EUR: "€"
  };
  const symbol = currencySymbols[plumber.currency || "GBP"] || "£";

  const updateBookingStatus = async (id: string, status: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const updated = await api.patch(`/bookings/${id}`, { status }, token);
      setBookings(prev => prev.map(b => b._id === id ? updated : b));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteBooking = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token || !window.confirm("Are you sure?")) return;
    try {
      await api.delete(`/bookings/${id}`, token);
      setBookings(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* AI Quick Booking Card */}
      {onOpenAI && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -3 }}
          onClick={onOpenAI}
          className="w-full mb-6 md:mb-8 bg-linear-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-3xl p-5 md:p-6 flex items-center gap-4 text-left hover:from-blue-600/30 hover:to-purple-600/30 transition-all group"
        >
          <div className="bg-linear-to-br from-blue-600 to-purple-600 p-3 rounded-2xl shadow-lg shadow-blue-500/20 shrink-0">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-extrabold text-base md:text-lg">Tell AI about a job</h4>
            <p className="text-slate-400 text-xs md:text-sm font-medium mt-0.5">Just speak or type — I'll create the booking automatically</p>
          </div>
          <ArrowRight className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform shrink-0" />
        </motion.button>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
        {[
          { label: "Total Bookings", value: stats.total, icon: <Calendar className="w-5 h-5 md:w-6 md:h-6 text-white" />, color: "bg-blue-600" },
          { label: "Pending Jobs", value: stats.pending, icon: <Clock className="w-5 h-5 md:w-6 md:h-6 text-white" />, color: "bg-amber-600" },
          { label: "Completed Jobs", value: stats.completed, icon: <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-white" />, color: "bg-emerald-600" },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -5 }}
            className="bg-slate-900/50 backdrop-blur-xl p-6 md:p-8 rounded-3xl md:rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden group active:scale-[0.98] transition-all"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${stat.color}/10 blur-3xl rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500`} />
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className={cn("p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-lg", stat.color)}>{stat.icon}</div>
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-slate-600" />
            </div>
            <p className="text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-wider">{stat.label}</p>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mt-1 md:mt-2">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* SMS Usage & Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 mb-8 md:mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-900/50 backdrop-blur-xl p-6 md:p-8 rounded-3xl md:rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-purple-600/20 transition-all duration-700" />
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="bg-purple-500/20 p-2.5 md:p-3 rounded-xl md:rounded-2xl text-purple-400">
                <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <h4 className="text-lg md:text-xl font-extrabold text-white tracking-tight">SMS Notifications</h4>
                <p className="text-slate-500 text-xs md:text-sm font-medium">Managed by PlumbFlow</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xl md:text-2xl font-extrabold text-white">{plumber.smsUsage} <span className="text-slate-600 text-xs md:text-sm">/ {smsLimit}</span></p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Monthly Usage</p>
            </div>
          </div>
          
          {typeof smsLimit === "number" && smsLimit > 0 && (
            <div className="space-y-3">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(smsUsagePercent, 100)}%` }}
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    smsUsagePercent > 90 ? "bg-red-500" : (smsUsagePercent > 70 ? "bg-amber-500" : "bg-purple-500")
                  )}
                />
              </div>
              <div className="flex justify-between items-center">
                <p className="text-[10px] md:text-xs text-slate-500 font-medium">{Math.round(smsUsagePercent)}% of your monthly limit used</p>
                {smsUsagePercent > 80 && (
                  <Link to="/dashboard/pricing" className="text-[10px] md:text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors">Upgrade Plan</Link>
                )}
              </div>
            </div>
          )}

          {plumber.plan === "basic" && (
            <div className="flex items-center gap-3 md:gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 mt-4">
              <div className="bg-slate-800 p-2 rounded-lg text-slate-500 flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <p className="text-[10px] md:text-xs text-slate-400 font-medium">SMS alerts are locked on Basic. <Link to="/dashboard/pricing" className="text-blue-500 font-bold hover:underline">Upgrade to Pro</Link> to enable.</p>
            </div>
          )}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-linear-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl p-6 md:p-8 rounded-3xl md:rounded-[40px] border border-white/10 shadow-2xl flex flex-col justify-center"
        >
          <h4 className="text-xl md:text-2xl font-extrabold text-white mb-3 md:mb-4 tracking-tight">Proactive Support</h4>
          <p className="text-sm md:text-lg text-slate-300 font-medium leading-relaxed mb-6">
            Your customers receive instant updates. PlumbFlow handles all the technical complexity so you can focus on the job.
          </p>
          <div className="flex flex-wrap items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs md:text-sm">
              <CheckCircle className="w-4 h-4" /> Reliable Delivery
            </div>
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs md:text-sm">
              <Zap className="w-4 h-4" /> Instant Alerts
            </div>
          </div>
        </motion.div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl md:rounded-[40px] border border-white/10 shadow-2xl overflow-hidden">
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg md:text-xl font-extrabold text-white">Recent Bookings</h3>
          <Link to="/dashboard/bookings" className="text-blue-500 text-xs md:text-sm font-bold hover:text-blue-400 transition-colors flex items-center gap-2">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {/* Mobile View: Card List */}
        <div className="md:hidden divide-y divide-white/5">
          {bookings.slice(0, 5).map((booking) => (
            <div key={booking._id} className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-white text-lg">{booking.customerName}</p>
                  <p className="text-sm text-slate-500 font-medium">{booking.customerPhone}</p>
                </div>
                <span className="inline-block px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold border border-white/5">
                  {booking.serviceType}
                </span>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button 
                  onClick={() => updateBookingStatus(booking._id, "completed")} 
                  className="flex-1 flex items-center justify-center gap-2 py-3 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-xl transition-colors border border-emerald-500/20 text-xs font-bold"
                >
                  <CheckCircle className="w-4 h-4" /> Complete
                </button>
                <button 
                  onClick={() => deleteBooking(booking._id)} 
                  className="p-3 text-red-400 bg-red-500/5 hover:bg-red-500/10 rounded-xl transition-colors border border-red-500/20"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="p-12 text-center text-slate-500 font-medium">No recent bookings</div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Job Type</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bookings.slice(0, 5).map((booking) => (
                <tr key={booking._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-bold text-white text-lg">{booking.customerName}</p>
                    <p className="text-sm text-slate-500 font-medium">{booking.customerPhone}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-block px-4 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-white/5">{booking.serviceType}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => updateBookingStatus(booking._id, "completed")} className="p-3 text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors border border-emerald-500/20"><CheckCircle className="w-5 h-5" /></button>
                      <button onClick={() => deleteBooking(booking._id)} className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-red-500/20"><XCircle className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-slate-500 font-medium">No recent bookings</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
