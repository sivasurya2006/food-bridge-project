import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import RequestFoodModal from '../../components/RequestFoodModal';
import {
  MapPin, Clock, Utensils, AlertTriangle, ShieldCheck,
  Building2, Phone, Calendar, ArrowLeft, CheckCircle2, Package
} from 'lucide-react';

export default function DonationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isNGO, isDonor, isAdmin, isVolunteer } = useAuth();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetail = async () => {
    try {
      const res = await api.getDonationDetail(id);
      setDonation(res.data);
    } catch (err) {
      setError('Donation listing not found or has been removed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm("Are you sure you want to cancel this donation listing?")) return;
    try {
      await api.cancelDonation(id);
      navigate('/donor/dashboard');
    } catch (err) {
      alert("Failed to cancel donation.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-gray-500">Loading donation details...</p>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-gray-900">Listing Unavailable</h2>
        <p className="text-xs text-gray-500">{error || 'This donation listing could not be loaded.'}</p>
        <Link to="/donations" className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">
          Back to Listings
        </Link>
      </div>
    );
  }

  const isOwner = Boolean(
    user && (user.id === donation.donor || user.username === donation.donor_username)
  );
  const isAvailable = donation.status === 'AVAILABLE' && !donation.is_expired && donation.available_quantity > 0;
  const canRequest = isAvailable && !isOwner && (isNGO || isAdmin);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Listings
      </button>

      {/* Main card */}
      <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm grid grid-cols-1 lg:grid-cols-12">
        {/* Left Column: Image & Status */}
        <div className="lg:col-span-5 relative h-72 lg:h-auto min-h-[320px] bg-gray-100">
          <img
            src={donation.image_url || donation.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'}
            alt={donation.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-gray-800 shadow-xs">
              {donation.category}
            </span>
          </div>
          <div className="absolute top-4 right-4">
            <span className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-xs ${
              donation.status === 'AVAILABLE' ? 'bg-emerald-500' :
              donation.status === 'COMPLETED' ? 'bg-blue-600' : 'bg-amber-500'
            }`}>
              {donation.status}
            </span>
          </div>
        </div>

        {/* Right Column: Information & Actions */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 mb-1">
              <Building2 className="w-4 h-4" />
              <span>Listed by {donation.donor_name || donation.donor_username}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight leading-snug">
              {donation.title}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-3 leading-relaxed">
              {donation.description || 'Nutritious surplus edible food stored properly and prepared under hygienic standards.'}
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3 border-y border-gray-100 text-xs">
            <div className="p-3 bg-emerald-50/50 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Available</span>
              <span className="text-base font-black text-emerald-900 mt-0.5 block">
                {donation.available_quantity} <span className="text-xs font-normal">{donation.unit}</span>
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Listed</span>
              <span className="text-base font-black text-gray-800 mt-0.5 block">
                {donation.quantity} <span className="text-xs font-normal">{donation.unit}</span>
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Est. Servings</span>
              <span className="text-base font-black text-gray-800 mt-0.5 block">
                ~{donation.estimated_servings}
              </span>
            </div>
          </div>

          {/* Details list */}
          <div className="space-y-3 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900">Pickup Location:</strong> {donation.pickup_location}
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-gray-900">Pickup Deadline:</strong>{' '}
                {new Date(donation.pickup_deadline).toLocaleString()}
              </div>
            </div>

            {donation.storage_instructions && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60">
                <strong className="text-gray-900 block mb-0.5">Storage Instructions:</strong>
                <p className="text-gray-600">{donation.storage_instructions}</p>
              </div>
            )}

            {donation.allergen_information && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-amber-900">
                <strong className="block mb-0.5">⚠️ Allergen Advisory:</strong>
                <p>{donation.allergen_information}</p>
              </div>
            )}
          </div>

          {/* Action Row */}
          <div className="pt-2">
            {isOwner ? (
              <div className="space-y-3 w-full">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">This is your surplus food donation listing ({donation.donor_username}).</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Your Listing
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/donor/incoming-requests"
                    className="flex-1 py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Package className="w-4 h-4" /> View Incoming NGO Requests
                  </Link>

                  {donation.status === 'AVAILABLE' && (
                    <button
                      onClick={handleCancel}
                      className="py-3 px-5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition border border-rose-200 cursor-pointer"
                    >
                      Cancel Listing
                    </button>
                  )}
                </div>
              </div>
            ) : isDonor ? (
              <div className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p>
                  You are viewing this listing in <strong>Donor Mode</strong>. Only registered charities &amp; NGOs can request surplus food.
                </p>
                <Link
                  to="/donor/create-donation"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shrink-0 transition"
                >
                  + Donate Food
                </Link>
              </div>
            ) : canRequest ? (
              <button
                onClick={() => setShowRequestModal(true)}
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Utensils className="w-4 h-4" /> Request This Food
              </button>
            ) : !user ? (
              <Link
                to="/login"
                className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <Utensils className="w-4 h-4" /> Sign In as NGO to Request Food
              </Link>
            ) : isVolunteer ? (
              <div className="w-full p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-center justify-between">
                <span>Volunteers accept pickup &amp; distribution tasks after NGOs submit requests.</span>
                <Link to="/volunteer/available-tasks" className="font-bold text-blue-700 hover:underline shrink-0 ml-3">
                  View Tasks →
                </Link>
              </div>
            ) : (
              <div className="w-full py-3 px-6 bg-gray-100 text-gray-500 font-bold text-xs rounded-xl text-center">
                {donation.is_expired ? 'Listing deadline has passed' : 'Listing is currently unavailable'}
              </div>
            )}
          </div>
        </div>
      </div>

      {showRequestModal && (
        <RequestFoodModal
          donation={donation}
          onClose={() => setShowRequestModal(false)}
          onSuccess={fetchDetail}
        />
      )}
    </div>
  );
}
