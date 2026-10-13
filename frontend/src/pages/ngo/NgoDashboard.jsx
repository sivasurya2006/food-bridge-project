import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import StatsCard from '../../components/StatsCard';
import { useAuth } from '../../context/AuthContext';
import {
  Building2, Utensils, Truck, CheckCircle2, ShieldCheck,
  Clock, MapPin, ArrowRight, Package, AlertCircle
} from 'lucide-react';

export default function NgoDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);

  const loadData = async () => {
    try {
      const [reqRes, delRes] = await Promise.all([
        api.getMyRequests(),
        api.getNgoActiveDeliveries(),
      ]);
      setRequests(reqRes.data);
      setActiveDeliveries(delRes.data);
    } catch (err) {
      console.error("NGO dash load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmReceipt = async (pickupId) => {
    if (!window.confirm("Confirm that you have received this food delivery in good condition?")) return;
    setConfirmingId(pickupId);
    try {
      await api.confirmNgoReceipt(pickupId);
      alert("Receipt confirmed successfully! Thank you for distributing meals.");
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to confirm receipt.");
    } finally {
      setConfirmingId(null);
    }
  };

  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const completedRequests = requests.filter((r) => r.status === 'COMPLETED');
  const orgName = user?.org_profile?.organisation_name || user?.username;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1">
            <Building2 className="w-4 h-4" />
            <span>NGO / Receiver Portal</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
              ✓ Verified Partner
            </span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">{orgName}</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Discover available donations, manage incoming deliveries, and confirm received meals.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/donations"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/25"
          >
            <Utensils className="w-4 h-4" /> Discover Available Food
          </Link>
          <Link
            to="/ngo/requests"
            className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-2xs"
          >
            My Requests Tracker
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Truck}
          title="Active Deliveries"
          value={activeDeliveries.length}
          subtitle="En-route or assigned"
          color="amber"
        />
        <StatsCard
          icon={Clock}
          title="Pending Requests"
          value={pendingRequests.length}
          subtitle="Awaiting donor review"
          color="blue"
        />
        <StatsCard
          icon={CheckCircle2}
          title="Completed Rescues"
          value={completedRequests.length}
          subtitle="Distributions confirmed"
          color="emerald"
        />
        <StatsCard
          icon={ShieldCheck}
          title="Verification Status"
          value="Approved"
          subtitle="Authorised NGO receiver"
          color="purple"
        />
      </div>

      {/* Active In-Transit Deliveries Banner (Crucial Step 6 in workflow) */}
      {activeDeliveries.length > 0 && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-emerald-950">Active Deliveries Arriving Soon</h2>
            </div>
            <span className="text-xs text-emerald-700 font-bold">
              {activeDeliveries.length} in transit / assigned
            </span>
          </div>

          <p className="text-xs text-emerald-800 leading-relaxed">
            When a volunteer driver delivers the food, verify the packages and click <strong>Confirm Receipt</strong> to finalize the rescue trail.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {activeDeliveries.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Pickup #{p.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    p.status === 'IN_TRANSIT' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {p.status === 'IN_TRANSIT' ? '🚚 In Transit' : 'Volunteer Assigned'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-gray-900">{p.donation_title}</h4>
                  <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                    Quantity: {p.quantity} {p.unit} ({p.donation_category})
                  </p>
                </div>

                <div className="space-y-1 text-xs text-gray-500 pt-1 border-t border-gray-100">
                  <p><strong>From Donor:</strong> {p.donor_username} ({p.pickup_location})</p>
                  <p><strong>Volunteer Driver:</strong> {p.volunteer_username || 'Assigning volunteer'}</p>
                </div>

                <button
                  onClick={() => handleConfirmReceipt(p.id)}
                  disabled={confirmingId === p.id}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {confirmingId === p.id ? 'Confirming...' : 'Confirm Delivery Receipt'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Requests Section */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Recent Donation Requests</h2>
          <Link to="/ngo/requests" className="text-xs font-bold text-blue-600 hover:underline">
            View All ({requests.length})
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-gray-400">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <Utensils className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="text-xs text-gray-500">You haven't requested any food donations yet.</p>
            <Link to="/donations" className="inline-block text-xs font-bold text-emerald-600 hover:underline">
              Explore Available Food Listings →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {requests.slice(0, 5).map((req) => (
              <div key={req.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div>
                  <h4 className="font-bold text-gray-900">{req.donation_title}</h4>
                  <p className="text-gray-500 mt-0.5">
                    Requested: <strong>{req.requested_quantity} {req.donation_unit}</strong> • Donor: {req.donor_username}
                  </p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${
                  req.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                  req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                  req.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                  'bg-rose-100 text-rose-800'
                }`}>
                  {req.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
