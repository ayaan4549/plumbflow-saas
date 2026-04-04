import { useState } from "react";
import { api } from "../services/api";
import { Save, Loader2, Globe, Phone, User, MapPin, Bell, Mail, MessageSquare, Lock, Zap, XCircle } from "lucide-react";
import { cn } from "../lib/utils";

import { motion } from "motion/react";

export default function SettingsPage({ plumber }: { plumber: any }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(plumber.smsEnabled || false);
  const [emailEnabled, setEmailEnabled] = useState(plumber.emailEnabled !== false); // Default to true
  const [currency, setCurrency] = useState(plumber.currency || "GBP");

  const [error, setError] = useState<string | null>(null);

  const isSmsLocked = plumber.plan === "basic";

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      await api.patch(`/plumbers/${plumber.subdomain}`, {
        businessName: formData.get("businessName"),
        ownerName: formData.get("ownerName"),
        phone: formData.get("phone"),
        serviceAreas: (formData.get("serviceAreas") as string).split(",").map(s => s.trim()),
        smsEnabled: isSmsLocked ? false : smsEnabled,
        emailEnabled: emailEnabled,
        currency: currency,
      }, token);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setError("Failed to update settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl w-full"
    >
      <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl md:rounded-[40px] border border-white/10 shadow-2xl p-6 md:p-12">
        <div className="mb-8 md:mb-10">
          <h3 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">Business Settings</h3>
          <p className="text-sm md:text-base text-slate-400 font-medium mt-2">Update your business profile and public information.</p>
        </div>
        
        {success && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-emerald-500/10 text-emerald-400 p-4 md:p-5 rounded-2xl mb-8 md:mb-10 text-xs md:text-sm font-bold border border-emerald-500/20 flex items-center gap-3"
          >
            <div className="bg-emerald-500/20 p-1 rounded-full">
              <Save className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            Settings updated successfully!
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 text-red-400 p-4 md:p-5 rounded-2xl mb-8 md:mb-10 text-xs md:text-sm font-bold border border-red-500/20 flex items-center gap-3"
          >
            <div className="bg-red-500/20 p-1 rounded-full">
              <XCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </div>
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSave} className="space-y-8 md:space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-400 mb-3 md:mb-4 flex items-center gap-2 ml-1">
                <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" /> Business Name
              </label>
              <input 
                name="businessName" 
                defaultValue={plumber.businessName} 
                className="w-full bg-white/5 px-5 md:px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl border border-white/10 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-white placeholder:text-slate-600 text-sm md:text-base" 
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-400 mb-3 md:mb-4 flex items-center gap-2 ml-1">
                <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" /> Owner Name
              </label>
              <input 
                name="ownerName" 
                defaultValue={plumber.ownerName} 
                className="w-full bg-white/5 px-5 md:px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl border border-white/10 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-white placeholder:text-slate-600 text-sm md:text-base" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-400 mb-3 md:mb-4 flex items-center gap-2 ml-1">
                <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" /> Public Phone Number
              </label>
              <input 
                name="phone" 
                defaultValue={plumber.phone} 
                className="w-full bg-white/5 px-5 md:px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl border border-white/10 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-white placeholder:text-slate-600 text-sm md:text-base" 
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-bold text-slate-400 mb-3 md:mb-4 flex items-center gap-2 ml-1">
                <Globe className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" /> Currency
              </label>
              <select 
                name="currency" 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-white/5 px-5 md:px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl border border-white/10 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-white appearance-none cursor-pointer text-sm md:text-base"
              >
                <option value="GBP" className="bg-slate-900">GBP (£)</option>
                <option value="USD" className="bg-slate-900">USD ($)</option>
                <option value="EUR" className="bg-slate-900">EUR (€)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs md:text-sm font-bold text-slate-400 mb-3 md:mb-4 flex items-center gap-2 ml-1">
              <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-500" /> Service Areas
            </label>
            <input 
              name="serviceAreas" 
              defaultValue={plumber.serviceAreas?.join(", ")} 
              className="w-full bg-white/5 px-5 md:px-6 py-3.5 md:py-4 rounded-xl md:rounded-2xl border border-white/10 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-white placeholder:text-slate-600 text-sm md:text-base" 
              placeholder="Glasgow, Paisley, East Kilbride"
            />
            <p className="text-[10px] md:text-xs text-slate-500 mt-2 md:mt-3 ml-1 font-medium">Separate areas with commas.</p>
          </div>

          {/* Notifications Section */}
          <div className="pt-8 md:pt-10 border-t border-white/5">
            <div className="mb-6 md:mb-8">
              <h4 className="text-lg md:text-xl font-extrabold text-white flex items-center gap-3 tracking-tight">
                <Bell className="w-5 h-5 md:w-6 md:h-6 text-blue-500" /> Notifications
              </h4>
              <p className="text-sm md:text-base text-slate-400 font-medium mt-2">Manage how you receive alerts for new bookings.</p>
            </div>

            <div className="space-y-4 md:space-y-6">
              {/* Email Notifications */}
              <div className="flex items-center justify-between p-4 md:p-6 bg-white/5 rounded-2xl md:rounded-[32px] border border-white/10 group hover:bg-white/[0.07] transition-all">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="bg-blue-500/10 p-2.5 md:p-3 rounded-xl md:rounded-2xl text-blue-400">
                    <Mail className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-bold text-white">Email Notifications</p>
                    <p className="text-[10px] md:text-xs text-slate-500 font-medium">Receive detailed job info via email</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setEmailEnabled(!emailEnabled)}
                  className={cn(
                    "w-12 md:w-14 h-7 md:h-8 rounded-full transition-all relative p-1",
                    emailEnabled ? "bg-blue-600" : "bg-slate-800"
                  )}
                >
                  <motion.div 
                    animate={{ x: emailEnabled ? (window.innerWidth < 768 ? 20 : 24) : 0 }}
                    className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-lg"
                  />
                </button>
              </div>

              {/* SMS Notifications */}
              <div className={cn(
                "flex items-center justify-between p-4 md:p-6 rounded-2xl md:rounded-[32px] border transition-all relative overflow-hidden group",
                isSmsLocked ? "bg-slate-900/50 border-white/5 opacity-60" : "bg-white/5 border-white/10 hover:bg-white/[0.07]"
              )}>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={cn(
                    "p-2.5 md:p-3 rounded-xl md:rounded-2xl",
                    isSmsLocked ? "bg-slate-800 text-slate-600" : "bg-purple-500/10 text-purple-400"
                  )}>
                    <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <p className="text-sm md:text-base font-bold text-white">SMS Notifications</p>
                      {isSmsLocked && (
                        <span className="bg-blue-500/10 text-blue-400 text-[8px] md:text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/20 uppercase tracking-widest w-fit">Pro Feature</span>
                      )}
                    </div>
                    <p className="text-[10px] md:text-xs text-slate-500 font-medium">Instant alerts on your phone</p>
                  </div>
                </div>
                
                {isSmsLocked ? (
                  <div className="flex items-center gap-2 md:gap-3">
                    <Lock className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-600" />
                    <button 
                      type="button"
                      onClick={() => window.location.href = "/dashboard/pricing"}
                      className="text-[10px] md:text-xs font-bold text-blue-500 hover:text-blue-400 transition-colors"
                    >
                      Upgrade
                    </button>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setSmsEnabled(!smsEnabled)}
                    className={cn(
                      "w-12 md:w-14 h-7 md:h-8 rounded-full transition-all relative p-1",
                      smsEnabled ? "bg-purple-600" : "bg-slate-800"
                    )}
                  >
                    <motion.div 
                      animate={{ x: smsEnabled ? (window.innerWidth < 768 ? 20 : 24) : 0 }}
                      className="w-5 h-5 md:w-6 md:h-6 bg-white rounded-full shadow-lg"
                    />
                  </button>
                )}
              </div>

              <div className="p-4 md:p-6 bg-blue-600/5 rounded-2xl md:rounded-[32px] border border-blue-500/10 flex items-center gap-3 md:gap-4">
                <div className="bg-blue-500/20 p-2 rounded-lg md:rounded-xl text-blue-400">
                  <Zap className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-bold text-white">Managed by PlumbFlow</p>
                  <p className="text-[10px] md:text-xs text-slate-500 font-medium">SMS powered by Gnei AI Labs Ltd — no setup required.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 md:pt-8 border-t border-white/5">
            <button 
              disabled={loading}
              className="w-full sm:w-auto bg-white text-slate-950 px-8 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl text-sm md:text-base font-bold hover:bg-slate-100 transition-all shadow-2xl shadow-white/5 flex items-center justify-center gap-3 disabled:opacity-70 group active:scale-[0.98]"
            >
              {loading ? <Loader2 className="w-5 h-5 md:w-6 md:h-6 animate-spin" /> : (
                <>
                  <Save className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 md:mt-12 bg-slate-900/50 backdrop-blur-xl p-6 md:p-10 rounded-3xl md:rounded-[40px] border border-blue-500/20 shadow-xl shadow-blue-500/5"
      >
        <div className="flex items-center gap-3 md:gap-4 mb-4">
          <div className="bg-blue-600 p-2 rounded-lg md:rounded-xl">
            <Globe className="text-white w-4 h-4 md:w-5 md:h-5" />
          </div>
          <h4 className="font-extrabold text-white text-base md:text-lg tracking-tight">Your Public Website</h4>
        </div>
        <p className="text-xs md:text-sm text-slate-400 font-medium mb-6">Anyone can visit your site and book your services at this unique URL:</p>
        <div className="bg-white/5 p-4 md:p-6 rounded-xl md:rounded-2xl border border-white/10 font-mono text-[10px] md:text-sm text-blue-400 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="truncate">{window.location.origin}/s/{plumber.subdomain}</span>
          <a 
            href={`/s/${plumber.subdomain}`} 
            target="_blank" 
            className="bg-blue-500/10 text-blue-400 px-6 py-2.5 rounded-lg md:rounded-xl font-bold hover:bg-blue-500 hover:text-white transition-all text-center border border-blue-500/20 text-xs md:text-sm"
          >
            Visit Site
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
