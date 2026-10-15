import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import {
  User, Mail, Phone, MapPin, Lock, Save, CheckCircle2,
  AlertCircle, Key, Camera, Trash2, ArrowLeft, Building2,
  Truck, ShieldCheck, HeartHandshake, Calendar, Check,
  Sparkles, Award
} from 'lucide-react';

export default function Profile() {
  const { user, refreshUser, isDonor, isNGO, isVolunteer, isAdmin } = useAuth();
  const fileInputRef = useRef(null);

  // Form state initialized with user data
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    pincode: user?.pincode || '',
    donor_type: user?.donor_type || 'Restaurant',
    // NGO specific
    organisation_name: user?.org_profile?.organisation_name || '',
    reg_number: user?.org_profile?.reg_number || '',
    contact_person: user?.org_profile?.contact_person || '',
    // Volunteer specific
    vehicle_type: user?.volunteer_profile?.vehicle_type || 'Bike',
    service_area: user?.volunteer_profile?.service_area || 'All City',
    availability: user?.volunteer_profile?.availability || 'Available',
    // Password
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Avatar state
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Keep form in sync when user data loads or updates
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        pincode: user.pincode || '',
        donor_type: user.donor_type || 'Restaurant',
        organisation_name: user.org_profile?.organisation_name || '',
        reg_number: user.org_profile?.reg_number || '',
        contact_person: user.org_profile?.contact_person || '',
        vehicle_type: user.volunteer_profile?.vehicle_type || 'Bike',
        service_area: user.volunteer_profile?.service_area || 'All City',
        availability: user.volunteer_profile?.availability || 'Available',
      }));
      if (!avatarFile && !removeAvatar) {
        setAvatarPreview(user.avatar || null);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Selected image size must be less than 5MB.');
      return;
    }

    setErrorMsg('');
    setAvatarFile(file);
    setRemoveAvatar(false);

    // Create local object URL preview
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Password validation
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
      const dataPayload = new FormData();

      // Append standard text fields
      dataPayload.append('first_name', formData.first_name.trim());
      dataPayload.append('last_name', formData.last_name.trim());
      dataPayload.append('email', formData.email.trim());
      dataPayload.append('phone', formData.phone.trim());
      dataPayload.append('address', formData.address.trim());
      dataPayload.append('city', formData.city.trim());
      dataPayload.append('pincode', formData.pincode.trim());

      // Role specific fields
      if (isDonor) {
        dataPayload.append('donor_type', formData.donor_type);
      }
      if (isNGO) {
        dataPayload.append('organisation_name', formData.organisation_name.trim());
        dataPayload.append('reg_number', formData.reg_number.trim());
        dataPayload.append('contact_person', formData.contact_person.trim());
      }
      if (isVolunteer) {
        dataPayload.append('vehicle_type', formData.vehicle_type);
        dataPayload.append('service_area', formData.service_area.trim());
        dataPayload.append('availability', formData.availability);
      }

      // Password fields
      if (formData.new_password) {
        dataPayload.append('new_password', formData.new_password);
        if (formData.current_password) {
          dataPayload.append('current_password', formData.current_password);
        }
      }

      // Avatar handling
      if (avatarFile) {
        dataPayload.append('avatar', avatarFile);
      } else if (removeAvatar) {
        dataPayload.append('avatar', '');
      }

      await api.updateMe(dataPayload);
      await refreshUser();

      setSuccessMsg('Your profile has been successfully updated!');
      setFormData((prev) => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: '',
      }));
      setAvatarFile(null);
      setRemoveAvatar(false);
    } catch (err) {
      const resError = err.response?.data?.error || 
                       err.response?.data?.detail || 
                       'Failed to update profile. Please check the entered fields.';
      setErrorMsg(resError);
    } finally {
      setLoading(false);
    }
  };

  // Back link based on role
  const getBackLink = () => {
    if (isAdmin) return '/admin/dashboard';
    if (isNGO) return '/ngo/dashboard';
    if (isVolunteer) return '/volunteer/dashboard';
    return '/donor/dashboard';
  };

  // Theme styling based on role
  const getHeaderTheme = () => {
    if (isAdmin) {
      return {
        bg: 'bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900',
        badgeBg: 'bg-purple-500/20 text-purple-200 border-purple-400/30',
        accentText: 'text-purple-300',
        btnBg: 'bg-purple-700 hover:bg-purple-800 shadow-purple-700/20',
        ringColor: 'ring-purple-400/50',
      };
    }
    if (isNGO) {
      return {
        bg: 'bg-gradient-to-br from-blue-900 via-sky-900 to-slate-900',
        badgeBg: 'bg-blue-500/20 text-blue-200 border-blue-400/30',
        accentText: 'text-blue-300',
        btnBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20',
        ringColor: 'ring-blue-400/50',
      };
    }
    if (isVolunteer) {
      return {
        bg: 'bg-gradient-to-br from-teal-900 via-emerald-900 to-slate-900',
        badgeBg: 'bg-teal-500/20 text-teal-200 border-teal-400/30',
        accentText: 'text-teal-300',
        btnBg: 'bg-teal-600 hover:bg-teal-700 shadow-teal-600/20',
        ringColor: 'ring-teal-400/50',
      };
    }
    // Donor default
    return {
      bg: 'bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900',
      badgeBg: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
      accentText: 'text-emerald-300',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20',
      ringColor: 'ring-emerald-400/50',
    };
  };

  const theme = getHeaderTheme();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          to={getBackLink()}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Workspace
        </Link>
        <span className="text-xs font-medium text-gray-400">
          Account ID #{user?.id || '--'}
        </span>
      </div>

      {/* Hero Profile Header Card with Avatar */}
      <div className={`${theme.bg} rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden`}>
        <div className="absolute -right-10 -bottom-10 w-52 h-52 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative z-10 text-center sm:text-left">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group shrink-0">
              <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md border-2 border-white/20 shadow-2xl flex items-center justify-center ring-4 ${theme.ringColor}`}>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={user?.username || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-3xl sm:text-4xl font-black text-white uppercase tracking-wider">
                    {user?.first_name ? user.first_name[0] : (user?.username?.slice(0, 2) || 'FB')}
                  </div>
                )}
              </div>

              {/* Camera upload overlay trigger */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2 rounded-2xl bg-white text-gray-800 shadow-lg hover:bg-emerald-50 hover:text-emerald-700 transition cursor-pointer border border-gray-100 group-hover:scale-105"
                title="Upload Profile Picture"
              >
                <Camera className="w-4 h-4" />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarSelect}
                className="hidden"
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : user?.username}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase ${theme.badgeBg}`}>
                  {user?.role}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-gray-200 mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="font-semibold text-white/90">@{user?.username}</span>
                <span>•</span>
                <span>{user?.email || 'No email specified'}</span>
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-[11px] text-gray-300">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 opacity-70" />
                  Member since {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'Recent'}
                </span>
                {user?.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 opacity-70" />
                    {user.city}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Avatar Actions & Role Indicator Card */}
          <div className="flex flex-col items-center sm:items-end gap-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/20 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Change Photo</span>
              </button>

              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-bold transition flex items-center gap-1 border border-rose-400/30 cursor-pointer"
                  title="Remove Profile Picture"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-4 py-2 rounded-2xl text-center sm:text-right mt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/70 block">
                Primary Account
              </span>
              <span className="text-xs font-extrabold text-white">
                {isDonor ? (user?.donor_type || 'Food Donor') :
                 isNGO ? (user?.org_profile?.organisation_name || 'Verified NGO') :
                 isVolunteer ? `${user?.volunteer_profile?.deliveries_completed || 0} Deliveries Completed` :
                 'Super Administrator'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs sm:text-sm flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal & Contact Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Personal &amp; Contact Details</h2>
              <p className="text-xs text-gray-500">Manage your basic profile information and communication coordinates.</p>
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
                placeholder="e.g. Sakthivel"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="e.g. S"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Physical Address / Street</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <textarea
                  rows={2}
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Door No, Street Name, Landmark"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
                placeholder="e.g. Coimbatore"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Pincode / Postal Code</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="641001"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Role-Specific Information */}
        {isDonor && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Food Donor Category</h2>
                <p className="text-xs text-gray-500">Select what type of donor best describes your kitchen or business.</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Donor Classification</label>
              <select
                name="donor_type"
                value={formData.donor_type}
                onChange={handleChange}
                className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Restaurant">Restaurant</option>
                <option value="Hotel">Hotel / Resort</option>
                <option value="Bakery">Bakery / Confectionery</option>
                <option value="Catering">Catering / Banquet Hall</option>
                <option value="Supermarket">Supermarket / Grocery</option>
                <option value="Event Organiser">Event Organiser / Wedding</option>
                <option value="Corporate Cafeteria">Corporate Cafeteria</option>
                <option value="Individual">Individual Donor / Resident</option>
              </select>
            </div>
          </div>
        )}

        {isNGO && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">NGO &amp; Organisation Details</h2>
                <p className="text-xs text-gray-500">Official registry details used for platform verification &amp; transparency.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Organisation Name</label>
                <input
                  type="text"
                  name="organisation_name"
                  value={formData.organisation_name}
                  onChange={handleChange}
                  placeholder="e.g. Hope Foundation"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Registration / 80G Number</label>
                <input
                  type="text"
                  name="reg_number"
                  value={formData.reg_number}
                  onChange={handleChange}
                  placeholder="REG-2024-TN-889"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Primary Contact Person</label>
                <input
                  type="text"
                  name="contact_person"
                  value={formData.contact_person}
                  onChange={handleChange}
                  placeholder="e.g. Rajagurushri (Director of Outreach)"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              <div className="sm:col-span-2 p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <span>Verification Status:</span>
                  <span className="font-bold uppercase">{user?.org_profile?.verification_status || 'Approved'}</span>
                </div>
                <span className="text-[11px] text-blue-600 font-medium">Verified for Direct Food Pickups</span>
              </div>
            </div>
          </div>
        )}

        {isVolunteer && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Volunteer &amp; Delivery Logistics</h2>
                <p className="text-xs text-gray-500">Configure vehicle details and active operating service radius.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Vehicle Type</label>
                <select
                  name="vehicle_type"
                  value={formData.vehicle_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="Bike">Motorcycle / Bike</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Car">Car / SUV</option>
                  <option value="Van">Van / Mini Truck</option>
                  <option value="Bicycle">Bicycle</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Availability Status</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="Available">🟢 Available for Pickups</option>
                  <option value="Busy">🟡 Currently Busy</option>
                  <option value="Offline">⚪ Off-duty / Inactive</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Operating Service Area</label>
                <input
                  type="text"
                  name="service_area"
                  value={formData.service_area}
                  onChange={handleChange}
                  placeholder="e.g. RS Puram, Gandhipuram, Peelamedu"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                />
              </div>

              <div className="sm:col-span-2 p-3 bg-teal-50/60 rounded-xl border border-teal-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-teal-900">
                  <Award className="w-4 h-4 text-teal-600" />
                  <span>Total Deliveries Fulfilled:</span>
                  <span className="font-bold">{user?.volunteer_profile?.deliveries_completed || 0} Missions</span>
                </div>
                <span className="text-[11px] text-teal-700 font-semibold">Active Volunteer Badge</span>
              </div>
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="bg-purple-50/60 border border-purple-200/80 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-purple-700" />
              <h3 className="text-sm font-bold text-purple-950">Active Platform Governance Rights</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-purple-900">
              <div className="flex items-center gap-2 bg-white/70 p-3 rounded-xl border border-purple-100">
                <Check className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Full NGO Organization Verification Authority</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 p-3 rounded-xl border border-purple-100">
                <Check className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Direct Food Request Approval &amp; Overrides</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 p-3 rounded-xl border border-purple-100">
                <Check className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Volunteer Mission Dispatch &amp; Handover Monitoring</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 p-3 rounded-xl border border-purple-100">
                <Check className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Comprehensive System Audit Logs &amp; Traceability</span>
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Password & Security */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
          <div className="flex items-center gap-2.5 border-b border-gray-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Security &amp; Password Management</h2>
              <p className="text-xs text-gray-500">Leave password fields empty if you do not want to alter your password.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Current Password <span className="text-gray-400 font-normal">(only required when setting a new password)</span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="current_password"
                  value={formData.current_password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to={getBackLink()}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2.5 ${theme.btnBg} disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer`}
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
