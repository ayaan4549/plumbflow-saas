import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../services/api";
import { cn } from "../lib/utils";

export default function AdminDashboard({ user, onLogout }: { user: any; onLogout: () => void }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", path: "/admin" },
    { icon: Users, label: "All Suppliers", path: "/admin/suppliers" },
    { icon: Calendar, label: "All Bookings", path: "/admin/bookings" },
    { icon: CreditCard, label: "Subscriptions", path: "/admin/subscriptions" },
    { icon: TrendingUp, label: "Revenue", path: "/admin/revenue" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
  ];

  const handleLogout = () => {
    onLogout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed lg:relative z-50 w-72 h-screen bg-slate-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col"
          >
            <div className="p-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-linear-to-br from-red-600 to-purple-600 p-2 rounded-xl shadow-lg shadow-red-500/20">
                  <ShieldCheck className="text-white w-5 h-5" />
                </div>
                <span className="text-xl font-extrabold tracking-tight">AdminPanel</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 px-4 space-y-2 mt-4">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                      isActive 
                        ? "bg-white text-slate-950 shadow-xl shadow-white/5" 
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "text-slate-950" : "text-slate-400"}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-6 border-t border-white/5">
              <div className="flex items-center gap-3 px-4 py-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-red-500 to-purple-500 flex items-center justify-center font-bold text-white">
                  {user.name?.[0] || "A"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate">{user.name || "Super Admin"}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto relative">
        {/* Background Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-white/5 p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="text-slate-400 hover:text-white transition-colors">
                <Menu className="w-6 h-6" />
              </button>
            )}
            <h2 className="text-xl font-extrabold">
              {menuItems.find(m => m.path === location.pathname)?.label || "Dashboard"}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-white/10 px-4 py-2 rounded-xl">
              <Search className="w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search everything..." 
                className="bg-transparent border-none outline-none text-sm w-48 placeholder:text-slate-600"
              />
            </div>
            <div className="flex items-center gap-2 bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/20">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Super Admin</span>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/suppliers" element={<AdminSuppliers />} />
            <Route path="/bookings" element={<AdminBookings />} />
            <Route path="/subscriptions" element={<AdminSubscriptions />} />
            <Route path="/revenue" element={<AdminRevenue />} />
            <Route path="/settings" element={<AdminSettings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function AdminOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats")
      .then(data => setStats(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-red-500" /></div>;

  const cards = [
    { label: "Total Suppliers", value: stats.plumberCount, icon: Users, color: "bg-blue-500", trend: "+12%" },
    { label: "Total Bookings", value: stats.bookingCount, icon: Calendar, color: "bg-purple-500", trend: "+24%" },
    { label: "Active Subs", value: stats.activeSubscriptions, icon: CreditCard, color: "bg-emerald-500", trend: "+8%" },
    { label: "Monthly Revenue", value: `£${stats.mrr.toLocaleString()}`, icon: TrendingUp, color: "bg-red-500", trend: "+15%" },
  ];

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 ${card.color}/10 blur-3xl rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500`} />
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} p-3 rounded-2xl shadow-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-emerald-400 text-sm font-bold">
                <ArrowUpRight className="w-4 h-4" />
                {card.trend}
              </div>
            </div>
            <p className="text-slate-400 font-bold text-sm mb-1">{card.label}</p>
            <h3 className="text-3xl font-extrabold">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[40px] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-extrabold">Revenue Growth</h3>
            <select className="bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm font-bold outline-none">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-4">
            {[40, 65, 45, 80, 55, 90].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  className="w-full bg-linear-to-t from-red-600/20 to-red-600 rounded-t-xl relative group"
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-slate-950 text-xs font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    £{h * 100}
                  </div>
                </motion.div>
                <span className="text-xs font-bold text-slate-500">Month {i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[40px] p-8">
          <h3 className="text-xl font-extrabold mb-8">System Health</h3>
          <div className="space-y-6">
            {[
              { label: "API Latency", value: "24ms", color: "bg-emerald-500" },
              { label: "DB Load", value: "12%", color: "bg-blue-500" },
              { label: "Error Rate", value: "0.02%", color: "bg-emerald-500" },
              { label: "Server CPU", value: "34%", color: "bg-purple-500" },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-400">{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${item.color} rounded-full`} style={{ width: item.value.includes('%') ? item.value : '80%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminSuppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/plumbers")
      .then(data => setSuppliers(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-red-500" /></div>;

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-xl font-extrabold">All Suppliers</h3>
        <button className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-white/10">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-8 py-6 text-sm font-bold text-slate-500">Business</th>
              <th className="px-8 py-6 text-sm font-bold text-slate-500">Owner</th>
              <th className="px-8 py-6 text-sm font-bold text-slate-500">Plan</th>
              <th className="px-8 py-6 text-sm font-bold text-slate-500">Status</th>
              <th className="px-8 py-6 text-sm font-bold text-slate-500">Joined</th>
              <th className="px-8 py-6 text-sm font-bold text-slate-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {suppliers.map((s) => (
              <tr key={s._id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-blue-500 border border-white/5">
                      {s.businessName[0]}
                    </div>
                    <div>
                      <p className="font-bold">{s.businessName}</p>
                      <p className="text-xs text-slate-500">{s.subdomain}.plumbflow.com</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="font-bold">{s.ownerName}</p>
                  <p className="text-xs text-slate-500">{s.email}</p>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    s.plan === 'premium' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    s.plan === 'pro' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {s.plan}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <span className="text-sm font-bold text-emerald-400">Active</span>
                  </div>
                </td>
                <td className="px-8 py-6 text-sm text-slate-400 font-medium">
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-white">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/bookings")
      .then(data => setBookings(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-red-500" /></div>;

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-xl font-extrabold">Global Bookings</h3>
        <div className="flex gap-3">
          <button className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-sm font-bold transition-colors border border-white/10">Export</button>
          <button className="bg-white text-slate-950 px-4 py-2 rounded-xl text-sm font-bold transition-colors">New Booking</button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-8 py-6 text-sm font-bold text-slate-500">Customer</th>
              <th className="px-8 py-6 text-sm font-bold text-slate-500">Service</th>
              <th className="px-8 py-6 text-sm font-bold text-slate-500">Supplier</th>
              <th className="px-8 py-6 text-sm font-bold text-slate-500">Status</th>
              <th className="px-8 py-6 text-sm font-bold text-slate-500">Date</th>
              <th className="px-8 py-6 text-sm font-bold text-slate-500"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {bookings.map((b) => (
              <tr key={b._id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-6">
                  <p className="font-bold">{b.customerName}</p>
                  <p className="text-xs text-slate-500">{b.customerPhone}</p>
                </td>
                <td className="px-8 py-6">
                  <p className="font-bold">{b.serviceType}</p>
                  <p className="text-xs text-slate-500 truncate max-w-[150px]">{b.address}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-blue-400 border border-white/5">
                      {b.plumberId?.businessName?.[0] || "P"}
                    </div>
                    <span className="text-sm font-bold">{b.plumberId?.businessName || "Unknown"}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${
                    b.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    b.status === 'confirmed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-sm text-slate-400 font-medium">
                  {new Date(b.date).toLocaleDateString()}
                </td>
                <td className="px-8 py-6 text-right">
                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-500 hover:text-white">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminSubscriptions() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/plumbers")
      .then(setSuppliers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-red-500" /></div>;

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden">
      <div className="p-8 border-b border-white/5">
        <h3 className="text-xl font-extrabold">Subscription Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5">
              <th className="px-8 py-6 text-sm font-bold text-slate-500">Supplier</th>
              <th className="px-8 py-6 text-sm font-bold text-slate-500">Current Plan</th>
              <th className="px-8 py-6 text-sm font-bold text-slate-500">Status</th>
              <th className="px-8 py-6 text-sm font-bold text-slate-500">Next Billing</th>
              <th className="px-8 py-6 text-sm font-bold text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {suppliers.map((s) => (
              <tr key={s._id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-8 py-6 font-bold">{s.businessName}</td>
                <td className="px-8 py-6">
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider",
                    s.plan === 'premium' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                    s.plan === 'pro' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  )}>
                    {s.plan}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    Active
                  </span>
                </td>
                <td className="px-8 py-6 text-sm text-slate-400 font-medium">
                  {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}
                </td>
                <td className="px-8 py-6">
                  <button className="text-blue-500 hover:text-blue-400 text-sm font-bold">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminRevenue() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats")
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-red-500" /></div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[32px]">
          <p className="text-slate-400 font-bold text-sm mb-2">Total MRR</p>
          <h3 className="text-4xl font-extrabold">£{stats.mrr.toLocaleString()}</h3>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[32px]">
          <p className="text-slate-400 font-bold text-sm mb-2">Total ARR</p>
          <h3 className="text-4xl font-extrabold text-emerald-400">£{(stats.mrr * 12).toLocaleString()}</h3>
        </div>
        <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-[32px]">
          <p className="text-slate-400 font-bold text-sm mb-2">Avg. Revenue Per User</p>
          <h3 className="text-4xl font-extrabold text-blue-400">£49</h3>
        </div>
      </div>

      <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[40px] p-8">
        <h3 className="text-xl font-extrabold mb-8">Revenue History</h3>
        <div className="h-80 flex items-end justify-between gap-2">
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-3">
              <motion.div 
                initial={{ height: 0 }}
                animate={{ height: `${Math.random() * 60 + 20}%` }}
                className="w-full bg-linear-to-t from-emerald-600/20 to-emerald-600 rounded-t-xl"
              />
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Month {i+1}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminSettings() {
  return (
    <div className="max-w-2xl bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-[40px] p-10">
      <h3 className="text-2xl font-extrabold mb-8">System Settings</h3>
      <div className="space-y-8">
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest">Platform Name</label>
          <input 
            type="text" 
            defaultValue="PlumbFlow Admin"
            className="w-full bg-slate-800 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-medium"
          />
        </div>
        <div className="space-y-4">
          <label className="block text-sm font-bold text-slate-400 uppercase tracking-widest">Admin Email</label>
          <input 
            type="email" 
            defaultValue="thuan.musafer@gmail.com"
            className="w-full bg-slate-800 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 transition-all font-medium"
          />
        </div>
        <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/5">
          <div>
            <p className="font-bold">Maintenance Mode</p>
            <p className="text-xs text-slate-500">Disable platform access for all users</p>
          </div>
          <div className="w-12 h-6 bg-slate-700 rounded-full relative cursor-pointer">
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
          </div>
        </div>
        <button className="w-full bg-red-600 hover:bg-red-500 text-white font-extrabold py-5 rounded-2xl transition-all shadow-xl shadow-red-600/20">
          Save System Changes
        </button>
      </div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
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
      className={`animate-spin ${className}`}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
