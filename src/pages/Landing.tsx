import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wrench, 
  ShieldCheck, 
  Clock, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Layout, 
  Zap, 
  Users, 
  Bell, 
  Calendar,
  Smartphone,
  BarChart3,
  MousePointer2,
  ChevronRight,
  TrendingUp
} from "lucide-react";
import { cn } from "../lib/utils";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 }
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { staggerChildren: 0.1 }
};

export default function Landing() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-linear-to-br from-blue-600 to-purple-600 p-2 rounded-xl shadow-lg shadow-blue-200">
              <Wrench className="text-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="text-xl md:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-linear-to-r from-slate-900 to-slate-700">
              PlumbFlow
            </span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-slate-600 font-medium">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
            <div className="h-4 w-px bg-slate-200" />
            <Link to="/login" className="hover:text-blue-600 transition-colors">Login</Link>
            <Link to="/signup" className="bg-slate-900 text-white px-6 py-2.5 rounded-full hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 font-semibold">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
          >
            {isMenuOpen ? <CheckCircle2 className="w-6 h-6 rotate-45" /> : <Layout className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-4 font-semibold text-slate-600">
                <a href="#features" onClick={() => setIsMenuOpen(false)} className="py-2 hover:text-blue-600">Features</a>
                <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="py-2 hover:text-blue-600">How it Works</a>
                <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="py-2 hover:text-blue-600">Pricing</a>
                <div className="h-px bg-slate-100 my-2" />
                <Link to="/login" className="py-2 hover:text-blue-600">Login</Link>
                <Link to="/signup" className="bg-slate-900 text-white px-6 py-4 rounded-2xl text-center hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
                  Get Started
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-48 pb-20 md:pb-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-glow -z-10" />
        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 md:mb-8 text-sm font-semibold text-blue-600 bg-blue-50/50 rounded-full border border-blue-100 backdrop-blur-sm"
          >
            <Zap className="w-4 h-4 fill-blue-600" />
            <span>The #1 Platform for UK Plumbers</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-8xl font-extrabold tracking-tight mb-6 md:mb-8 leading-[1.1] md:leading-[1.05]"
          >
            Stop missing jobs. <br />
            <span className="text-gradient">Automate your business.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-2xl text-slate-600 mb-10 md:mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            A professional website, automated booking system, and a powerful dashboard. 
            Built specifically for independent plumbers and heating engineers in the UK.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/signup" className="w-full sm:w-auto bg-slate-900 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-2 group active:scale-[0.98]">
              Start Free Trial <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a href="#demo" className="w-full sm:w-auto px-10 py-5 rounded-2xl text-lg font-bold text-slate-700 bg-white hover:bg-slate-50 transition-all border border-slate-200 shadow-sm flex items-center justify-center gap-2 active:scale-[0.98]">
              View Live Demo <MousePointer2 className="w-5 h-5" />
            </a>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="px-6 pb-20 md:pb-32">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl border border-slate-200 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden bg-white"
          >
            {/* Mock Dashboard UI */}
            <div className="flex flex-col h-[400px] md:h-[600px]">
              <div className="h-12 md:h-16 border-b border-slate-100 flex items-center justify-between px-4 md:px-6 bg-slate-50/50">
                <div className="flex items-center gap-2 md:gap-4">
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex items-center gap-2 text-xs md:text-sm font-medium text-slate-400 truncate max-w-[200px] md:max-w-none">
                  <Globe className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" /> plumbflow.com/dashboard
                </div>
                <div className="w-10 md:w-20" />
              </div>
              <div className="flex flex-1 overflow-hidden">
                <div className="w-64 border-r border-slate-100 p-6 space-y-6 hidden md:block">
                  <div className="space-y-2">
                    {[
                      { icon: <Layout className="w-4 h-4" />, label: "Overview", active: true },
                      { icon: <Calendar className="w-4 h-4" />, label: "Bookings" },
                      { icon: <Users className="w-4 h-4" />, label: "Customers" },
                      { icon: <BarChart3 className="w-4 h-4" />, label: "Analytics" },
                    ].map((item, i) => (
                      <div key={i} className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                        item.active ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:bg-slate-50"
                      )}>
                        {item.icon} {item.label}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-1 p-4 md:p-8 bg-white overflow-y-auto no-scrollbar">
                  <div className="flex items-center justify-between mb-6 md:mb-8">
                    <h3 className="text-xl md:text-2xl font-bold">Recent Bookings</h3>
                    <button className="bg-blue-600 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold">New Job</button>
                  </div>
                  <div className="space-y-3 md:space-y-4">
                    {[
                      { name: "James Wilson", service: "Boiler Repair", status: "Pending", time: "10:30 AM", color: "amber" },
                      { name: "Sarah Jenkins", service: "Leaking Tap", status: "Confirmed", time: "1:00 PM", color: "blue" },
                      { name: "Robert Brown", service: "Full Bathroom Install", status: "Completed", time: "Yesterday", color: "emerald" },
                      { name: "Emily Davis", service: "Emergency Leak", status: "Pending", time: "Just now", color: "amber" },
                    ].map((booking, i) => (
                      <div key={i} className="flex items-center justify-between p-3 md:p-4 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors">
                        <div className="flex items-center gap-3 md:gap-4">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-xs md:text-base">
                            {booking.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm md:text-base">{booking.name}</div>
                            <div className="text-xs md:text-sm text-slate-500">{booking.service}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 md:gap-6">
                          <div className="text-[10px] md:text-sm font-medium text-slate-400 whitespace-nowrap">{booking.time}</div>
                          <div className={cn(
                            "px-2 md:px-3 py-0.5 md:py-1 rounded-lg text-[10px] md:text-xs font-bold whitespace-nowrap",
                            booking.color === "amber" && "bg-amber-100 text-amber-700",
                            booking.color === "blue" && "bg-blue-100 text-blue-700",
                            booking.color === "emerald" && "bg-emerald-100 text-emerald-700"
                          )}>
                            {booking.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative Glow */}
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">How It Works</h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">A simple, automated workflow designed to save you time and win more jobs.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connector Lines (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-slate-200 -z-10" />
            
            {[
              {
                step: "01",
                icon: <Smartphone className="w-8 h-8" />,
                title: "Customer books a job",
                desc: "Your professional website allows customers to book jobs 24/7, even while you're on site or asleep."
              },
              {
                step: "02",
                icon: <Bell className="w-8 h-8" />,
                title: "Instant Notification",
                desc: "Receive an instant alert on your phone via email and SMS with all the job details and customer info."
              },
              {
                step: "03",
                icon: <Layout className="w-8 h-8" />,
                title: "Manage in Dashboard",
                desc: "Track progress, update status, and manage your entire schedule from your powerful central hub."
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.2 }}
                className="relative bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all active:scale-[0.98]"
              >
                <div className="absolute -top-6 left-8 md:left-10 w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-200">
                  {item.step}
                </div>
                <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-blue-600">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Plumbers Use PlumbFlow */}
      <section className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Why Plumbers Use PlumbFlow</h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">Built by engineers, for engineers. We focus on the real value your business needs.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: "Never miss a job",
                desc: "Automated booking means you're always open. No more missed calls or lost leads while you're under a sink."
              },
              {
                icon: <Calendar className="w-8 h-8" />,
                title: "Get bookings automatically",
                desc: "Your website works for you. Customers find you, book you, and you just show up to do the work."
              },
              {
                icon: <ShieldCheck className="w-8 h-8" />,
                title: "Manage work easily",
                desc: "Ditch the paper diary. Everything you need to manage your business is in one clean, mobile-friendly dashboard."
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                className="p-8 md:p-10 rounded-[40px] bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-2xl hover:shadow-blue-100/50 transition-all group active:scale-[0.98]"
              >
                <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-8 text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything you need to grow</h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">Powerful tools designed specifically for the modern UK plumber.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: <Globe className="w-6 h-6" />,
                title: "Auto-Generated Website",
                desc: "A stunning, mobile-optimized website that converts visitors into customers automatically."
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "24/7 Online Booking",
                desc: "Never miss a lead again. Your business stays open even when you're asleep or working."
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: "Job Management",
                desc: "A powerful dashboard to track every job from the initial inquiry to final payment."
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Instant Alerts",
                desc: "Get notified via email and SMS the second a new job is booked on your site."
              },
              {
                icon: <BarChart3 className="w-6 h-6" />,
                title: "Business Analytics",
                desc: "See your most profitable job types and track your growth over time with clear data."
              },
              {
                icon: <Smartphone className="w-6 h-6" />,
                title: "Mobile First",
                desc: "Manage your entire business from your phone while you're on the road or on site."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                {...fadeIn}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="glass p-8 md:p-10 rounded-3xl group cursor-default active:scale-[0.98] transition-all"
              >
                <div className="bg-slate-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dark Section with Stats */}
      <section className="py-20 md:py-32 px-6 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/20 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-purple-600/20 blur-[150px] rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid md:grid-cols-2 gap-16 md:gap-20 items-center">
            <motion.div {...fadeIn}>
              <h2 className="text-3xl md:text-6xl font-bold mb-8 leading-tight">
                Built for the <br />
                <span className="text-blue-400">modern engineer.</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-400 mb-12 leading-relaxed">
                We understand the UK plumbing industry. Our platform is designed to save you hours every week on admin, so you can focus on what you do best.
              </p>
              <div className="grid grid-cols-2 gap-6 md:gap-8">
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">24/7</div>
                  <div className="text-slate-500 font-medium text-sm md:text-base">Automated Bookings</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">Instant</div>
                  <div className="text-slate-500 font-medium text-sm md:text-base">Job Notifications</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">Mobile</div>
                  <div className="text-slate-500 font-medium text-sm md:text-base">Dashboard Access</div>
                </div>
                <div>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">Secure</div>
                  <div className="text-slate-500 font-medium text-sm md:text-base">Data Protection</div>
                </div>
              </div>
            </motion.div>
            <motion.div 
              {...fadeIn}
              className="glass-dark p-8 md:p-12 rounded-[40px] relative"
            >
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl font-bold mb-2">Lightning Fast Setup</h4>
                    <p className="text-sm md:text-base text-slate-400">Get your website and booking system live in under 5 minutes.</p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-400 flex-shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl font-bold mb-2">Secure & Reliable</h4>
                    <p className="text-sm md:text-base text-slate-400">Enterprise-grade security to keep your customer data safe.</p>
                  </div>
                </div>
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg md:text-xl font-bold mb-2">Scale Your Business</h4>
                    <p className="text-sm md:text-base text-slate-400">Tools that grow with you, from solo engineer to multi-van fleet.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, transparent pricing</h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto">Choose the plan that fits your business size. No hidden fees.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 items-end">
          {[
            { 
              name: "Basic", 
              price: "39", 
              desc: "Perfect for solo engineers starting out.",
              features: ["Professional Website", "Booking System", "Dashboard", "Email Notifications"] 
            },
            { 
              name: "Pro", 
              price: "59", 
              popular: true,
              desc: "Our most popular plan for growing businesses.",
              features: ["Everything in Basic", "Custom Domain", "WhatsApp Integration", "50 SMS Notifications/mo", "Priority Support"] 
            },
            { 
              name: "Premium", 
              price: "99", 
              desc: "Advanced tools for established plumbing firms.",
              features: ["Everything in Pro", "Unlimited SMS Notifications", "Multiple Staff", "Advanced Analytics", "Export Bookings"] 
            }
          ].map((plan, i) => (
            <motion.div 
              key={i}
              {...fadeIn}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className={cn(
                "p-8 md:p-10 rounded-[40px] border flex flex-col transition-all duration-300 active:scale-[0.98]",
                plan.popular 
                  ? "border-blue-600 shadow-[0_32px_64px_-16px_rgba(37,99,235,0.2)] relative bg-white z-10 py-12 md:py-14" 
                  : "border-slate-200 bg-slate-50/50"
              )}
            >
              {plan.popular && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-full text-sm font-bold shadow-lg shadow-blue-200">
                  Most Popular
                </span>
              )}
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
              <p className="text-slate-500 text-sm mb-8">{plan.desc}</p>
              <div className="flex items-baseline gap-1 mb-10">
                <span className="text-4xl md:text-5xl font-extrabold text-slate-900">£{plan.price}</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>
              <ul className="space-y-4 md:space-y-5 mb-12 flex-grow">
                {plan.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-4 text-slate-600 font-medium">
                    <div className="bg-blue-50 p-1 rounded-full">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    </div>
                    <span className="text-sm md:text-base">{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/signup" className={cn(
                "w-full py-4 md:py-5 rounded-2xl font-bold text-center transition-all flex items-center justify-center gap-2 group",
                plan.popular 
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-200" 
                  : "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
              )}>
                Get Started <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 pb-20 md:pb-32">
        <motion.div 
          {...fadeIn}
          className="max-w-7xl mx-auto rounded-[40px] md:rounded-[60px] bg-slate-900 p-10 md:p-20 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-glow opacity-20" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-6xl font-bold text-white mb-8 tracking-tight">Ready to automate your business?</h2>
            <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
              Join the growing community of UK plumbers who are saving time and winning more jobs with PlumbFlow.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link to="/signup" className="w-full sm:w-auto bg-white text-slate-900 px-10 md:px-12 py-5 md:py-6 rounded-2xl text-lg md:text-xl font-bold hover:bg-slate-100 transition-all shadow-2xl shadow-white/10 active:scale-[0.98]">
                Start 14-Day Free Trial
              </Link>
              <Link to="/login" className="text-white font-bold text-lg hover:text-blue-400 transition-colors py-2">
                Already have an account? Log in
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-24 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-8">
              <div className="bg-slate-900 p-2 rounded-xl">
                <Wrench className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">PlumbFlow</span>
            </div>
            <p className="text-slate-500 max-w-sm leading-relaxed text-lg">
              The modern operating system for UK plumbing and heating engineers. Built to help you grow.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-8 uppercase tracking-widest text-sm">Product</h4>
            <ul className="space-y-4 text-slate-500 font-medium">
              <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a></li>
              <li><a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it Works</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Live Demo</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-slate-900 mb-8 uppercase tracking-widest text-sm">Legal</h4>
            <ul className="space-y-4 text-slate-500 font-medium">
              <li><Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-blue-600 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/cookies" className="hover:text-blue-600 transition-colors">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-400 text-sm font-medium text-center md:text-left">
          <div>© {new Date().getFullYear()} PlumbFlow. Powered by Gnei AI Labs Ltd</div>
          <div className="flex items-center gap-8">
            <a href="#" className="hover:text-slate-900 transition-colors">Twitter</a>
            <a href="#" className="hover:text-slate-900 transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Instagram</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
