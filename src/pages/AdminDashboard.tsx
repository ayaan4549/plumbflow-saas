import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from "react-router-dom";
import { api } from "../services/api";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Menu, 
  X, 
  Wrench,
  TrendingUp,
  ShieldAlert,
  Zap,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from "motion/react";

// Admin Sub-pages
import AdminOverview from "./AdminOverview";
import AdminSuppliers from "./AdminSuppliers";
import AdminBookings from "./AdminBookings";
import AdminAnalytics from "./AdminAnalytics";

export default function AdminDashboard({ user, onLogout }: { user: any, onLogout: any }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    api.get("/admin/stats", token)
      .then(setStats)
      .catch(console.error);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    onLogout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-72 bg-slate-900/50 backdrop-blur-2xl border-r border-white/5 z-50 transition-transform duration-500 lg:relative lg:translate-x-0 flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="bg-linear-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-2xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <Wrench className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-black text-white tracking-tighter">PlumbFlow <span className="text-blue-500">Admin</span></span>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-grow p-6 space-y-2 overflow-y-auto no-scrollbar">
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-4">Platform Control</div>
          {[
            { to: "/admin", icon: LayoutDashboard, label: "Overview" },
            { to: "/admin/suppliers", icon: Users, label: "Suppliers" },
            { to: "/admin/bookings", icon: Calendar, label: "Bookings" },
            { to: "/admin/analytics", icon: BarChart3, label: "Analytics" },
          ].map((item) => (
            <Link 
              key={item.to}
              to={item.to} 
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all group",
                location.pathname === item.to 
                  ? "bg-white text-slate-950 shadow-2xl shadow-white/5" 
                  : "text-slate-500 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110",
                location.pathname === item.to ? "text-slate-950" : "text-slate-500"
              )} />
              {item.label}
            </Link>
          ))}
          
          <div className="pt-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-4">System Settings</div>
          {[
            { to: "/admin/settings", icon: Settings, label: "Platform Settings" },
            { to: "/admin/alerts", icon: ShieldAlert, label: "Security Alerts" },
          ].map((item) => (
            <Link 
              key={item.to}
              to={item.to} 
              className={cn(
                "flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all group",
                location.pathname === item.to 
                  ? "bg-white text-slate-950 shadow-2xl shadow-white/5" 
                  : "text-slate-500 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform group-hover:scale-110",
                location.pathname === item.to ? "text-slate-950" : "text-slate-500"
              )} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <div className="bg-white/5 p-4 rounded-2xl mb-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-black text-white">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user.name}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Super Admin</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-5 py-4 w-full rounded-2xl font-bold text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Logout System
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 md:px-10 bg-slate-950/50 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden md:flex items-center gap-2 text-slate-500 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-blue-500" />
              <span>God Mode Active</span>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden sm:flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
              <Search className="w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search platform..." 
                className="bg-transparent border-none outline-none text-xs font-bold text-white placeholder:text-slate-600 w-40"
              />
            </div>
            <button className="relative p-2.5 text-slate-500 hover:text-white transition-colors bg-white/5 rounded-xl border border-white/5 group">
              <Bell className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-950" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar">
          <Routes>
            <Route path="/" element={<AdminOverview stats={stats} />} />
            <Route path="/suppliers" element={<AdminSuppliers />} />
            <Route path="/bookings" element={<AdminBookings />} />
            <Route path="/analytics" element={<AdminAnalytics />} />
            <Route path="*" element={<Navigate to="/admin" />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
