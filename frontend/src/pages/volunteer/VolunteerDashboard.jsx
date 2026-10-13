import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import StatsCard from '../../components/StatsCard';
import VerifyOtpModal from '../../components/VerifyOtpModal';
import { useAuth } from '../../context/AuthContext';
import {
  Truck, CheckCircle2, KeyRound, MapPin, Clock,
  ArrowRight, ShieldCheck, AlertCircle, Phone, Building2
} from 'lucide-react';

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const [availableTasks, setAvailableTasks] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPickupForOtp, setSelectedPickupForOtp] = useState(null);

  const loadData = async () => {
    try {
      const [availRes, myRes] = await Promise.all([
        api.getVolunteerTasks(),
        api.getMyVolunteerTasks(),
      ]);
      setAvailableTasks(availRes.data);
      setMyTasks(myRes.data);
    } catch (err) {
      console.error("Volunteer dash error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeAssignedTasks = myTasks.filter((t) => t.status === 'ASSIGNED' || t.status === 'IN_TRANSIT');
  const completedTasks = myTasks.filter((t) => t.status === 'DELIVERED');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 mb-1">
            <Truck className="w-4 h-4" />
            <span>Volunteer Transportation Hub</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Welcome, {user?.first_name || user?.username}!
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Vehicle: <strong>{user?.volunteer_profile?.vehicle_type || 'Bicycle / Bike'}</strong> • Area: <strong>{user?.volunteer_profile?.service_area || 'City-wide'}</strong>
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/volunteer/tasks"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/25"
          >
            <span>Available Pickup Tasks</span>
            {availableTasks.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-emerald-700 text-[10px] font-bold">
                {availableTasks.length}
              </span>
            )}
          </Link>
          <Link
            to="/volunteer/my-tasks"
            className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-2xs"
          >
            Delivery History
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Truck}
          title="Open Tasks in City"
          value={availableTasks.length}
          subtitle="Ready for pickup acceptance"
          color="amber"
        />
        <StatsCard
          icon={KeyRound}
          title="My Active Tasks"
          value={activeAssignedTasks.length}
          subtitle="Assigned or in-transit"
          color="blue"
        />
        <StatsCard
          icon={CheckCircle2}
          title="Deliveries Completed"
          value={user?.volunteer_profile?.deliveries_completed || completedTasks.length}
          subtitle="Successful handovers to NGOs"
          color="emerald"
        />
        <StatsCard
          icon={ShieldCheck}
          title="Volunteer Standing"
          value="Verified Active"
          subtitle="High priority dispatcher"
          color="purple"
        />
      </div>

      {/* Active Tasks In Progress (Step 5 of workflow!) */}
      {activeAssignedTasks.length > 0 ? (
        <div className="bg-blue-50/70 border border-blue-200 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-blue-950">My Active Deliveries</h2>
            </div>
            <span className="text-xs text-blue-700 font-bold">
              {activeAssignedTasks.length} in progress
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeAssignedTasks.map((t) => (
              <div key={t.id} className="bg-white p-5 rounded-2xl border border-blue-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Task #{t.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    t.status === 'IN_TRANSIT' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {t.status === 'IN_TRANSIT' ? '🚚 In Transit' : '📍 Awaiting Donor Collection'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-gray-900">{t.donation_title}</h4>
                  <p className="text-xs text-emerald-700 font-bold mt-0.5">
                    Quantity: {t.quantity} {t.unit} ({t.donation_category})
                  </p>
                </div>

                {/* Route Cards */}
                <div className="p-3 bg-gray-50 rounded-xl space-y-2 text-xs text-gray-600 border border-gray-100">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-gray-900 block">1. Collect From (Donor):</strong>
                      <span>{t.donor_username} • {t.pickup_location}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1 border-t border-gray-200/60">
                    <Building2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-gray-900 block">2. Deliver To (NGO):</strong>
                      <span>{t.receiver_org_name || t.receiver_username} • {t.receiver_address || 'NGO Center'}</span>
                    </div>
                  </div>
                </div>

                {/* Status action button */}
                {t.status === 'ASSIGNED' ? (
                  <button
                    onClick={() => setSelectedPickupForOtp(t)}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                  >
                    <KeyRound className="w-4 h-4" />
                    Input Donor OTP to Confirm Collection
                  </button>
                ) : (
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl text-center text-xs font-semibold border border-emerald-100">
                    ✓ Food Collected & In Transit. Transport to destination NGO for receipt confirmation.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 text-center space-y-3">
          <Truck className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="text-sm font-bold text-gray-800">No active delivery assignments</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Check the available tasks board to accept new approved food donations in your neighborhood.
          </p>
          <Link
            to="/volunteer/tasks"
            className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
          >
            Browse Available Tasks ({availableTasks.length})
          </Link>
        </div>
      )}

      {/* Open tasks marketplace preview */}
      {availableTasks.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Available Tasks Near You</h2>
            <Link to="/volunteer/tasks" className="text-xs font-bold text-emerald-600 hover:underline">
              View All ({availableTasks.length})
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {availableTasks.map((t) => (
              <div key={t.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{t.donation_title}</h4>
                  <p className="text-gray-500 mt-0.5">
                    {t.quantity} {t.unit} • From: {t.donor_username} ({t.pickup_location}) → To: {t.receiver_org_name}
                  </p>
                </div>
                <Link
                  to="/volunteer/tasks"
                  className="self-start sm:self-auto px-3.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold rounded-lg transition"
                >
                  Accept Task →
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* OTP verification modal */}
      {selectedPickupForOtp && (
        <VerifyOtpModal
          pickup={selectedPickupForOtp}
          onClose={() => setSelectedPickupForOtp(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
