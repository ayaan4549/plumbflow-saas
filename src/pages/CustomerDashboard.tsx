import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { api } from "../services/api";
import { motion, AnimatePresence } from "motion/react";
import { 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Wrench, 
  MessageSquare, 
  ArrowLeft, 
  Search, 
  Loader2,
  Calendar,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  History,
  Lock,
  Zap,
  ShieldCheck,
  Star,
  ArrowRight
} from "lucide-react";
import { cn } from "../lib/utils";
import { format } from "date-fns";

export default function CustomerDashboard() {
  const { subdomain } = useParams();
  const [searchParams] = useSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [searchType, setSearchType] = useState<"id" | "phone">("phone");
  const [plumber, setPlumber] = useState<any>(null);

  // Initial load from URL params if available
  useEffect(() => {
    const bookingId = searchParams.get("id");
    const phone = searchParams.get("phone");
    if (bookingId) {
      handleSearch(bookingId, "id");
    } else if (phone) {
      handleSearch(phone, "phone");
    }
  }, []);

  // Fetch plumber info
  useEffect(() => {
    if (subdomain) {
      api.get(`/plumbers/${subdomain}`)
        .then(setPlumber)
        .catch(console.error);
    }
  }, [subdomain]);

  const handleSearch = async (value: string, type: "id" | "phone") => {
    setLoading(true);
    setError(null);
    try {
      const query = type === "id" ? `bookingId=${value}` : `phone=${value}&subdomain=${subdomain}`;
      const res = await api.get(`/customer-booking?${query}`);
      
      if (Array.isArray(res)) {
        setBookings(res);
        setBooking(res[0]); // Default to most recent
      } else {
        setBooking(res);
        setBookings([res]);
      }
    } catch (err: any) {
      setError(err.error || "Booking not found. Please check your details.");
      setBooking(null);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string) => {
    switch (status) {
      case "pending": return 1;
      case "confirmed": return 2;
      case "completed": return 3;
      default: return 1;
    }
  };

  if (!booking && !loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900/50 backdrop-blur-2xl p-10 rounded-[40px] shadow-2xl border border-white/10 relative z-10"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-linear-to-br from-blue-600 to-purple-600 p-2.5 rounded-2xl shadow-lg shadow-blue-500/20">
              <Wrench className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">Track Your Job</h1>
          </div>

          <p className="text-slate-400 mb-8 font-medium">
            Enter your booking details to see real-time status and job information.
          </p>

          <div className="flex gap-2 mb-6 p-1 bg-slate-800/50 rounded-2xl border border-white/5">
            <button 
              onClick={() => setSearchType("phone")}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                searchType === "phone" ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Phone Number
            </button>
            <button 
              onClick={() => setSearchType("id")}
              className={cn(
                "flex-1 py-2.5 rounded-xl text-sm font-bold transition-all",
                searchType === "id" ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
              )}
            >
              Booking ID
            </button>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input 
                type="text"
                placeholder={searchType === "phone" ? "e.g. 07700 900000" : "e.g. 65f123abc..."}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-slate-800/50 text-white placeholder:text-slate-600"
              />
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-sm font-bold bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <button 
              onClick={() => handleSearch(searchValue, searchType)}
              disabled={!searchValue || loading}
              className="w-full bg-white text-slate-950 py-5 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-xl shadow-white/5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Track My Booking"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  const currentPlumber = booking.plumberId || plumber;
  const plan = currentPlumber?.plan || "basic";

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-200 pb-32 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full" />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => { setBooking(null); setBookings([]); setError(null); }}
              className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="hidden sm:block h-8 w-[1px] bg-white/10" />
            <div className="flex flex-col">
              <h2 className="font-bold text-white leading-tight">{currentPlumber?.businessName || "Plumber Dashboard"}</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Powered by Gnei AI Labs Ltd</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Booking ID</span>
              <span className="text-xs font-mono text-slate-300">{booking._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className={cn(
              "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
              booking.status === "completed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
              booking.status === "confirmed" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
              "bg-amber-500/10 text-amber-400 border-amber-500/20"
            )}>
              {booking.status}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-8">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Status & Timeline */}
          <div className="lg:col-span-7 space-y-8">
            {/* Status Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-blue-600/20 transition-all duration-700" />
              
              <div className="flex items-center justify-between mb-12 relative z-10">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Your Booking Status</span>
                  <h3 className="text-4xl font-extrabold text-white capitalize tracking-tight">{booking.status}</h3>
                </div>
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:scale-110",
                  booking.status === "completed" ? "bg-emerald-500/20 text-emerald-400 shadow-emerald-500/10" : "bg-blue-500/20 text-blue-400 shadow-blue-500/10"
                )}>
                  {booking.status === "completed" ? <CheckCircle2 className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
                </div>
              </div>

              {/* Progress Steps */}
              <div className="relative flex justify-between mb-4 px-2">
                <div className="absolute top-5 left-0 w-full h-1 bg-slate-800 -z-10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${((getStatusStep(booking.status) - 1) / 2) * 100}%` }}
                    className="h-full bg-linear-to-r from-blue-600 to-purple-600"
                  />
                </div>
                {[
                  { label: "Received", step: 1 },
                  { label: "Confirmed", step: 2 },
                  { label: "Completed", step: 3 }
                ].map((s) => (
                  <div key={s.step} className="flex flex-col items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-700 relative",
                      getStatusStep(booking.status) >= s.step 
                        ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]" 
                        : "bg-slate-900 border-slate-800 text-slate-600"
                    )}>
                      {getStatusStep(booking.status) > s.step ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-sm font-bold">{s.step}</span>}
                      {getStatusStep(booking.status) === s.step && (
                        <motion.div 
                          layoutId="activeStep"
                          className="absolute inset-[-4px] rounded-full border border-blue-400/50 animate-pulse"
                        />
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      getStatusStep(booking.status) >= s.step ? "text-white" : "text-slate-600"
                    )}>
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* ETA for Premium */}
              {plan === "premium" && booking.status === "confirmed" && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-12 p-6 bg-blue-600/10 rounded-3xl border border-blue-500/20 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                      <Zap className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Estimated Arrival</p>
                      <p className="text-xl font-bold text-white">Arriving in 25 mins</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Distance</p>
                    <p className="text-lg font-bold text-slate-300">1.2 miles</p>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Urgency Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="relative p-8 rounded-[40px] bg-slate-900 border border-white/5 overflow-hidden group"
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.15),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 shadow-[0_0_30px_rgba(37,99,235,0.2)]">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h4 className="text-2xl font-bold text-white">No need to call</h4>
                <p className="text-slate-400 font-medium max-w-md">
                  Your plumber is already on the way and has all your job details. We'll notify you the moment they arrive.
                </p>
              </div>
            </motion.div>

            {/* Plan-Based Features Section */}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest ml-4">Your Features</h4>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: MessageSquare, label: "WhatsApp Chat", plan: "pro", active: plan !== "basic" },
                  { icon: Zap, label: "Real-time Updates", plan: "pro", active: plan !== "basic" },
                  { icon: History, label: "Booking History", plan: "premium", active: plan === "premium" },
                  { icon: MapPin, label: "Live ETA Tracking", plan: "premium", active: plan === "premium" }
                ].map((f, i) => (
                  <div 
                    key={i}
                    className={cn(
                      "p-6 rounded-[32px] border transition-all relative overflow-hidden",
                      f.active 
                        ? "bg-slate-900/50 border-white/10 text-white" 
                        : "bg-slate-900/20 border-white/5 text-slate-600 grayscale"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center",
                        f.active ? "bg-blue-500/20 text-blue-400" : "bg-slate-800 text-slate-700"
                      )}>
                        <f.icon className="w-5 h-5" />
                      </div>
                      {!f.active && <Lock className="w-4 h-4 text-slate-700" />}
                    </div>
                    <p className="font-bold">{f.label}</p>
                    {!f.active && (
                      <div className="mt-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500/50">Upgrade to unlock</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="lg:col-span-5 space-y-8">
            {/* Job Details Card */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl space-y-8"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-bold text-white">Job Details</h4>
                {plan !== "basic" && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-500/20">
                    <ShieldCheck className="w-3 h-3" /> Priority
                  </span>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Service Type</p>
                    <p className="text-lg font-bold text-white">{booking.jobType}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Scheduled For</p>
                    <p className="text-lg font-bold text-white">
                      {booking.date ? format(new Date(booking.date), "EEEE, do MMMM") : "To be scheduled"}
                    </p>
                    {booking.date && (
                      <p className="text-sm text-slate-400 font-medium">{format(new Date(booking.date), "HH:mm")}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Address</p>
                    <p className="text-lg font-bold text-white">{booking.address}</p>
                  </div>
                </div>

                {booking.description && (
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Your Note</p>
                    <p className="text-slate-300 text-sm leading-relaxed italic">"{booking.description}"</p>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Extra Features (Premium) */}
            {plan === "premium" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-[40px] border border-white/10 shadow-2xl space-y-6"
              >
                <h4 className="text-lg font-bold text-white">Quick Actions</h4>
                <div className="space-y-3">
                  <button className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <span className="font-bold text-white">Reschedule Job</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                  </button>
                  <button className="w-full p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <History className="w-5 h-5 text-purple-400" />
                      <span className="font-bold text-white">View History</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white transition-colors" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Post-Completion Rating */}
            {booking.status === "completed" && (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-linear-to-br from-emerald-600 to-teal-600 p-8 rounded-[40px] text-white text-center shadow-2xl shadow-emerald-500/20"
              >
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
                  <Star className="w-8 h-8 fill-white" />
                </div>
                <h4 className="text-2xl font-extrabold mb-2">Job Completed!</h4>
                <p className="text-emerald-100 mb-8 font-medium">How was your experience with {currentPlumber?.businessName}?</p>
                <div className="flex justify-center gap-3 mb-8">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/30 transition-all group">
                      <Star className="w-6 h-6 group-hover:fill-white transition-all" />
                    </button>
                  ))}
                </div>
                <button className="w-full bg-white text-emerald-600 py-4 rounded-2xl font-bold hover:bg-emerald-50 transition-all shadow-xl">
                  Submit Review
                </button>
              </motion.div>
            )}

            {/* Final CTA */}
            <div className="p-8 rounded-[40px] bg-slate-900 border border-white/5 text-center space-y-6">
              <h4 className="text-xl font-bold text-white">Need another job?</h4>
              <p className="text-slate-400 text-sm">Book your next service in seconds and get priority scheduling.</p>
              <button 
                onClick={() => window.location.href = `/s/${subdomain}`}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 group"
              >
                Book in Seconds <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Actions (Mobile) */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-linear-to-t from-slate-950 via-slate-950/90 to-transparent z-40 md:hidden">
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
          <a 
            href={`tel:${currentPlumber?.phone}`}
            className="flex items-center justify-center gap-2 bg-white text-slate-950 py-4 rounded-2xl font-bold shadow-2xl active:scale-95 transition-all"
          >
            <Phone className="w-5 h-5" /> Call
          </a>
          {plan !== "basic" ? (
            <a 
              href={`https://wa.me/${currentPlumber?.phone?.replace(/\s/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-2xl active:scale-95 transition-all"
            >
              <MessageSquare className="w-5 h-5" /> WhatsApp
            </a>
          ) : (
            <button className="flex items-center justify-center gap-2 bg-slate-800 text-slate-500 py-4 rounded-2xl font-bold opacity-50 cursor-not-allowed">
              <Lock className="w-4 h-4" /> WhatsApp
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center px-6 pb-12 space-y-4">
        <div className="flex justify-center gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
          <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
          <Link to="/cookies" className="hover:text-slate-300 transition-colors">Cookies</Link>
        </div>
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
          Powered by <span className="text-slate-400">PlumbFlow</span> • Gnei AI Labs Ltd
        </p>
      </footer>
    </div>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
