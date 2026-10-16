import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HeartHandshake, LogIn, Eye, EyeOff, Lock, User, Mail,
  AlertCircle, CheckCircle2, ArrowRight, ShieldCheck,
  Utensils, HelpCircle, X
} from 'lucide-react';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState(() => localStorage.getItem('foodbridge_remember_user') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => Boolean(localStorage.getItem('foodbridge_remember_user')));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.registeredMessage || '');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  // If already logged in, redirect straight to their respective dashboard
  useEffect(() => {
    if (user) {
      if (user.role === 'DONOR') navigate('/donor/dashboard', { replace: true });
      else if (user.role === 'NGO') navigate('/ngo/dashboard', { replace: true });
      else if (user.role === 'VOLUNTEER') navigate('/volunteer/dashboard', { replace: true });
      else if (user.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // If navigated here with a prefilled username after registration
  useEffect(() => {
    if (location.state?.prefillUsername) {
      setIdentifier(location.state.prefillUsername);
    }
  }, [location.state]);

  const redirectByRole = (role) => {
    if (role === 'DONOR') navigate('/donor/dashboard', { replace: true });
    else if (role === 'NGO') navigate('/ngo/dashboard', { replace: true });
    else if (role === 'VOLUNTEER') navigate('/volunteer/dashboard', { replace: true });
    else if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
    else navigate('/', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please enter your email or username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (rememberMe) {
      localStorage.setItem('foodbridge_remember_user', identifier.trim());
    } else {
      localStorage.removeItem('foodbridge_remember_user');
    }

    const res = await login(identifier.trim(), password);
    setLoading(false);

    if (res.success) {
      redirectByRole(res.user.role);
    } else {
      setError(res.error || 'Invalid credentials. Please verify your username and password.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-emerald-50/50 via-slate-50 to-teal-50/40">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 text-left">
        
        {/* Left Column: Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between">
          <div>
            {/* Logo and Branding Header */}
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <span className="font-black text-xl text-gray-900 tracking-tight">
                  Food<span className="text-emerald-600">Bridge</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 ml-1.5">
                  Platform
                </span>
              </div>
            </div>

            {/* Welcome Heading */}
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Welcome Back to FoodBridge
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 mb-6">
              Sign in with your registered account to manage surplus food donations, requests, or deliveries.
            </p>

            {/* Registration Success Banner */}
            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5 shadow-2xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 shadow-2xs">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Email or Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="e.g. grand_palace_hotel or name@org.com"
                    autoComplete="username"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition shadow-2xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 transition"
                  />
                  <span className="text-xs font-medium text-gray-600">Remember Me</span>
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              </button>
            </form>
          </div>

          {/* Bottom Call to Action */}
          <div className="mt-8 pt-4 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1">
                Create a new account <ArrowRight className="w-3 h-3" />
              </Link>
            </p>
          </div>
        </div>

        {/* Right Column: Visual Showcase & Brand Highlights */}
        <div className="lg:col-span-5 relative bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 p-8 sm:p-10 text-white flex flex-col justify-between overflow-hidden">
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-semibold">
              <Utensils className="w-3.5 h-3.5" />
              <span>Surplus Food Rescue Network</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight">
              Connecting surplus food with those who need it most.
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              Every day, thousands of edible meals go uncollected while community shelters need support. FoodBridge streamlines donations with OTP verification and real-time portion matching.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/30 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Verified Organization Network</h4>
                  <p className="text-[11px] text-emerald-200/80">Only verified NGOs can request food.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Secure OTP Handover</h4>
                  <p className="text-[11px] text-emerald-200/80">Food handover confirmed via one-time code.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Card Mockup */}
          <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-emerald-200">
            <span>FoodBridge v1.0</span>
            <Link to="/how-it-works" className="hover:text-white transition underline">
              How FoodBridge Works
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100 text-left space-y-4">
            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-gray-900">Reset Your Password</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              To protect donor and recipient organization security, password resets are handled with administrative verification.
            </p>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 text-xs space-y-1 text-gray-600">
              <p>• Contact support: <strong>support@foodbridge.org</strong></p>
              <p>• Phone hotline: <strong>+1 555-0199</strong></p>
            </div>

            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className="w-full py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-emerald-700 transition"
            >
              Back to Sign In
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
