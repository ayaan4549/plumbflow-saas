import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { api } from "./services/api";
import { AnimatePresence, motion } from "motion/react";

// Pages
import { Component, ReactNode } from "react";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import PlumberSite from "./pages/PlumberSite";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Something went wrong.</h1>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function PageWrapper({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes({ user, login, logout }: { user: any, login: any, logout: any }) {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public SaaS Routes */}
        <Route path="/" element={<PageWrapper><Landing /></PageWrapper>} />
        <Route path="/terms" element={<PageWrapper><Terms /></PageWrapper>} />
        <Route path="/privacy" element={<PageWrapper><Privacy /></PageWrapper>} />
        <Route path="/cookies" element={<PageWrapper><Cookies /></PageWrapper>} />
        <Route 
          path="/signup" 
          element={<PageWrapper>{user ? <Navigate to="/dashboard" /> : <Signup onSignup={login} />}</PageWrapper>} 
        />
        <Route 
          path="/login" 
          element={<PageWrapper>{user ? <Navigate to={user.role === 'super_admin' ? "/admin" : "/dashboard"} /> : <Login onLogin={login} />}</PageWrapper>} 
        />
        <Route 
          path="/admin/login" 
          element={<PageWrapper>{user ? <Navigate to={user.role === 'super_admin' ? "/admin" : "/dashboard"} /> : <AdminLogin onLogin={login} />}</PageWrapper>} 
        />
        
        {/* Protected Dashboard Routes */}
        <Route 
          path="/dashboard/*" 
          element={<PageWrapper>{user && user.role === 'plumber' ? <Dashboard user={user} onLogout={logout} /> : <Navigate to="/login" />}</PageWrapper>} 
        />

        {/* Super Admin */}
        <Route 
          path="/admin/*" 
          element={<PageWrapper>{user && user.role === 'super_admin' ? <AdminDashboard user={user} onLogout={logout} /> : <Navigate to="/admin/login" />}</PageWrapper>} 
        />

        {/* Dynamic Plumber Site Route */}
        <Route path="/s/:subdomain" element={<PageWrapper><PlumberSite /></PageWrapper>} />
        <Route path="/s/:subdomain/track" element={<PageWrapper><CustomerDashboard /></PageWrapper>} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api.get("/auth/me", token)
        .then(userData => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token: string, userData: any) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <AnimatedRoutes user={user} login={login} logout={logout} />
      </Router>
    </ErrorBoundary>
  );
}
