import { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  Calendar, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MapPin, 
  Phone, 
  User, 
  Wrench,
  Loader2,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const data = await api.get("/admin/bookings", token);
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch = b.customerName.toLowerCase().includes(search.toLowerCase()) || 
                          b.plumberId?.businessName?.toLowerCase().includes(search.toLowerCase()) || 
                          b.jobType.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || b.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Platform <span className="text-blue-500">Bookings</span></h1>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">Monitor all job requests across the platform</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-black text-white uppercase tracking-widest">{bookings.length} Total Bookings</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white/5 px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-4">
          <Search className="w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by customer, supplier or job type..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-bold text-white placeholder:text-slate-600 w-full"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/5 px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-4">
            <Filter className="w-5 h-5 text-slate-500" />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-bold text-white cursor-pointer"
            >
              <option value="all" className="bg-slate-900">All Statuses</option>
              <option value="pending" className="bg-slate-900">Pending</option>
              <option value="confirmed" className="bg-slate-900">Confirmed</option>
              <option value="completed" className="bg-slate-900">Completed</option>
              <option value="cancelled" className="bg-slate-900">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl rounded-[40px] border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-10 py-6">Customer & Job</th>
                <th className="px-10 py-6">Supplier</th>
                <th className="px-10 py-6">Date</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Bookings...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBookings.map((b) => (
                <tr key={b._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center font-black text-blue-500 border border-blue-500/20">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-white text-lg tracking-tight">{b.customerName}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{b.jobType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center font-black text-slate-400 text-xs border border-white/5">
                        {b.plumberId?.businessName?.charAt(0) || "?"}
                      </div>
                      <span className="font-bold text-slate-300">{b.plumberId?.businessName || "Unknown"}</span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-white font-bold text-sm">
                        <Calendar className="w-3 h-3 text-blue-500" />
                        {new Date(b.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                        <Clock className="w-3 h-3" />
                        {new Date(b.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={cn(
                      "inline-block px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                      b.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                      b.status === "confirmed" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : 
                      b.status === "cancelled" ? "bg-red-500/10 text-red-400 border-red-500/20" : 
                      "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    )}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10 group">
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">No bookings found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
