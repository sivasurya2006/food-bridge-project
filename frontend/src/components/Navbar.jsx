import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import {
  HeartHandshake, PlusCircle, LayoutDashboard, Truck,
  Building2, ShieldCheck, LogOut, LogIn, UserPlus,
  Menu, X, Sparkles, UserCheck, CheckCircle2, ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, logout, demoLogin, isDonor, isNGO, isVolunteer, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDemoSwitch = async (role) => {
    setDemoDropdownOpen(false);
    const res = await demoLogin(role);
    if (res.success) {
      if (role === 'DONOR') navigate('/donor/dashboard');
      else if (role === 'NGO') navigate('/ngo/dashboard');
      else if (role === 'VOLUNTEER') navigate('/volunteer/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl text-gray-900 tracking-tight">Food<span className="text-emerald-600">Bridge</span></span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Rescue
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide">Food Donation & Waste Reduction</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-gray-600">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/') ? 'text-emerald-600 bg-emerald-50 font-semibold' : 'hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/donations"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/donations') ? 'text-emerald-600 bg-emerald-50 font-semibold' : 'hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Explore Food
            </Link>
            <Link
              to="/how-it-works"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/how-it-works') ? 'text-emerald-600 bg-emerald-50 font-semibold' : 'hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              How It Works
            </Link>
            <Link
              to="/safety"
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                isActive('/safety') ? 'text-emerald-600 bg-emerald-50 font-semibold' : 'hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Safety Guidelines
            </Link>

            {/* Role-Specific Nav Link */}
            {user && (
              <div className="h-4 w-px bg-gray-200 mx-2" />
            )}

            {isDonor && (
              <>
                <Link
                  to="/donor/dashboard"
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/donor/dashboard') ? 'text-emerald-600 bg-emerald-50 font-semibold' : 'hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Donor Portal
                </Link>
                <Link
                  to="/donor/create"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition shadow-xs flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" /> List Food
                </Link>
              </>
            )}

            {isNGO && (
              <Link
                to="/ngo/dashboard"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive('/ngo/dashboard') ? 'text-emerald-600 bg-emerald-50 font-semibold' : 'hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Building2 className="w-4 h-4" /> NGO Portal
              </Link>
            )}

            {isVolunteer && (
              <Link
                to="/volunteer/dashboard"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive('/volunteer/dashboard') ? 'text-emerald-600 bg-emerald-50 font-semibold' : 'hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Truck className="w-4 h-4" /> Volunteer Hub
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive('/admin/dashboard') ? 'text-emerald-600 bg-emerald-50 font-semibold' : 'hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ShieldCheck className="w-4 h-4" /> Admin Center
              </Link>
            )}
          </nav>

          {/* Right Action Tools & Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Switcher */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Demo Switcher</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                  <div className="px-3 py-1 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Instant Demo Roles
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('DONOR')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between"
                  >
                    <span>🏨 Grand Palace Hotel (Donor)</span>
                    {isDonor && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('NGO')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between"
                  >
                    <span>🤝 Hope Food Bank (NGO)</span>
                    {isNGO && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('VOLUNTEER')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between"
                  >
                    <span>🚴 Alex Rider (Volunteer)</span>
                    {isVolunteer && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('ADMIN')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center justify-between"
                  >
                    <span>🛡️ Platform Admin</span>
                    {isAdmin && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                <NotificationDropdown />

                <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-200 uppercase">
                    {user.username.slice(0, 2)}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold text-gray-800 truncate max-w-[110px]">
                      {user.first_name || user.username}
                    </p>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-gray-100 text-gray-600">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow-xs flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" /> Join Network
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            {user && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-emerald-50 rounded-lg"
            >
              Home
            </Link>
            <Link
              to="/donations"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-emerald-50 rounded-lg"
            >
              Explore Food
            </Link>
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-emerald-50 rounded-lg"
            >
              How It Works
            </Link>
            <Link
              to="/safety"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-emerald-50 rounded-lg"
            >
              Safety Guidelines
            </Link>

            {isDonor && (
              <>
                <Link
                  to="/donor/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg"
                >
                  Donor Portal
                </Link>
                <Link
                  to="/donor/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg"
                >
                  + List Food Donation
                </Link>
              </>
            )}

            {isNGO && (
              <Link
                to="/ngo/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg"
              >
                NGO Dashboard
              </Link>
            )}

            {isVolunteer && (
              <Link
                to="/volunteer/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg"
              >
                Volunteer Hub
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg"
              >
                Admin Center
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
            <div className="text-xs font-semibold text-gray-400 uppercase">Demo Switcher</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => { handleDemoSwitch('DONOR'); setMobileMenuOpen(false); }}
                className="p-2 border rounded bg-gray-50 text-left font-medium"
              >
                🏨 Donor Hotel
              </button>
              <button
                onClick={() => { handleDemoSwitch('NGO'); setMobileMenuOpen(false); }}
                className="p-2 border rounded bg-gray-50 text-left font-medium"
              >
                🤝 NGO Hope
              </button>
              <button
                onClick={() => { handleDemoSwitch('VOLUNTEER'); setMobileMenuOpen(false); }}
                className="p-2 border rounded bg-gray-50 text-left font-medium"
              >
                🚴 Volunteer Alex
              </button>
              <button
                onClick={() => { handleDemoSwitch('ADMIN'); setMobileMenuOpen(false); }}
                className="p-2 border rounded bg-gray-50 text-left font-medium"
              >
                🛡️ Admin
              </button>
            </div>

            {user ? (
              <button
                onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                className="mt-2 w-full py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg text-sm flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Sign Out ({user.username})
              </button>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-semibold border rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm font-semibold bg-emerald-600 text-white rounded-lg"
                >
                  Join
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
