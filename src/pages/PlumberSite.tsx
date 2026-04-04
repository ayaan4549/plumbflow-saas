import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import { motion } from "motion/react";
import { 
  Phone, 
  MapPin, 
  Clock, 
  Wrench, 
  CheckCircle2, 
  Star, 
  MessageSquare,
  Loader2,
  AlertCircle,
  User,
  ArrowRight,
  Search
} from "lucide-react";
import { cn } from "../lib/utils";

export default function PlumberSite() {
  const { subdomain } = useParams();
  const [plumber, setPlumber] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlumber = async () => {
      try {
        const data = await api.get(`/plumbers/${subdomain}`);
        setPlumber(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Plumber website not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlumber();
  }, [subdomain]);

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBookingLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await api.post("/bookings", {
        subdomain,
        customerName: formData.get("name"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        jobType: formData.get("jobType"),
        description: formData.get("description"),
      });
      setBookingSuccess(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to send booking. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-slate-50">
    <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
  </div>;

  if (error) return <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6 text-center">
    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
    <h1 className="text-2xl font-bold text-slate-900 mb-2">{error}</h1>
    <p className="text-slate-600">Please check the URL or contact support.</p>
  </div>;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Sticky Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 flex items-center justify-between">
        <span className="font-bold text-lg">{plumber.businessName}</span>
        <div className="flex items-center gap-3">
          <a href={`/s/${subdomain}/track`} className="text-blue-600 p-2 hover:bg-blue-50 rounded-full transition-colors">
            <Search className="w-5 h-5" />
          </a>
          <a href={`tel:${plumber.phone}`} className="bg-blue-600 text-white p-2 rounded-full">
            <Phone className="w-5 h-5" />
          </a>
        </div>
      </div>

      {/* Desktop Header */}
      <header className="hidden md:flex items-center justify-between px-8 py-6 max-w-7xl mx-auto sticky top-0 z-50 glass mt-4 rounded-[32px]">
        <div className="flex items-center gap-2">
          <div className="bg-linear-to-br from-blue-600 to-purple-600 p-1.5 rounded-lg shadow-lg shadow-blue-200">
            <Wrench className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-gradient">{plumber.businessName}</span>
        </div>
        <nav className="flex items-center gap-8 font-bold text-slate-600">
          <a href="#services" className="hover:text-blue-600 transition-colors">Services</a>
          <a href="#about" className="hover:text-blue-600 transition-colors">About</a>
          <a href={`/s/${subdomain}/track`} className="hover:text-blue-600 transition-colors flex items-center gap-2">
            <Search className="w-4 h-4" /> Track Booking
          </a>
          <a href="#book" className="bg-slate-900 text-white px-8 py-3 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
            Book Now
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative py-24 px-6 md:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-glow -z-10" />
        <div className="absolute inset-0 opacity-10 -z-20">
          <img 
            src="https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&q=80&w=2000" 
            alt="Plumbing" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-5 py-2 mb-8 text-sm font-bold bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200">
              Available 24/7 for Emergencies
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight text-slate-900">
              Professional Plumber in <span className="text-gradient">{plumber.serviceAreas[0] || "Your Area"}</span>
            </h1>
            <p className="text-xl text-slate-600 mb-12 leading-relaxed font-medium max-w-lg">
              Fast, reliable, and affordable plumbing & heating services. 
              From emergency leaks to boiler repairs, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <a href="#book" className="bg-slate-900 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-slate-800 transition-all text-center shadow-2xl shadow-slate-200">
                Book a Repair
              </a>
              <a href={`tel:${plumber.phone}`} className="glass text-slate-900 px-10 py-5 rounded-2xl text-lg font-bold hover:bg-white transition-all flex items-center justify-center gap-3">
                <Phone className="w-6 h-6 text-blue-600" /> {plumber.phone}
              </a>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:block"
          >
            <div className="glass p-12 rounded-[48px] relative">
              <div className="absolute -top-6 -right-6 bg-white p-4 rounded-3xl shadow-xl border border-slate-100 flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-xl">
                  <CheckCircle2 className="text-emerald-600 w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Gas Safe</p>
                  <p className="text-xs text-slate-500 font-medium">Certified Engineer</p>
                </div>
              </div>
              
              <div className="flex items-center gap-5 mb-10">
                <div className="bg-linear-to-br from-blue-600 to-purple-600 p-4 rounded-2xl shadow-xl shadow-blue-200">
                  <Star className="text-white w-8 h-8 fill-current" />
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-slate-900">4.9/5 Rating</p>
                  <p className="text-slate-500 font-bold">Based on 150+ reviews</p>
                </div>
              </div>
              
              <div className="space-y-6">
                {[
                  "Gas Safe Registered",
                  "Fully Insured & Certified",
                  "Local Family Business",
                  "No Call Out Charges"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-slate-700 font-bold">
                    <div className="bg-blue-100 p-1 rounded-full">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-32 px-6 max-w-7xl mx-auto relative">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-slate-900">Expert Services</h2>
          <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto">Professional solutions for all your plumbing and heating needs, delivered with precision and care.</p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { title: "Emergency Repairs", desc: "Burst pipes, leaks, and urgent fixes available 24/7.", icon: <Clock className="w-8 h-8" /> },
            { title: "Boiler Services", desc: "Repairs, installs, and annual servicing by certified engineers.", icon: <Star className="w-8 h-8" /> },
            { title: "Bathroom Fitting", desc: "Full renovations and new installations tailored to you.", icon: <Wrench className="w-8 h-8" /> },
            { title: "Drain Cleaning", desc: "Unblocking sinks, toilets, and drains with modern tech.", icon: <CheckCircle2 className="w-8 h-8" /> },
          ].map((s, i) => (
            <motion.div 
              key={i} 
              whileHover={{ y: -10 }}
              className="p-10 rounded-[32px] glass border border-slate-100 hover:shadow-2xl hover:shadow-blue-100 transition-all group"
            >
              <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                {s.icon}
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-900">{s.title}</h3>
              <p className="text-slate-500 font-medium leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Booking Section */}
      <section id="book" className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900 -z-10" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.15),transparent_50%)]" />
        
        <div className="max-w-6xl mx-auto glass-dark rounded-[48px] overflow-hidden flex flex-col md:flex-row border border-white/10">
          <div className="p-16 text-white md:w-2/5 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-blue-600/20 to-purple-600/20 -z-10" />
            <div>
              <h2 className="text-4xl font-extrabold mb-8 tracking-tight">Ready to fix it?</h2>
              <p className="text-blue-100 text-lg font-medium mb-12 leading-relaxed">Fill out the form and our expert team will get back to you within 30 minutes. Guaranteed.</p>
              
              <div className="space-y-10">
                <div className="flex items-center gap-6 group cursor-pointer">
                  <div className="bg-white/10 p-4 rounded-2xl group-hover:bg-blue-600 transition-colors">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-300 uppercase font-bold tracking-widest mb-1">Direct Line</p>
                    <p className="text-xl font-bold">{plumber.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 group cursor-pointer">
                  <div className="bg-white/10 p-4 rounded-2xl group-hover:bg-blue-600 transition-colors">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-300 uppercase font-bold tracking-widest mb-1">Service Areas</p>
                    <p className="text-xl font-bold">{plumber.serviceAreas.join(", ") || "Local Area"}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-16 pt-12 border-t border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs font-bold">
                      <User className="w-5 h-5" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-bold text-blue-200">Joined by 500+ local customers</p>
              </div>
            </div>
          </div>
          
          <div className="p-16 md:w-3/5 bg-white">
            {bookingSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-100">
                  <CheckCircle2 className="text-emerald-600 w-12 h-12" />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 mb-4">Booking Received!</h3>
                <p className="text-slate-500 text-lg font-medium mb-10">We've received your request and will contact you shortly.</p>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => window.location.href = `/s/${subdomain}/track`}
                    className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                  >
                    Track My Booking <ArrowRight className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setBookingSuccess(false)}
                    className="text-slate-500 font-bold hover:text-slate-900 transition-colors"
                  >
                    Make another booking
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleBooking} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Your Name</label>
                    <input required name="name" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400" placeholder="John Smith" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Phone Number</label>
                    <input required name="phone" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400" placeholder="07123 456789" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Address</label>
                  <input required name="address" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400" placeholder="123 High Street, Glasgow" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Job Type</label>
                  <div className="relative">
                    <select required name="jobType" className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none appearance-none bg-white transition-all">
                      <option value="Emergency Repair">Emergency Repair</option>
                      <option value="Boiler Service">Boiler Service</option>
                      <option value="Leak Fixing">Leak Fixing</option>
                      <option value="Bathroom Plumbing">Bathroom Plumbing</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ArrowRight className="w-5 h-5 rotate-90" />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Description</label>
                  <textarea name="description" rows={4} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 outline-none transition-all placeholder:text-slate-400 resize-none" placeholder="Tell us more about the issue..."></textarea>
                </div>
                <button 
                  disabled={bookingLoading}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-2xl shadow-slate-200 flex items-center justify-center gap-3 disabled:opacity-70 group"
                >
                  {bookingLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                    <>
                      Send Booking Request <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_100%,rgba(37,99,235,0.1),transparent_50%)]" />
        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex items-center gap-3">
              <div className="bg-linear-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
                <Wrench className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight">{plumber.businessName}</span>
            </div>
            <div className="flex items-center gap-8">
              <a href={`tel:${plumber.phone}`} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 font-bold">
                <Phone className="w-5 h-5" /> {plumber.phone}
              </a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">
                <MessageSquare className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 text-slate-400 text-sm font-medium">
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
              <Link to="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
            </div>
            <div className="text-center md:text-right">
              <p>© {new Date().getFullYear()} {plumber.businessName}.</p>
              <p className="mt-1">Powered by <span className="text-blue-500 font-bold">PlumbFlow</span> (Gnei AI Labs Ltd)</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
