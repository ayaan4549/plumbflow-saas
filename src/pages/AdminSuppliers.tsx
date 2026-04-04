import { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  Zap, 
  Mail, 
  Phone, 
  Globe, 
  ShieldAlert,
  ArrowRight,
  Loader2,
  Calendar
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

export default function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const data = await api.get("/admin/plumbers", token);
      setSuppliers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateSupplier = async (id: string, updates: any) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setUpdating(true);
    try {
      const updated = await api.patch(`/admin/plumbers/${id}`, updates, token);
      setSuppliers(prev => prev.map(s => s._id === id ? updated : s));
      if (selectedSupplier?._id === id) setSelectedSupplier(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s => {
    const matchesSearch = s.businessName.toLowerCase().includes(search.toLowerCase()) || 
                          s.ownerName.toLowerCase().includes(search.toLowerCase()) || 
                          s.email.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || s.plan === filter;
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
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">Supplier <span className="text-blue-500">Management</span></h1>
          <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">Manage and monitor all platform suppliers</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-black text-white uppercase tracking-widest">{suppliers.length} Total Suppliers</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-white/5 px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-4">
          <Search className="w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by business, owner or email..." 
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
              <option value="all" className="bg-slate-900">All Plans</option>
              <option value="basic" className="bg-slate-900">Basic</option>
              <option value="pro" className="bg-slate-900">Pro</option>
              <option value="premium" className="bg-slate-900">Premium</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl rounded-[40px] border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-10 py-6">Supplier</th>
                <th className="px-10 py-6">Plan</th>
                <th className="px-10 py-6">SMS Usage</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      <span className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading Suppliers...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredSuppliers.map((s) => (
                <tr key={s._id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center font-black text-blue-500 border border-blue-500/20">
                        {s.businessName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-white text-lg tracking-tight">{s.businessName}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{s.ownerName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <span className={cn(
                      "inline-block px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border",
                      s.plan === "premium" ? "bg-purple-500/10 text-purple-400 border-purple-500/20" : 
                      s.plan === "pro" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : 
                      "bg-slate-800 text-slate-400 border-white/5"
                    )}>
                      {s.plan}
                    </span>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden w-24">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            (s.smsUsage / (s.smsLimit || 1)) > 0.9 ? "bg-red-500" : "bg-blue-500"
                          )}
                          style={{ width: `${Math.min((s.smsUsage / (s.smsLimit || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs font-black text-white">{s.smsUsage} <span className="text-slate-600">/ {s.smsLimit || 0}</span></span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", s.status === "active" ? "bg-emerald-500" : "bg-red-500")} />
                      <span className={cn("text-[10px] font-black uppercase tracking-widest", s.status === "active" ? "text-emerald-400" : "text-red-400")}>
                        {s.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <button 
                      onClick={() => setSelectedSupplier(s)}
                      className="p-3 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">No suppliers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Modal */}
      <AnimatePresence>
        {selectedSupplier && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedSupplier(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center font-black text-white text-2xl shadow-2xl shadow-blue-500/20">
                      {selectedSupplier.businessName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-white tracking-tight">{selectedSupplier.businessName}</h3>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Supplier ID: {selectedSupplier._id.slice(-8)}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedSupplier(null)} className="p-3 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-2xl border border-white/5">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 text-slate-400">
                      <Mail className="w-5 h-5 text-blue-500" />
                      <span className="font-bold">{selectedSupplier.email}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                      <Phone className="w-5 h-5 text-blue-500" />
                      <span className="font-bold">{selectedSupplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                      <Globe className="w-5 h-5 text-blue-500" />
                      <span className="font-bold">plumbflow.com/s/{selectedSupplier.subdomain}</span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 text-slate-400">
                      <Calendar className="w-5 h-5 text-blue-500" />
                      <span className="font-bold">Joined: {new Date(selectedSupplier.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                      <Zap className="w-5 h-5 text-blue-500" />
                      <span className="font-bold">Current Plan: {selectedSupplier.plan.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center gap-4 text-slate-400">
                      <ShieldAlert className="w-5 h-5 text-blue-500" />
                      <span className="font-bold">Account Status: {selectedSupplier.status.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-10 border-t border-white/5 space-y-6">
                  <h4 className="text-sm font-black text-slate-500 uppercase tracking-widest">Platform Actions</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button 
                      disabled={updating}
                      onClick={() => updateSupplier(selectedSupplier._id, { status: selectedSupplier.status === "active" ? "inactive" : "active" })}
                      className={cn(
                        "flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-sm transition-all active:scale-[0.98] disabled:opacity-50",
                        selectedSupplier.status === "active" ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                      )}
                    >
                      {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                        <>
                          {selectedSupplier.status === "active" ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                          {selectedSupplier.status === "active" ? "Deactivate Supplier" : "Activate Supplier"}
                        </>
                      )}
                    </button>
                    <div className="relative group">
                      <select 
                        disabled={updating}
                        value={selectedSupplier.plan}
                        onChange={(e) => updateSupplier(selectedSupplier._id, { plan: e.target.value })}
                        className="w-full bg-white/5 text-white py-5 px-6 rounded-2xl font-black text-sm border border-white/10 outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all"
                      >
                        <option value="basic" className="bg-slate-900">Basic Plan</option>
                        <option value="pro" className="bg-slate-900">Pro Plan</option>
                        <option value="premium" className="bg-slate-900">Premium Plan</option>
                      </select>
                      <TrendingUp className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
