import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import { api } from "../services/api";
import { cn } from "../lib/utils";

const plans = [
  { 
    id: "basic", 
    name: "Basic", 
    price: "39", 
    priceIds: {
      GBP: "price_basic_gbp",
      USD: "price_basic_usd",
      EUR: "price_basic_eur"
    },
    features: ["Professional Website", "Booking System", "Dashboard", "Email Notifications", "Standard Support"] 
  },
  { 
    id: "pro", 
    name: "Pro", 
    price: "59", 
    priceIds: {
      GBP: "price_pro_gbp",
      USD: "price_pro_usd",
      EUR: "price_pro_eur"
    },
    features: ["Everything in Basic", "Custom Domain", "WhatsApp Integration", "50 SMS Notifications/mo", "Priority Support"] 
  },
  { 
    id: "premium", 
    name: "Premium", 
    price: "99", 
    priceIds: {
      GBP: "price_premium_gbp",
      USD: "price_premium_usd",
      EUR: "price_premium_eur"
    },
    features: ["Everything in Pro", "Unlimited SMS Notifications", "Multiple Staff", "Advanced Analytics", "Export Bookings"] 
  }
];

import { motion } from "motion/react";

const currencySymbols: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€"
};

export default function Pricing({ plumber }: { plumber?: any }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const currency = plumber?.currency || "GBP";
  const symbol = currencySymbols[currency] || "£";

  const handleSubscribe = async (plan: any) => {
    setLoading(plan.id);
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const priceId = plan.priceIds[currency] || plan.priceIds.GBP;
      const session = await api.post("/create-checkout-session", {
        priceId: priceId,
        currency: currency, // Pass currency to backend
      }, token);

      if (session.url) {
        window.location.href = session.url;
      } else {
        // Mocked for demo if Stripe is not fully configured
        alert("Redirecting to Stripe Checkout... (Mocked for demo)");
        console.log("Stripe Session:", session);
      }
    } catch (err) {
      console.error(err);
      alert("Subscription failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-7xl mx-auto"
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">Upgrade Your Plan</h1>
        <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">Scale your business with advanced tools and priority support.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div 
            key={plan.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10 }}
            className={cn(
              "bg-slate-900/50 backdrop-blur-xl p-10 rounded-[40px] border border-white/10 flex flex-col shadow-2xl transition-all relative overflow-hidden",
              plan.id === "pro" ? "border-blue-500/30 shadow-blue-500/10" : "shadow-white/5"
            )}
          >
            {plan.id === "pro" && (
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-6 py-2 rounded-bl-2xl text-xs font-bold uppercase tracking-widest">
                Most Popular
              </div>
            )}
            
            <h3 className="text-2xl font-extrabold text-white mb-2">{plan.name}</h3>
            <div className="flex items-baseline gap-1 mb-10">
              <span className="text-5xl font-extrabold text-white tracking-tight">{symbol}{plan.price}</span>
              <span className="text-slate-500 font-bold">/mo</span>
            </div>
            
            <ul className="space-y-5 mb-12 flex-grow">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-start gap-4 text-slate-400 font-medium">
                  <div className="bg-blue-500/10 p-1 rounded-full mt-0.5 border border-blue-500/20">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  </div>
                  <span className="text-sm leading-relaxed">{f}</span>
                </li>
              ))}
            </ul>
            
            <button 
              onClick={() => handleSubscribe(plan)}
              disabled={!!loading}
              className={cn(
                "w-full py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-70 group",
                plan.id === "pro" 
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-500/20" 
                  : "bg-white text-slate-950 hover:bg-slate-100 shadow-xl shadow-white/5"
              )}
            >
              {loading === plan.id ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                <>
                  Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-20 bg-slate-900/50 backdrop-blur-xl p-12 rounded-[40px] border border-white/10 text-center">
        <h3 className="text-2xl font-extrabold text-white mb-4">Need a custom solution?</h3>
        <p className="text-slate-400 font-medium mb-8">We offer enterprise plans for large plumbing companies with 20+ staff.</p>
        <button className="text-blue-500 font-bold hover:text-blue-400 transition-colors flex items-center gap-2 mx-auto">
          Contact Sales <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
}
