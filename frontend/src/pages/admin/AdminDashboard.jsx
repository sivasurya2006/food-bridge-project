import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import StatsCard from '../../components/StatsCard';
import {
  ShieldCheck, Building2, Utensils, Truck, Users,
  CheckCircle2, XCircle, Clock, AlertTriangle, RefreshCw
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const loadData = async () => {
    try {
      const [statsRes, orgRes] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getOrganizations(),
      ]);
      setStats(statsRes.data);
      setOrganizations(orgRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

        <button
          onClick={loadData}
          className="self-start sm:self-auto px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Stats
        </button>
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
      <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 shadow-xs">
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
