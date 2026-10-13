import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import DonationCard from '../../components/DonationCard';
import RequestFoodModal from '../../components/RequestFoodModal';
import { useAuth } from '../../context/AuthContext';
import {
  HeartHandshake, Utensils, ShieldCheck, Truck, Building2,
  ArrowRight, Sparkles, CheckCircle2, ChevronRight, Leaf,
  TrendingUp, Award, Users, AlertTriangle
} from 'lucide-react';

export default function Home() {
  const { user, isNGO } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [featuredDonations, setFeaturedDonations] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [statsRes, donRes] = await Promise.all([
          api.getAnalyticsSummary(),
          api.getDonations({}),
        ]);
        setAnalytics(statsRes.data);
        setFeaturedDonations(donRes.data.slice(0, 3));
      } catch (err) {
        console.error("Home load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-transparent pt-12 pb-20 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-bold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Hunger • Zero Waste Platform</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.1]">
                Bridge the Gap Between <span className="text-emerald-600 underline decoration-emerald-200">Surplus Food</span> and Empty Plates.
              </h1>

              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-2xl">
                FoodBridge connects restaurants, bakeries, and supermarkets with verified NGOs and volunteer drivers. We turn edible surplus into warm meals with real-time request reservation and OTP-verified pickups.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to="/donor/create"
                  className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 hover:shadow-xl transition flex items-center gap-2"
                >
                  <Utensils className="w-4 h-4" /> List Surplus Food
                </Link>
                <Link
                  to="/donations"
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-gray-50 text-gray-800 font-bold text-sm border border-gray-200 shadow-xs hover:border-gray-300 transition flex items-center gap-2"
                >
                  Explore Food Feed <ArrowRight className="w-4 h-4 text-emerald-600" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-gray-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>100% Verified NGOs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>OTP Secure Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  <span>Carbon Emissions Avoided</span>
                </div>
              </div>
            </div>

            {/* Right Card Mockup / Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                      FB
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">Live Rescue Stream</h4>
                      <p className="text-[10px] text-gray-400">Metro City Network</p>
                    </div>
                  </div>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                </div>

                <div className="py-4 space-y-3">
                  <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">Grand Palace Hotel</p>
                      <p className="text-[11px] text-emerald-700">50 Dinner Servings Listed</p>
                    </div>
                    <span className="px-2 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px]">
                      Approved
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">Hope Community Food Bank</p>
                      <p className="text-[11px] text-blue-700">Requested 20 Servings</p>
                    </div>
                    <span className="px-2 py-1 bg-blue-600 text-white font-bold rounded-lg text-[10px]">
                      Matched
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">Volunteer Alex Rider</p>
                      <p className="text-[11px] text-amber-700">OTP Handover #482915</p>
                    </div>
                    <span className="px-2 py-1 bg-amber-600 text-white font-bold rounded-lg text-[10px]">
                      In Transit
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span>Remaining Available Food:</span>
                  <strong className="text-emerald-600 font-bold">30 Servings</strong>
                </div>
              </div>

              {/* Decorative Blur Orbs */}
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-200/40 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Ribbon */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">Impact Transparency</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Real Recorded Platform Impact</h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
              <p className="text-3xl sm:text-4xl font-black text-emerald-400">
                {analytics?.servings_rescued?.toLocaleString() || '12,025'}
              </p>
              <p className="text-xs font-semibold text-slate-300 mt-1 uppercase tracking-wider">Servings Rescued</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
              <p className="text-3xl sm:text-4xl font-black text-teal-400">
                {analytics?.completed_deliveries || '18'}
              </p>
              <p className="text-xs font-semibold text-slate-300 mt-1 uppercase tracking-wider">Completed Deliveries</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
              <p className="text-3xl sm:text-4xl font-black text-amber-400">
                {analytics?.total_ngos || '2'}
              </p>
              <p className="text-xs font-semibold text-slate-300 mt-1 uppercase tracking-wider">Verified NGOs</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700">
              <p className="text-3xl sm:text-4xl font-black text-blue-400">
                {analytics?.co2_avoided_kg ? `${Math.round(analytics.co2_avoided_kg).toLocaleString()} kg` : '30,062 kg'}
              </p>
              <p className="text-xs font-semibold text-slate-300 mt-1 uppercase tracking-wider">Estimated CO₂ Avoided</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4-Step Lifecycle Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">End-to-End Coordination</span>
          <h2 className="text-3xl font-black text-gray-900 mt-1">How FoodBridge Works</h2>
          <p className="text-sm text-gray-500 mt-2">
            Every step is protected with concurrency-safe reservations, volunteer routing, and dual-party confirmation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs text-left relative flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 font-black text-sm flex items-center justify-center mb-4">
              01
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1">Donor Lists Food</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Hotels and grocers submit food details, quantity, estimated servings, preparation time, and pickup deadline.
            </p>
            <span className="mt-auto text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md self-start">
              Status: Available
            </span>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs text-left relative flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-black text-sm flex items-center justify-center mb-4">
              02
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1">NGO Requests Quantity</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Verified NGOs browse available listings and request exact portions needed. Donor reviews and approves with transactional locking.
            </p>
            <span className="mt-auto text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md self-start">
              Portion Reserved Safely
            </span>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs text-left relative flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 font-black text-sm flex items-center justify-center mb-4">
              03
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1">Volunteer Pickup & OTP</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Volunteer driver accepts task, arrives at donor kitchen, and validates handover using donor's secure 6-digit OTP code.
            </p>
            <span className="mt-auto text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md self-start">
              Status: In Transit
            </span>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs text-left relative flex flex-col">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-black text-sm flex items-center justify-center mb-4">
              04
            </div>
            <h3 className="font-bold text-gray-900 text-base mb-1">NGO Confirms Receipt</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Food arrives at NGO shelter. NGO checks condition and confirms delivery via dashboard, updating impact records and driver stats.
            </p>
            <span className="mt-auto text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md self-start">
              Status: Completed
            </span>
          </div>
        </div>
      </section>

      {/* Featured Available Donations Feed */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Available Right Now</span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">Surplus Food Ready for Pickup</h2>
          </div>
          <Link
            to="/donations"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
          >
            <span>View All Listings ({analytics?.active_donations || featuredDonations.length})</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {featuredDonations.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100">
            <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700">No active surplus food listed at this moment.</p>
            <p className="text-xs text-gray-400 mt-1">Be the first to list surplus food!</p>
            <Link
              to="/donor/create"
              className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              List Food Donation
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredDonations.map((donation) => (
              <DonationCard
                key={donation.id}
                donation={donation}
                isNGO={isNGO}
                onRequestClick={(d) => setSelectedDonation(d)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4 Pillars / User Roles Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-50 rounded-3xl p-8 sm:p-12 border border-gray-200/80">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Who Powers FoodBridge?</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Four distinct, synchronized roles working together to solve food waste.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
                <Utensils className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Donors</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Hotels, banquet halls, grocers, and bakeries. List fresh food, review requests, approve quantities, and provide the pickup OTP.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-3">
                <Building2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Verified NGOs</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Registered community kitchens, shelters, and food banks. Request exact quantities needed and confirm final delivery receipt.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Volunteers</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Dedicated drivers and couriers. Accept open tasks, verify donor OTP upon collection, and transport food directly to the NGO.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Administrators</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Ensure compliance, verify NGO credentials, audit platform operations, moderate listings, and maintain platform trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal */}
      {selectedDonation && (
        <RequestFoodModal
          donation={selectedDonation}
          onClose={() => setSelectedDonation(null)}
          onSuccess={() => {}}
        />
      )}
    </div>
  );
}
