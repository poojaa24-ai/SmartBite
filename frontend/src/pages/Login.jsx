import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UtensilsCrossed, Lock, Mail, ArrowRight, ShieldCheck, ChefHat, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      error('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      success(res.message || 'Logged in successfully!');

      if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.user.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate(from === '/' ? '/customer/dashboard' : from);
      }
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Logins
  const handleDemoLogin = async (demoEmail, demoRole) => {
    setEmail(demoEmail);
    setPassword('smartbite123');
    try {
      setLoading(true);
      const res = await login(demoEmail, 'smartbite123');
      success(`Logged in as Demo ${demoRole}!`);
      if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (res.user.role === 'seller') {
        navigate('/seller/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl shadow-soft border border-cream-200">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-forest-900 flex items-center justify-center text-accent-400 mx-auto mb-4 shadow-lg shadow-forest-900/15">
            <UtensilsCrossed className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
            Welcome to SmartBite
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Sign in to discover fresh homemade dishes or manage your home kitchen
          </p>
        </div>

        {/* Quick Demo Login Buttons */}
        <div className="bg-cream-100/80 p-4 rounded-2xl border border-cream-200 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block text-center mb-1">
            ⚡ One-Click Instant Demo Login
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('customer@smartbite.com', 'Customer')}
              className="py-2 px-2 bg-white hover:bg-forest-50 border border-cream-300 rounded-xl text-[11px] font-bold text-slate-800 flex flex-col items-center gap-1 transition-colors"
            >
              <User className="w-4 h-4 text-forest-700" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('seller@smartbite.com', 'Home Chef')}
              className="py-2 px-2 bg-white hover:bg-forest-50 border border-cream-300 rounded-xl text-[11px] font-bold text-slate-800 flex flex-col items-center gap-1 transition-colors"
            >
              <ChefHat className="w-4 h-4 text-accent-600" />
              <span>Home Chef</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@smartbite.com', 'Admin')}
              className="py-2 px-2 bg-white hover:bg-forest-50 border border-cream-300 rounded-xl text-[11px] font-bold text-slate-800 flex flex-col items-center gap-1 transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-cream-50 border border-cream-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-800 focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-forest-900 text-white font-bold text-sm hover:bg-forest-800 transition-all shadow-md shadow-forest-900/15 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 text-xs text-slate-600">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="font-bold text-forest-900 hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
