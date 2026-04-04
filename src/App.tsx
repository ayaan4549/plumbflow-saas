import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { api } from "./services/api";

// Pages
import { Component, ReactNode } from "react";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import PlumberSite from "./pages/PlumberSite";
import CustomerDashboard from "./pages/CustomerDashboard";
import SuperAdmin from "./pages/SuperAdmin";
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
        <Routes>
          {/* Public SaaS Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route 
            path="/signup" 
            element={user ? <Navigate to="/dashboard" /> : <Signup onSignup={login} />} 
          />
          <Route 
            path="/login" 
            element={user ? <Navigate to={user.role === 'super_admin' ? "/admin" : "/dashboard"} /> : <Login onLogin={login} />} 
          />
          <Route 
            path="/admin/login" 
            element={user ? <Navigate to={user.role === 'super_admin' ? "/admin" : "/dashboard"} /> : <AdminLogin onLogin={login} />} 
          />
          
          {/* Protected Dashboard Routes */}
          <Route 
            path="/dashboard/*" 
            element={user && user.role === 'plumber' ? <Dashboard user={user} onLogout={logout} /> : <Navigate to="/login" />} 
          />

          {/* Super Admin */}
          <Route 
            path="/admin/*" 
            element={user && user.role === 'super_admin' ? <AdminDashboard user={user} onLogout={logout} /> : <Navigate to="/admin/login" />} 
          />

          {/* Dynamic Plumber Site Route */}
          <Route path="/s/:subdomain" element={<PlumberSite />} />
          <Route path="/s/:subdomain/track" element={<CustomerDashboard />} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}
