import { useState, useEffect } from "react";
import { api } from "../services/api";
import { CheckCircle, XCircle, Phone, MapPin, Calendar as CalendarIcon, Download } from "lucide-react";
import { cn } from "../lib/utils";
import { format } from "date-fns";

import { motion } from "motion/react";

export default function BookingsList({ plumber }: { plumber: any }) {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    
    api.get("/bookings", token)
      .then(setBookings)
      .catch(console.error);
  }, [plumber]);

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

  const exportToCSV = () => {
    const headers = ["Customer Name", "Phone", "Address", "Job Type", "Status", "Date"];
    const rows = bookings.map(b => [
      b.customerName,
      b.phone,
      b.address,
      b.jobType,
      b.status,
      b.date ? format(new Date(b.date), "yyyy-MM-dd HH:mm") : "N/A"
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bookings_${plumber.businessName}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/50 backdrop-blur-xl rounded-[40px] border border-white/10 shadow-2xl overflow-hidden"
    >
      <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div>
          <h3 className="text-xl font-extrabold text-white">All Bookings</h3>
          <p className="text-sm text-slate-400 font-medium mt-1">Manage your customer requests and job statuses.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:bg-white/10 px-5 py-2.5 rounded-2xl transition-all border border-white/10"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>
      <div className="divide-y divide-white/5">
        {bookings.length === 0 ? (
          <div className="p-20 text-center">
            <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
              <CalendarIcon className="w-10 h-10 text-slate-600" />
            </div>
            <h4 className="text-xl font-bold text-white mb-2">No bookings yet</h4>
            <p className="text-slate-500">When customers book through your site, they'll appear here.</p>
          </div>
        ) : bookings.map((booking, index) => (
          <motion.div 
            key={booking._id} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-8 hover:bg-white/[0.02] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-8 group"
          >
            <div className="flex-grow space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-blue-500/20">
                  {booking.customerName.charAt(0)}
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-xl tracking-tight">{booking.customerName}</h4>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mt-2 font-medium">
                    <span className="flex items-center gap-2 hover:text-blue-500 transition-colors cursor-pointer"><Phone className="w-4 h-4" /> {booking.customerPhone}</span>
                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {booking.address}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="bg-slate-800 text-slate-300 px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/5">{booking.serviceType}</span>
                <span className={cn(
                  "px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border",
                  booking.status === "pending" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                  booking.status === "confirmed" && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                  booking.status === "completed" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                )}>
                  {booking.status}
                </span>
                <span className="flex items-center gap-2 text-xs text-slate-600 font-bold uppercase tracking-widest">
                  <CalendarIcon className="w-4 h-4" />
                  {booking.date ? format(new Date(booking.date), "dd MMM yyyy, HH:mm") : "N/A"}
                </span>
              </div>
              {booking.description && (
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/20 rounded-full" />
                  <p className="text-sm text-slate-400 pl-6 italic leading-relaxed">
                    "{booking.description}"
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              {booking.status !== "completed" && (
                <button 
                  onClick={() => updateBookingStatus(booking._id, "completed")}
                  className="bg-white text-slate-950 px-8 py-4 rounded-2xl text-sm font-bold hover:bg-slate-100 transition-all shadow-xl shadow-white/5 flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Mark Completed
                </button>
              )}
              <button 
                onClick={() => deleteBooking(booking._id)}
                className="p-4 text-red-400 hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
