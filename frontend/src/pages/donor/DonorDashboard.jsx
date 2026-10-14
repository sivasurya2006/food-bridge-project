import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import StatsCard from '../../components/StatsCard';
import {
  Utensils, PlusCircle, Inbox, KeyRound, Clock, MapPin,
  CheckCircle2, AlertCircle, Trash2, Eye, ShieldCheck, ArrowRight
} from 'lucide-react';

export default function DonorDashboard() {
  const [myDonations, setMyDonations] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [donRes, reqRes] = await Promise.all([
        api.getMyDonations(),
        api.getDonorIncomingRequests(),
      ]);
      setMyDonations(donRes.data);
      setIncomingRequests(reqRes.data);
    } catch (err) {
      console.error("Donor dash error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancelDonation = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this listing?")) return;
    try {
      await api.cancelDonation(id);
      loadData();
    } catch (err) {
      alert("Failed to cancel donation.");
    }
  };

  const [approvingId, setApprovingId] = useState(null);

  const handleApproveRequest = async (id) => {
    setApprovingId(id);
    try {
      const res = await api.approveRequest(id);
      alert(`Request approved! Pickup task created with OTP: ${res.data.pickup_otp}. A volunteer can now accept this task in the Volunteer Hub.`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to approve request.");
    } finally {
      setApprovingId(null);
    }
  };

  const activeDonations = myDonations.filter((d) => d.status === 'AVAILABLE' && !d.is_expired);
  const pendingRequests = incomingRequests.filter((r) => r.status === 'PENDING');
  const approvedRequests = incomingRequests.filter((r) => r.status === 'APPROVED');
  const totalServingsRescued = myDonations.reduce((acc, curr) => acc + (curr.reserved_quantity * (curr.estimated_servings / (curr.quantity || 1) || 1)), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
            <Utensils className="w-4 h-4" />
            <span>Food Donor Portal</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Donor Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Manage your surplus food listings, review incoming NGO requests, and track pickups.
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/donor/requests"
            className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-2xs"
          >
            <Inbox className="w-4 h-4 text-emerald-600" />
            <span>Incoming Requests</span>
            {pendingRequests.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px]">
                {pendingRequests.length}
              </span>
            )}
          </Link>
          <Link
            to="/donor/create"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/25"
          >
            <PlusCircle className="w-4 h-4" /> List Food Donation
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Utensils}
          title="Active Listings"
          value={activeDonations.length}
          subtitle="Available for NGOs to request"
          color="emerald"
        />
        <StatsCard
          icon={Inbox}
          title="Pending Requests"
          value={pendingRequests.length}
          subtitle="Awaiting your approval"
          color="amber"
        />
        <StatsCard
          icon={KeyRound}
          title="Active Pickups"
          value={approvedRequests.length}
          subtitle="Ready with OTP handover"
          color="blue"
        />
        <StatsCard
          icon={ShieldCheck}
          title="Total Rescued"
          value={`~${Math.round(totalServingsRescued)}`}
          subtitle="Servings saved from waste"
          color="purple"
        />
      </div>

      {/* Pending NGO Requests Awaiting Approval */}
      {pendingRequests.length > 0 && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-3xl p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Inbox className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-emerald-950">
                Action Required: Pending NGO Food Requests ({pendingRequests.length})
              </h2>
            </div>
            <Link to="/donor/requests" className="text-xs font-bold text-emerald-700 hover:underline">
              View Queue →
            </Link>
          </div>
          <p className="text-xs text-emerald-800">
            NGOs have requested portions of your listed food. <strong>Click 'Approve & Create Volunteer Task'</strong> to generate the volunteer pickup dispatch and your handover OTP!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {pendingRequests.map((req) => (
              <div key={req.id} className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Request #{req.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                      Pending Approval
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900">{req.donation_title}</h4>
                  <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                    <p>Requested: <strong className="text-emerald-700">{req.requested_quantity} {req.donation_unit}</strong></p>
                    <p>NGO: <strong>{req.receiver_org_name || req.receiver_username}</strong></p>
                    {req.receiver_phone && <p>Contact: {req.receiver_phone}</p>}
                    {req.notes && <p className="italic text-gray-500">"{req.notes}"</p>}
                  </div>
                </div>

                <button
                  onClick={() => handleApproveRequest(req.id)}
                  disabled={approvingId === req.id}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {approvingId === req.id ? 'Approving...' : 'Approve & Create Volunteer Task'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Pickups & OTP Section (Crucial for workflow Step 5!) */}
      {approvedRequests.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-amber-950">Active Pickups — Share OTP with Volunteers</h2>
            </div>
            <span className="text-xs text-amber-700 font-semibold">
              {approvedRequests.length} Scheduled
            </span>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            Give this 6-digit code to the arriving volunteer driver. They must input it to verify collection and shift delivery status to <strong>In Transit</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {approvedRequests.map((req) => (
              <div key={req.id} className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Request #{req.id}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                    Awaiting Handover
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900 truncate">{req.donation_title}</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    For: <strong>{req.receiver_org_name}</strong> ({req.requested_quantity} {req.donation_unit})
                  </p>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl text-center border border-amber-200/60">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block mb-0.5">Pickup Verification OTP</span>
                  <span className="text-xl font-mono font-black text-amber-900 tracking-widest">
                    {req.pickup_otp || '482915'}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 text-center">
                  Volunteer: {req.volunteer_name || 'Driver en-route'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Listings Section */}
      <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">My Food Donation Listings</h2>
          <span className="text-xs text-gray-400">{myDonations.length} total created</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading listings...</div>
        ) : myDonations.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Utensils className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-xs text-gray-500">You haven't listed any food donations yet.</p>
            <Link
              to="/donor/create"
              className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-bold text-gray-400 uppercase border-b border-gray-100">
                <tr>
                  <th className="pb-3">Title & Category</th>
                  <th className="pb-3">Quantity</th>
                  <th className="pb-3">Deadline</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {myDonations.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 pr-4">
                      <div className="font-bold text-gray-900">{d.title}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">{d.category} • ~{d.estimated_servings} servings</div>
                    </td>
                    <td className="py-3.5 font-semibold text-gray-700">
                      <div>{d.available_quantity} / {d.quantity} {d.unit}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{d.reserved_quantity} reserved</div>
                    </td>
                    <td className="py-3.5 text-gray-500">
                      {new Date(d.pickup_deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        d.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-800' :
                        d.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                        d.status === 'RESERVED' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      <Link
                        to={`/donations/${d.id}`}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-600 hover:bg-gray-100 inline-block"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      {d.status === 'AVAILABLE' && (
                        <button
                          onClick={() => handleCancelDonation(d.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          title="Cancel Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
