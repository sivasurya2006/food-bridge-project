import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import {
  HeartHandshake, PlusCircle, LayoutDashboard, Truck,
  Building2, ShieldCheck, LogOut, Menu, X, Inbox,
  ChevronDown, CheckCircle2, Sparkles, Home, Utensils, Info, Shield, User, UserCog
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
    setMobileMenuOpen(false);
    const res = await demoLogin(role);
    if (res.success) {
      if (role === 'DONOR') navigate('/donor/dashboard');
      else if (role === 'NGO') navigate('/ngo/dashboard');
      else if (role === 'VOLUNTEER') navigate('/volunteer/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
    }
  };

  const isActive = (path) => {
    if (path.includes('#')) {
      return (location.pathname + location.hash) === path;
    }
    return location.pathname === path && !location.hash;
  };

  const closeMobile = () => setMobileMenuOpen(false);

  const navItemClass = (path) => `
    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all
    ${
      isActive(path)
        ? (isAdmin
            ? 'bg-purple-700 text-white shadow-sm shadow-purple-700/30 font-bold'
            : 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 font-bold')
        : (isAdmin
            ? 'text-gray-600 hover:text-purple-800 hover:bg-purple-50/70'
            : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/70')
    }
  `;

  // Sidebar internal content used for both Desktop and Mobile Drawer
  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-4 sm:p-5 text-left">
      {/* Top brand + Navigation Links */}
      <div className="space-y-6">
        {/* Brand Logo */}
        <Link
          to={user ? (isAdmin ? '/admin/dashboard' : '/home') : '/login'}
          onClick={closeMobile}
          className="flex items-center gap-3 group px-1"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 transition-transform shrink-0">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-2xl text-gray-900 tracking-tight leading-none">
                Food<span className="text-emerald-600">Bridge</span>
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Rescue
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium tracking-wide mt-0.5">
              Surplus Food Rescue
            </p>
          </div>
        </Link>

        {/* User Role Card */}
        {user && (
          <Link
            to="/profile"
            onClick={closeMobile}
            className={`p-3 bg-slate-50 hover:bg-slate-100/90 border border-slate-200/80 ${isAdmin ? 'hover:border-purple-300' : 'hover:border-emerald-300'} rounded-2xl flex items-center gap-3 transition group`}
            title="Click to view & edit your profile"
          >
            <div className={`w-10 h-10 rounded-xl overflow-hidden ${isAdmin ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'} font-black text-sm flex items-center justify-center border shrink-0`}>
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="uppercase">{user.username.slice(0, 2)}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-xs font-bold text-gray-900 truncate ${isAdmin ? 'group-hover:text-purple-700' : 'group-hover:text-emerald-700'} transition-colors`}>
                {user.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user.username}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  isAdmin ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                  isNGO ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                  isVolunteer ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                  'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {user.role}
                </span>
                <span className={`text-[10px] text-gray-400 ${isAdmin ? 'group-hover:text-purple-600' : 'group-hover:text-emerald-600'} transition-colors font-medium`}>
                  • Profile
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Navigation Sections */}
        <div className="space-y-4">
          {isAdmin ? (
            /* Dedicated Admin Navigation: ONLY what Admin needs */
            <div>
              <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-purple-700 uppercase">
                Admin Control
              </div>
              <nav className="space-y-1">
                <Link to="/admin/dashboard" onClick={closeMobile} className={navItemClass('/admin/dashboard')}>
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Admin Dashboard</span>
                </Link>
                <Link to="/admin/dashboard#organizations" onClick={closeMobile} className={navItemClass('/admin/dashboard#organizations')}>
                  <Building2 className="w-4 h-4 shrink-0" />
                  <span>NGO Verifications</span>
                </Link>
                <Link to="/admin/dashboard#requests" onClick={closeMobile} className={navItemClass('/admin/dashboard#requests')}>
                  <Inbox className="w-4 h-4 shrink-0" />
                  <span>Requests &amp; Dispatch</span>
                </Link>
                <Link to="/donations" onClick={closeMobile} className={navItemClass('/donations')}>
                  <Utensils className="w-4 h-4 shrink-0" />
                  <span>All Food Donations</span>
                </Link>
                <Link to="/profile" onClick={closeMobile} className={navItemClass('/profile')}>
                  <UserCog className="w-4 h-4 shrink-0" />
                  <span>Admin Profile</span>
                </Link>
              </nav>
            </div>
          ) : (
            /* Standard Navigation for Public / Non-Admin Users */
            <>
              {/* Main Public Exploration */}
              <div>
                <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  Main Menu
                </div>
                <nav className="space-y-1">
                  <Link to="/home" onClick={closeMobile} className={navItemClass('/home')}>
                    <Home className="w-4 h-4 shrink-0" />
                    <span>Home</span>
                  </Link>
                  <Link to="/donations" onClick={closeMobile} className={navItemClass('/donations')}>
                    <Utensils className="w-4 h-4 shrink-0" />
                    <span>Explore Food</span>
                  </Link>
                  <Link to="/how-it-works" onClick={closeMobile} className={navItemClass('/how-it-works')}>
                    <Info className="w-4 h-4 shrink-0" />
                    <span>How It Works</span>
                  </Link>
                  <Link to="/safety" onClick={closeMobile} className={navItemClass('/safety')}>
                    <Shield className="w-4 h-4 shrink-0" />
                    <span>Safety Guidelines</span>
                  </Link>
                </nav>
              </div>

              {/* Role-Specific Portal Links */}
              {user && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                    {user.role} Workspace
                  </div>
                  <nav className="space-y-1">
                    {isDonor && (
                      <>
                        <Link to="/donor/dashboard" onClick={closeMobile} className={navItemClass('/donor/dashboard')}>
                          <LayoutDashboard className="w-4 h-4 shrink-0" />
                          <span>Donor Portal</span>
                        </Link>
                        <Link to="/donor/create" onClick={closeMobile} className={navItemClass('/donor/create')}>
                          <PlusCircle className="w-4 h-4 shrink-0" />
                          <span>+ List Food</span>
                        </Link>
                        <Link to="/donor/requests" onClick={closeMobile} className={navItemClass('/donor/requests')}>
                          <Inbox className="w-4 h-4 shrink-0" />
                          <span>Incoming Requests</span>
                        </Link>
                        <Link to="/profile" onClick={closeMobile} className={navItemClass('/profile')}>
                          <User className="w-4 h-4 shrink-0" />
                          <span>My Profile</span>
                        </Link>
                      </>
                    )}

                    {isNGO && (
                      <>
                        <Link to="/ngo/dashboard" onClick={closeMobile} className={navItemClass('/ngo/dashboard')}>
                          <Building2 className="w-4 h-4 shrink-0" />
                          <span>NGO Dashboard</span>
                        </Link>
                        <Link to="/ngo/requests" onClick={closeMobile} className={navItemClass('/ngo/requests')}>
                          <Inbox className="w-4 h-4 shrink-0" />
                          <span>My Requests</span>
                        </Link>
                        <Link to="/profile" onClick={closeMobile} className={navItemClass('/profile')}>
                          <User className="w-4 h-4 shrink-0" />
                          <span>My Profile</span>
                        </Link>
                      </>
                    )}

                    {isVolunteer && (
                      <>
                        <Link to="/volunteer/dashboard" onClick={closeMobile} className={navItemClass('/volunteer/dashboard')}>
                          <Truck className="w-4 h-4 shrink-0" />
                          <span>Volunteer Hub</span>
                        </Link>
                        <Link to="/volunteer/tasks" onClick={closeMobile} className={navItemClass('/volunteer/tasks')}>
                          <Utensils className="w-4 h-4 shrink-0" />
                          <span>Available Tasks</span>
                        </Link>
                        <Link to="/profile" onClick={closeMobile} className={navItemClass('/profile')}>
                          <User className="w-4 h-4 shrink-0" />
                          <span>My Profile</span>
                        </Link>
                      </>
                    )}
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom Controls: Demo Switcher + Notifications + Logout */}
      {user && (
        <div className="pt-4 border-t border-gray-200 space-y-3">
          {/* Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
              className="w-full flex items-center justify-between text-xs font-semibold px-3 py-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 transition shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Demo Switcher</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            {demoDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-1.5 z-50 space-y-0.5">
                <div className="px-3 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Switch Demo Account
                </div>
                <button
                  onClick={() => handleDemoSwitch('DONOR')}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg flex items-center justify-between"
                >
                  <span>🏨 Donor (sakthivel)</span>
                  {isDonor && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
                <button
                  onClick={() => handleDemoSwitch('NGO')}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg flex items-center justify-between"
                >
                  <span>🤝 Hope NGO (rajagurushri)</span>
                  {isNGO && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
                <button
                  onClick={() => handleDemoSwitch('VOLUNTEER')}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg flex items-center justify-between"
                >
                  <span>🚴 Volunteer (prajin)</span>
                  {isVolunteer && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
                <button
                  onClick={() => handleDemoSwitch('ADMIN')}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg flex items-center justify-between"
                >
                  <span>🛡️ Platform Admin</span>
                  {isAdmin && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              </div>
            )}
          </div>

          {/* Action Row: Notifications & Logout */}
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center justify-start">
              <NotificationDropdown />
            </div>

            <button
              onClick={handleLogout}
              className="flex-1 py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition border border-rose-200 flex items-center justify-center gap-1.5"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          DESKTOP: Fixed Vertical Sidebar on the LEFT
      ══════════════════════════════════════════════════════════════ */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-64 lg:w-72 bg-white border-r border-gray-200 z-40 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE: Top Header Bar (when on mobile viewports)
      ══════════════════════════════════════════════════════════════ */}
      <header className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 h-16 flex items-center justify-between">
        <Link to={user ? (isAdmin ? '/admin/dashboard' : '/home') : '/login'} className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-sm">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <span className="font-black text-xl text-gray-900 tracking-tight">
            Food<span className="text-emerald-600">Bridge</span>
          </span>
        </Link>

        {user && (
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="w-8 h-8 rounded-lg overflow-hidden bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center border border-emerald-300"
              title="My Profile"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              ) : (
                <span className="uppercase">{user.username.slice(0, 2)}</span>
              )}
            </Link>
            <NotificationDropdown />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-gray-700 hover:bg-gray-100 border border-gray-200"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        )}
      </header>

      {/* ═══════════════════════════════════════════════════════════
          MOBILE DRAWER: Slide-over navigation panel
      ══════════════════════════════════════════════════════════════ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={closeMobile}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col justify-between overflow-y-auto shadow-2xl z-10">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
