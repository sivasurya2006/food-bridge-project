import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Building2, ArrowLeft, Utensils, Clock, CheckCircle2, AlertCircle, Truck } from 'lucide-react';

export default function NgoRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await api.getMyRequests();
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <Link
        to="/ngo/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to NGO Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 mb-1">
            <Building2 className="w-4 h-4" />
            <span>Request Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            My Donation Requests
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Track the status of your food requests, donor approvals, and delivery progress.
          </p>
        </div>

        <Link
          to="/donations"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
        >
          + Request More Food
        </Link>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-gray-100 text-center space-y-3">
          <Utensils className="w-10 h-10 text-gray-300 mx-auto" />
          <h3 className="font-bold text-gray-800 text-sm">No food requests submitted yet</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Browse available food donations and submit requests for the portions your community needs.
          </p>
          <Link to="/donations" className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl">
            Explore Food Feed
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400">Request #{req.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    req.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                    req.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                    req.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    {req.status}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(req.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900">{req.donation_title}</h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                  <span className="font-bold text-emerald-700">
                    Quantity: {req.requested_quantity} {req.donation_unit}
                  </span>
                  <span>Donor: {req.donor_username}</span>
                  <span>Category: {req.donation_category}</span>
                </div>

                {req.notes && (
                  <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl border border-gray-100 italic">
                    "{req.notes}"
                  </p>
                )}
              </div>

              <div className="self-end md:self-center text-right space-y-1">
                {req.status === 'APPROVED' && (
                  <div className="p-2.5 bg-blue-50 text-blue-900 rounded-xl border border-blue-100 text-xs">
                    <p className="font-bold">✓ Request Approved</p>
                    <p className="text-[11px] text-blue-700">Awaiting Volunteer Handover</p>
                  </div>
                )}
                {req.status === 'COMPLETED' && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-100 text-xs">
                    <p className="font-bold">✓ Delivered & Confirmed</p>
                    <p className="text-[11px] text-emerald-700">Meals distributed</p>
                  </div>
                )}
                {req.status === 'PENDING' && (
                  <div className="p-2.5 bg-amber-50 text-amber-900 rounded-xl border border-amber-100 text-xs">
                    <p className="font-bold">⏳ In Review</p>
                    <p className="text-[11px] text-amber-700">Donor reviewing allocation</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
