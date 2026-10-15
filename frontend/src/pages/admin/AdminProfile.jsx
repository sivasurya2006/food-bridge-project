import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
  ShieldCheck, ArrowLeft, User, Mail, Phone, MapPin,
  Lock, Save, CheckCircle2, AlertCircle, Key, Shield,
  Building, Calendar, Clock
} from 'lucide-react';

export default function AdminProfile() {
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    pincode: user?.pincode || '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (formData.new_password) {
      if (formData.new_password.length < 6) {
        setErrorMsg('New password must be at least 6 characters long.');
        return;
      }
      if (formData.new_password !== formData.confirm_password) {
        setErrorMsg('New password and confirm password do not match.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        pincode: formData.pincode.trim(),
      };

      if (formData.new_password) {
        payload.new_password = formData.new_password;
        if (formData.current_password) {
          payload.current_password = formData.current_password;
        }
      }

      await api.updateMe(payload);
      await refreshUser();

      setSuccessMsg('Admin profile updated successfully!');
      setFormData((prev) => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: '',
      }));
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* Back button */}
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Admin Dashboard
      </Link>

      {/* Header Profile Card */}
      <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-purple-300 flex items-center justify-center font-black text-2xl shadow-inner shrink-0">
              {user?.username?.slice(0, 2).toUpperCase() || 'AD'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30 uppercase">
                  Superuser
                </span>
              </div>
              <p className="text-xs sm:text-sm text-purple-200/80 mt-1 flex items-center gap-2">
                <span>@{user?.username}</span>
                <span>•</span>
                <span>Platform Administrator</span>
              </p>
              <p className="text-[11px] text-purple-300/60 mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Joined {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'Active Member'}</span>
              </p>
            </div>
          </div>

          <div className="self-stretch sm:self-auto bg-white/10 backdrop-blur-md border border-white/15 px-4 py-3 rounded-2xl flex sm:flex-col items-center justify-between sm:justify-center text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200/70">
              Access Level
            </span>
            <span className="text-sm font-black text-white mt-0.5">
              Root Admin
            </span>
          </div>
        </div>
      </div>

      {/* Alert Banners */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal & Contact Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
            <User className="w-5 h-5 text-purple-600" />
            <div>
              <h2 className="text-base font-bold text-gray-900">Personal &amp; Contact Information</h2>
              <p className="text-xs text-gray-500">Update your primary administrative contact details.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">First Name</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="e.g. Platform"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="e.g. Administrator"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@foodbridge.org"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Admin Office / Dispatch HQ Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <textarea
                  rows={2}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="HQ Central Control Hub, 5th Floor, City Civic Center"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Metro City"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Postal Code (Pincode)</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="560001"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Security & Password Settings */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
            <Lock className="w-5 h-5 text-purple-600" />
            <div>
              <h2 className="text-base font-bold text-gray-900">Security &amp; Password Management</h2>
              <p className="text-xs text-gray-500">Leave password fields blank if you do not wish to change your password.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Current Password <span className="text-gray-400 font-normal">(only required when changing password)</span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Administrative Privileges Overview */}
        <div className="bg-purple-50/60 border border-purple-200/80 rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-700" />
            <h3 className="text-sm font-bold text-purple-950">Active Platform Governance Rights</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-purple-900">
            <div className="flex items-center gap-2 bg-white/70 p-3 rounded-xl border border-purple-100">
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Full NGO Organization Verification Authority</span>
            </div>
            <div className="flex items-center gap-2 bg-white/70 p-3 rounded-xl border border-purple-100">
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Override &amp; Direct Food Request Approval</span>
            </div>
            <div className="flex items-center gap-2 bg-white/70 p-3 rounded-xl border border-purple-100">
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Comprehensive System Audit Logs &amp; Traceability</span>
            </div>
            <div className="flex items-center gap-2 bg-white/70 p-3 rounded-xl border border-purple-100">
              <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0" />
              <span>Volunteer Dispatch &amp; Handover Monitoring</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to="/admin/dashboard"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-purple-700/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
