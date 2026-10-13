import React, { useState } from 'react';
import { X, Utensils, AlertCircle, CheckCircle, Building2 } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function RequestFoodModal({ donation, onClose, onSuccess }) {
  const { user, isNGO } = useAuth();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!donation) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isNGO && user?.role !== 'ADMIN') {
      setError('Only registered NGOs can submit food donation requests. Please log in as an NGO.');
      return;
    }

    if (quantity <= 0) {
      setError('Requested quantity must be at least 1.');
      return;
    }

    if (quantity > donation.available_quantity) {
      setError(`Cannot request more than available quantity (${donation.available_quantity} ${donation.unit}).`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.requestDonation(donation.id, {
        requested_quantity: parseInt(quantity),
        notes: notes.trim(),
      });
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        navigate('/ngo/requests');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Request Submitted!</h3>
            <p className="text-sm text-gray-600 max-w-sm mx-auto">
              Your request for {quantity} {donation.unit} was sent to {donation.donor_name || donation.donor_username}. You will be notified once they review it.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <Building2 className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">NGO Food Request</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Request Donation
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              {donation.title} • {donation.available_quantity} {donation.unit} available
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!isNGO && (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                💡 You are currently logged in as <strong>{user ? user.role : 'Guest'}</strong>. To submit a request, please use an <strong>NGO account</strong> (use the Demo Switcher in top navigation).
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Quantity Required ({donation.unit}) *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max={donation.available_quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(donation.available_quantity)}
                    className="px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl whitespace-nowrap"
                  >
                    Max ({donation.available_quantity})
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Estimated impact: ~{Math.round((quantity / donation.quantity) * (donation.estimated_servings || quantity))} servings
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Beneficiary Distribution Notes
                </label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. For our evening community shelter dinner serving 30 people..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition shadow-md shadow-emerald-600/20"
                >
                  {loading ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
