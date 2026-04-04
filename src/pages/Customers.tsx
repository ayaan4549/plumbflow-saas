import { useState, useEffect } from "react";
import { api } from "../services/api";
import { motion } from "motion/react";
import { Users, Phone, Mail, MapPin, Search, Filter, MoreVertical, MessageSquare } from "lucide-react";
import { cn } from "../lib/utils";

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    api.get("/bookings", token)
      .then(bookings => {
        // Extract unique customers from bookings
        const uniqueCustomers = Array.from(new Set(bookings.map((b: any) => b.customerPhone)))
          .map(phone => {
            const lastBooking = bookings.find((b: any) => b.customerPhone === phone);
            return {
              name: lastBooking.customerName,
              phone: lastBooking.customerPhone,
              address: lastBooking.address,
              lastJob: lastBooking.serviceType,
              totalJobs: bookings.filter((b: any) => b.customerPhone === phone).length,
              id: phone
            };
          });
        setCustomers(uniqueCustomers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  if (loading) return <div className="flex justify-center py-20 text-white">Loading customers...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex-grow max-w-md relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search customers by name or phone..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl px-12 py-4 text-white outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
          />
        </div>
        <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-4 rounded-2xl text-sm font-bold transition-colors border border-white/10 text-white">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl rounded-[40px] border border-white/10 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <th className="px-8 py-5">Customer</th>
                <th className="px-8 py-5">Contact</th>
                <th className="px-8 py-5">Last Job</th>
                <th className="px-8 py-5">Total Jobs</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-blue-500/20">
                        {customer.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">{customer.name}</p>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> {customer.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-300 font-bold flex items-center gap-2"><Phone className="w-4 h-4 text-blue-500" /> {customer.phone}</p>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-2"><Mail className="w-4 h-4 text-slate-600" /> customer@example.com</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-block px-4 py-1.5 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold border border-white/5">{customer.lastJob}</span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-xs border border-blue-500/20">
                        {customer.totalJobs}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="p-3 text-slate-400 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/10"><MessageSquare className="w-5 h-5" /></button>
                      <button className="p-3 text-slate-400 hover:bg-white/5 rounded-xl transition-colors border border-transparent hover:border-white/10"><MoreVertical className="w-5 h-5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
