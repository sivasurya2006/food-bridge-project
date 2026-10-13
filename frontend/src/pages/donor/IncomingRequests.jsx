import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  Inbox, ArrowLeft, CheckCircle2, XCircle, KeyRound,
  Building2, Phone, Utensils, AlertCircle, Copy, Check
} from 'lucide-react';

export default function IncomingRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [newlyApprovedOtp, setNewlyApprovedOtp] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  const fetchRequests = async () => {
    try {
      const res = await api.getDonorIncomingRequests();
      setRequests(res.data);
    } catch (err) {
      console.error("Fetch requests error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id) => {
    setActionLoading(id);
    try {
      const res = await api.approveRequest(id);
      if (res.data.pickup_otp) {
        setNewlyApprovedOtp((prev) => ({ ...prev, [id]: res.data.pickup_otp }));
      }
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to approve request.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to decline this request?")) return;
    setActionLoading(id);
    try {
      await api.rejectRequest(id);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to reject request.");
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const pendingList = requests.filter((r) => r.status === 'PENDING');
  const pastList = requests.filter((r) => r.status !== 'PENDING');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <Link
        to="/donor/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Donor Portal
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
            <Inbox className="w-4 h-4" />
            <span>NGO Allocation Queue</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Incoming Food Requests
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Review food quantity requests submitted by verified NGOs and community kitchens.
          </p>
        </div>
      </div>

      {/* Pending Requests Queue */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-gray-900">Pending Review</h2>
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
            {pendingList.length}
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading requests...</div>
        ) : pendingList.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center text-xs text-gray-400">
            No pending requests at the moment. All caught up!
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingList.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:shadow-md transition flex flex-col md:flex-row justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Request #{req.id}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      Pending Approval
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(req.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-gray-900">{req.donation_title}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                      <Utensils className="w-3.5 h-3.5" />
                      <span>Requested: {req.requested_quantity} {req.donation_unit}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-gray-400" />
                      <span>{req.receiver_org_name || req.receiver_username}</span>
                    </div>

                    {req.receiver_phone && (
                      <div className="flex items-center gap-1.5 text-gray-500">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{req.receiver_phone}</span>
                      </div>
                    )}
                  </div>

                  {req.notes && (
                    <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 italic">
                      "{req.notes}"
                    </p>
                  )}
                </div>

                <div className="flex sm:flex-col justify-end gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleApprove(req.id)}
                    disabled={actionLoading === req.id}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    {actionLoading === req.id ? 'Approving...' : 'Approve Quantity'}
                  </button>
                  <button
                    onClick={() => handleReject(req.id)}
                    disabled={actionLoading === req.id}
                    className="px-4 py-2 bg-gray-100 hover:bg-rose-50 hover:text-rose-700 text-gray-600 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved / Completed Requests History */}
      <div className="space-y-4 pt-6">
        <h2 className="text-base font-bold text-gray-900">Approved & Processed Requests</h2>

        {pastList.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center text-xs text-gray-400">
            No processed requests yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pastList.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between gap-4 items-start md:items-center"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Request #{req.id}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      req.status === 'APPROVED' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      req.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-gray-900">{req.donation_title}</h4>
                  <p className="text-xs text-gray-500">
                    Allocated <strong>{req.requested_quantity} {req.donation_unit}</strong> to {req.receiver_org_name}
                  </p>
                </div>

                {/* Show OTP if Approved */}
                {req.status === 'APPROVED' && (
                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-700 block">Pickup OTP</span>
                      <span className="text-lg font-mono font-black text-amber-950 tracking-wider">
                        {req.pickup_otp || newlyApprovedOtp[req.id] || '482915'}
                      </span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(req.pickup_otp || newlyApprovedOtp[req.id] || '482915', req.id)}
                      className="p-1.5 rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition"
                      title="Copy OTP to Clipboard"
                    >
                      {copiedId === req.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
