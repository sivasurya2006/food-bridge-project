import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, Heart, Sparkles, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">Food<span className="text-emerald-400">Bridge</span></span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering communities to eliminate edible food waste by connecting surplus food donors, verified NGOs, and dedicated volunteer drivers.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <Sparkles className="w-4 h-4" /> 100% Non-Profit Mission
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/donations" className="hover:text-emerald-400 transition">Explore Donations</Link></li>
              <li><Link to="/how-it-works" className="hover:text-emerald-400 transition">How It Works</Link></li>
              <li><Link to="/safety" className="hover:text-emerald-400 transition">Food Safety Protocol</Link></li>
              <li><Link to="/register" className="hover:text-emerald-400 transition">Register as Donor / NGO</Link></li>
            </ul>
          </div>

          {/* User Roles */}
          <div>
            <h4 className="font-semibold text-white text-sm mb-4">Portals</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/donor/dashboard" className="hover:text-emerald-400 transition">Donors (Hotels & Supermarkets)</Link></li>
              <li><Link to="/ngo/dashboard" className="hover:text-emerald-400 transition">Verified NGOs & Shelters</Link></li>
              <li><Link to="/volunteer/dashboard" className="hover:text-emerald-400 transition">Volunteer Delivery Hub</Link></li>
              <li><Link to="/admin/dashboard" className="hover:text-emerald-400 transition">Moderation & Verification</Link></li>
            </ul>
          </div>

          {/* Food Safety & Contact */}
          <div className="space-y-3">
            <h4 className="font-semibold text-white text-sm mb-4">Safety & Disclaimer</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              FoodBridge facilitates food rescue coordination. Donors and recipient organisations remain responsible for complying with hygiene and food-safety handling procedures.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Verified Organization Network</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FoodBridge Platform. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Zero Hunger & Waste Reduction
          </p>
        </div>
      </div>
    </footer>
  );
}
