import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../../api/client';
import StatsCard from '../../components/StatsCard';
import {
  ShieldCheck, Building2, Utensils, Truck, Users,
  CheckCircle2, XCircle, Clock, AlertTriangle, RefreshCw, UserCog, Inbox
} from 'lucide-react';

export default function AdminDashboard() {
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [approvingReqId, setApprovingReqId] = useState(null);

  const loadData = async () => {
    try {
      const [statsRes, orgRes, reqRes] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getOrganizations(),
        api.getDonorIncomingRequests(),
      ]);
      setStats(statsRes.data);
      setOrganizations(orgRes.data);
      setRequests(reqRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (location.hash) {
      const el = document.querySelector(location.hash);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }
    }
  }, [location.hash, loading]);

  const handleApproveRequest = async (id) => {
    setApprovingReqId(id);
    try {
      const res = await api.approveRequest(id);
      alert(`Request approved by Admin! Pickup task generated with OTP: ${res.data.pickup_otp}. Volunteers can now accept this in the Volunteer Hub.`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to approve request.");
    } finally {
      setApprovingReqId(null);
    }
  };

  const handleVerify = async (id, status) => {
    setActionLoading(id);
    try {
      await api.verifyOrganization(id, status);
      loadData();
    } catch (err) {
      alert("Failed to update organisation status.");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-600 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Administration & Compliance</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Oversee platform registrations, verify receiving organisations, and audit rescue workflows.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/admin/profile"
            className="px-3.5 py-2 text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 hover:bg-purple-100 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
          >
            <UserCog className="w-3.5 h-3.5" /> Admin Profile
          </Link>
          <button
            onClick={loadData}
            className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Stats
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Utensils}
          title="Total Rescued"
          value={stats?.servings_rescued?.toLocaleString() || '12,025'}
          subtitle="Estimated meal servings"
          color="emerald"
        />
        <StatsCard
          icon={Truck}
          title="Deliveries"
          value={stats?.completed_deliveries || '18'}
          subtitle="Completed handovers"
          color="teal"
        />
        <StatsCard
          icon={Building2}
          title="Partner NGOs"
          value={stats?.total_ngos || '2'}
          subtitle="Community kitchens & shelters"
          color="blue"
        />
        <StatsCard
          icon={Users}
          title="Active Volunteers"
          value={stats?.total_volunteers || '2'}
          subtitle="Verified delivery couriers"
          color="purple"
        />
      </div>

      {/* Organisation Verification Center */}
      <div id="organizations" className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 shadow-xs scroll-mt-8">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Registered Receiving Organisations</h2>
            <p className="text-xs text-gray-500">Verify legitimacy and legal standing before granting food request permissions.</p>
          </div>
          <span className="text-xs text-gray-400 font-semibold">{organizations.length} organizations</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-gray-400">Loading organizations...</div>
        ) : organizations.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">No organizations found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-bold text-gray-400 uppercase border-b border-gray-100">
                <tr>
                  <th className="pb-3">Organization Name</th>
                  <th className="pb-3">Reg. Number</th>
                  <th className="pb-3">Contact Person</th>
                  <th className="pb-3">City & Address</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {organizations.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 pr-4 font-bold text-gray-900">
                      {org.organisation_name}
                    </td>
                    <td className="py-3.5 font-mono text-gray-500">
                      {org.reg_number || 'N/A'}
                    </td>
                    <td className="py-3.5 text-gray-700">
                      {org.contact_person || 'Coordinator'}
                    </td>
                    <td className="py-3.5 text-gray-500 max-w-xs truncate">
                      {org.city} • {org.address}
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        org.verification_status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        org.verification_status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {org.verification_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 text-right space-x-2">
                      {org.verification_status !== 'approved' && (
                        <button
                          onClick={() => handleVerify(org.id, 'approved')}
                          disabled={actionLoading === org.id}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg shadow-2xs transition"
                        >
                          Verify & Approve
                        </button>
                      )}
                      {org.verification_status !== 'rejected' && (
                        <button
                          onClick={() => handleVerify(org.id, 'rejected')}
                          disabled={actionLoading === org.id}
                          className="px-3 py-1 bg-gray-100 hover:bg-rose-100 text-gray-700 hover:text-rose-700 font-bold text-[11px] rounded-lg transition"
                        >
                          Reject
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

      {/* Platform Food Requests & Dispatch Queue */}
      <div id="requests" className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 shadow-xs scroll-mt-8">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Food Donation Requests & Volunteer Dispatch</h2>
            <p className="text-xs text-gray-500">
              Review requests from NGOs and dispatch volunteer drivers by approving pending allocations.
            </p>
          </div>
          <span className="text-xs text-gray-400 font-semibold">{requests.length} total requests</span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-gray-400">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="py-8 text-center text-xs text-gray-400">No donation requests submitted yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[11px] font-bold text-gray-400 uppercase border-b border-gray-100">
                <tr>
                  <th className="pb-3">Req ID</th>
                  <th className="pb-3">Food Listing</th>
                  <th className="pb-3">Donor</th>
                  <th className="pb-3">Requesting NGO</th>
                  <th className="pb-3">Qty Requested</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Pickup Task</th>
                  <th className="pb-3 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 font-mono font-bold text-gray-400">#{r.id}</td>
                    <td className="py-3.5 font-bold text-gray-900">{r.donation_title}</td>
                    <td className="py-3.5 text-gray-600">{r.donor_username}</td>
                    <td className="py-3.5 text-gray-800 font-medium">{r.receiver_org_name || r.receiver_username}</td>
                    <td className="py-3.5 text-emerald-700 font-bold">{r.requested_quantity} {r.donation_unit}</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        r.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                        r.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                        r.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3.5">
                      {r.pickup_id ? (
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-mono">
                          Pickup #{r.pickup_id} ({r.pickup_status})
                        </span>
                      ) : (
                        <span className="text-gray-400 text-[11px] italic">Not generated</span>
                      )}
                    </td>
                    <td className="py-3.5 text-right">
                      {r.status === 'PENDING' && (
                        <button
                          onClick={() => handleApproveRequest(r.id)}
                          disabled={approvingReqId === r.id}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold text-[11px] rounded-lg shadow-2xs transition"
                        >
                          {approvingReqId === r.id ? 'Approving...' : 'Approve & Dispatch Volunteer'}
                        </button>
                      )}
                      {r.status === 'APPROVED' && r.pickup_otp && (
                        <span className="text-[11px] font-mono bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded font-bold">
                          OTP: {r.pickup_otp}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Breakdown Matrix */}
      {stats?.categories && stats.categories.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 shadow-xs">
          <h2 className="text-lg font-bold text-gray-900">Food Category Distribution</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.categories.map((c) => (
              <div key={c.category} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <span className="text-xs font-semibold text-gray-500 block">{c.category}</span>
                <span className="text-xl font-bold text-gray-900 mt-1 block">{c.count} listings</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
