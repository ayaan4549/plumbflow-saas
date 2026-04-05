import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Routes, Route } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";
import {
  LayoutDashboard,
  Calendar,
  Settings,
  LogOut,
  Wrench,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  MoreVertical,
  Phone,
  MapPin,
  User,
  TrendingUp,
  Users,
  Bell,
  Plus,
  Bot
} from "lucide-react";
import { cn } from "../lib/utils";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../services/api";

import DashboardOverview from "./DashboardOverview";
import BookingsList from "./BookingsList";
import Pricing from "./Pricing";
import SettingsPage from "./SettingsPage";
import Analytics from "./Analytics";
import Customers from "./Customers";
import AIBookingAssistant from "../components/AIBookingAssistant";

export default function Dashboard({ user, onLogout }: { user: any, onLogout: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [plumber, setPlumber] = useState<any>(user);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);

  useEffect(() => {
    // Close sidebar on route change on mobile
    setIsSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchNotifications = async () => {
      try {
        const data = await api.get("/notifications", token);
        setNotifications(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = async (id: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await api.patch(`/notifications/${id}/read`, {}, token);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-950 text-white font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 flex text-white overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "w-72 bg-slate-900/50 backdrop-blur-2xl border-r border-white/10 flex flex-col fixed h-full z-50 transition-transform duration-300 md:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-br from-blue-600 to-purple-600 p-2 md:p-2.5 rounded-xl md:rounded-2xl shadow-lg shadow-blue-500/20">
              <Wrench className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-xl md:text-2xl font-extrabold tracking-tight text-white">PlumbFlow</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-grow p-6 space-y-2 overflow-y-auto">
          {[
            { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
            { to: "/dashboard/bookings", icon: Calendar, label: "Bookings" },
            { to: "/dashboard/customers", icon: Users, label: "Customers" },
            { to: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
            { to: "/dashboard/pricing", icon: TrendingUp, label: "Pricing" },
            { to: "/dashboard/settings", icon: Settings, label: "Settings" },
          ].map((item) => (
            <Link 
              key={item.to}
              to={item.to} 
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all group",
                location.pathname === item.to 
                  ? "bg-white text-slate-950 shadow-xl shadow-white/5" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110",
                location.pathname === item.to ? "text-slate-950" : "text-slate-400"
              )} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-5 py-4 w-full rounded-2xl font-bold text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow md:ml-72 h-screen overflow-y-auto p-6 md:p-12 bg-slate-950 relative no-scrollbar">
        {/* Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />
        
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 relative z-40 gap-6">
          <div className="flex items-center justify-between w-full md:w-auto">
            <div className="md:hidden">
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-3 bg-slate-900/50 border border-white/10 rounded-xl text-slate-400"
              >
                <LayoutDashboard className="w-6 h-6" />
              </button>
            </div>
            <div className="hidden md:block">
              <h1 className="text-3xl font-extrabold text-white mb-2">Welcome back, {plumber?.ownerName}</h1>
              <p className="text-slate-400 font-medium text-lg">Here's what's happening with <span className="text-blue-500 font-bold">{plumber?.businessName}</span> today.</p>
            </div>
            <div className="md:hidden flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-3 bg-slate-900/50 border border-white/10 rounded-xl text-slate-400 relative"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950" />}
                </button>
              </div>
              <a 
                href={`/s/${plumber?.subdomain}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-white text-slate-950 rounded-xl"
              >
                <ExternalLink className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Desktop Header Content (Mobile version handled above) */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-4 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all relative group"
              >
                <Bell className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-96 bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-2xl overflow-hidden z-50"
                  >
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                      <h4 className="font-extrabold text-white">Notifications</h4>
                      <span className="text-xs font-bold text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full">{unreadCount} New</span>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto divide-y divide-white/5">
                      {notifications.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 font-medium">No notifications yet</div>
                      ) : notifications.map(n => (
                        <div 
                          key={n._id} 
                          onClick={() => markAsRead(n._id)}
                          className={cn(
                            "p-6 hover:bg-white/5 transition-colors cursor-pointer group",
                            !n.read && "bg-blue-500/[0.02]"
                          )}
                        >
                          <div className="flex gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                              n.type === "booking" ? "bg-blue-500/10 text-blue-400" : "bg-purple-500/10 text-purple-400"
                            )}>
                              {n.type === "booking" ? <Calendar className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white mb-1">{n.title}</p>
                              <p className="text-xs text-slate-400 leading-relaxed">{n.message}</p>
                              <p className="text-[10px] text-slate-600 mt-2 font-bold uppercase tracking-widest">{format(new Date(n.createdAt), "HH:mm, dd MMM")}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a 
              href={`/s/${plumber?.subdomain}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-white text-slate-950 px-6 py-4 rounded-2xl text-sm font-bold hover:bg-slate-100 transition-all shadow-xl shadow-white/5 group"
            >
              View My Site <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* Mobile Welcome Message */}
          <div className="md:hidden">
            <h1 className="text-2xl font-extrabold text-white mb-1">Hi, {plumber?.ownerName}</h1>
            <p className="text-slate-500 text-sm font-medium">Managing <span className="text-blue-500 font-bold">{plumber?.businessName}</span></p>
          </div>
        </header>

        <div className="relative z-10">
          <Routes>
            <Route index element={<DashboardOverview plumber={plumber} onOpenAI={() => setShowAIAssistant(true)} />} />
            <Route path="bookings" element={<BookingsList plumber={plumber} onOpenAI={() => setShowAIAssistant(true)} />} />
            <Route path="customers" element={<Customers />} />
            <Route path="analytics" element={<Analytics plumber={plumber} />} />
            <Route path="pricing" element={<Pricing plumber={plumber} />} />
            <Route path="settings" element={<SettingsPage plumber={plumber} />} />
          </Routes>
        </div>
      </main>

      {/* Floating AI Booking Button */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAIAssistant(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-linear-to-r from-blue-600 to-purple-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl shadow-blue-500/30 font-bold text-sm hover:shadow-blue-500/50 transition-all"
      >
        <Bot className="w-5 h-5" />
        <span className="hidden sm:inline">Quick Booking via AI</span>
        <span className="sm:hidden">AI</span>
      </motion.button>

      {/* AI Booking Assistant Panel */}
      <AIBookingAssistant
        open={showAIAssistant}
        onClose={() => setShowAIAssistant(false)}
        plumber={plumber}
      />
    </div>
  );
}

function BarChart3({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 3v18h18" />
      <path d="M18 17V9" />
      <path d="M13 17V5" />
      <path d="M8 17v-3" />
    </svg>
  );
}
