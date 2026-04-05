import { useState, useEffect } from "react";
import { api } from "../services/api";
import { CheckCircle, XCircle, Phone, MapPin, Calendar as CalendarIcon, Download, Bot } from "lucide-react";
import { cn } from "../lib/utils";
import { format } from "date-fns";

import { motion } from "motion/react";

export default function BookingsList({ plumber, onOpenAI }: { plumber: any; onOpenAI?: () => void }) {
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

  const markAsViewed = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const updated = await api.patch(`/bookings/${id}/view`, {}, token);
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
      <div className="p-6 md:p-8 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between bg-white/[0.02] gap-4">
        <div>
          <h3 className="text-lg md:text-xl font-extrabold text-white">All Bookings</h3>
          <p className="text-xs md:text-sm text-slate-400 font-medium mt-1">Manage your customer requests and job statuses.</p>
        </div>
        <div className="flex items-center gap-3">
          {onOpenAI && (
            <button
              onClick={onOpenAI}
              className="flex items-center justify-center gap-2 text-xs md:text-sm font-bold text-white bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 md:px-5 py-2.5 rounded-xl md:rounded-2xl transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
            >
              <Bot className="w-4 h-4" /> AI Add Booking
            </button>
          )}
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 text-xs md:text-sm font-bold text-slate-300 hover:bg-white/10 px-4 md:px-5 py-2.5 rounded-xl md:rounded-2xl transition-all border border-white/10 active:scale-[0.98]"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>
      <div className="divide-y divide-white/5">
        {bookings.length === 0 ? (
          <div className="p-12 md:p-20 text-center">
            <div className="bg-white/5 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5">
              <CalendarIcon className="w-8 h-8 md:w-10 md:h-10 text-slate-600" />
            </div>
            <h4 className="text-lg md:text-xl font-bold text-white mb-2">No bookings yet</h4>
            <p className="text-sm md:text-base text-slate-500">When customers book through your site, they'll appear here.</p>
          </div>
        ) : bookings.map((booking, index) => (
          <motion.div 
            key={booking._id} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-6 md:p-8 hover:bg-white/[0.02] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8 group"
          >
            <div 
              className="flex-grow space-y-4 md:space-y-6 cursor-pointer"
              onClick={() => !booking.viewedBySupplier && markAsViewed(booking._id)}
            >
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-lg md:text-xl font-bold shadow-lg shadow-blue-500/20 flex-shrink-0 relative">
                  {booking.customerName.charAt(0)}
                  {!booking.viewedBySupplier && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-slate-900 animate-pulse" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h4 className="font-extrabold text-white text-lg md:text-xl tracking-tight truncate">{booking.customerName}</h4>
                    {booking.backupSmsSent && (
                      <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-md uppercase tracking-widest border border-blue-400/20">Backup SMS Sent</span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs md:text-sm text-slate-400 mt-1 md:mt-2 font-medium">
                    <span className="flex items-center gap-2 hover:text-blue-500 transition-colors cursor-pointer truncate"><Phone className="w-3.5 h-3.5" /> {booking.phone}</span>
                    <span className="flex items-center gap-2 truncate"><MapPin className="w-3.5 h-3.5" /> {booking.address}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-4">
                <span className="bg-slate-800 text-slate-300 px-3 py-1 md:px-4 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider border border-white/5">{booking.jobType}</span>
                <span className={cn(
                  "px-3 py-1 md:px-4 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-wider border",
                  booking.status === "pending" && "bg-amber-500/10 text-amber-400 border-amber-500/20",
                  booking.status === "confirmed" && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                  booking.status === "completed" && "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                )}>
                  {booking.status}
                </span>
                <span className="flex items-center gap-2 text-[10px] md:text-xs text-slate-600 font-bold uppercase tracking-widest">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  {booking.date ? format(new Date(booking.date), "dd MMM yyyy, HH:mm") : "N/A"}
                </span>
              </div>
              {booking.description && (
                <div className="relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/20 rounded-full" />
                  <p className="text-xs md:text-sm text-slate-400 pl-4 md:pl-6 italic leading-relaxed">
                    "{booking.description}"
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 pt-2 md:pt-0">
              {booking.status !== "completed" && (
                <button 
                  onClick={() => updateBookingStatus(booking._id, "completed")}
                  className="flex-1 lg:flex-none bg-white text-slate-950 px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-sm font-bold hover:bg-slate-100 transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <CheckCircle className="w-4 h-4" /> <span className="whitespace-nowrap">Mark Completed</span>
                </button>
              )}
              <button 
                onClick={() => deleteBooking(booking._id)}
                className="p-3 md:p-4 text-red-400 hover:bg-red-500/10 rounded-xl md:rounded-2xl transition-all border border-transparent hover:border-red-500/20 active:scale-[0.98]"
              >
                <XCircle className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
