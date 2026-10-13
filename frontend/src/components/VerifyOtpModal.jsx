import React, { useState } from 'react';
import { X, KeyRound, CheckCircle2, AlertCircle, Truck } from 'lucide-react';
import { api } from '../api/client';

export default function VerifyOtpModal({ pickup, onClose, onSuccess }) {
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!pickup) return null;

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otpCode.trim().length < 4) {
      setError('Please enter the 6-digit OTP provided by the donor.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.verifyPickupOtp(pickup.id, otpCode.trim());
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess(res.data.pickup);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP code. Please ask the donor for the correct code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">OTP Verified!</h3>
            <p className="text-sm text-gray-600">
              Food collection verified. The pickup status is now <strong>In Transit</strong>. Please transport safely to the destination NGO.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <KeyRound className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Pickup Verification</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              Enter Donor OTP Code
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Ask donor ({pickup.donor_username}) for the 6-digit verification code to confirm food handover.
            </p>

            <div className="p-3 bg-gray-50 rounded-xl mb-4 text-xs space-y-1 text-gray-600">
              <p><strong>Item:</strong> {pickup.donation_title}</p>
              <p><strong>Quantity:</strong> {pickup.quantity} {pickup.unit}</p>
              <p><strong>Pickup Location:</strong> {pickup.pickup_location}</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  6-Digit OTP Code *
                </label>
                <input
                  type="text"
                  maxLength="8"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 482915"
                  required
                  className="w-full text-center tracking-widest text-xl font-mono font-bold px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
                >
                  <Truck className="w-4 h-4" />
                  {loading ? 'Verifying...' : 'Verify & Start Transit'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
