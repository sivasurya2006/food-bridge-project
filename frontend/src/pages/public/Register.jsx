import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HeartHandshake, UserPlus, Eye, EyeOff, Lock, User, Mail, Phone,
  MapPin, Building2, Utensils, Truck, AlertCircle, CheckCircle2,
  ArrowRight, ShieldCheck, Check
} from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Role: DONOR, NGO, VOLUNTEER (Admin excluded as per specifications)
  const [role, setRole] = useState('DONOR');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    confirm_password: '',
    phone: '',
    // Donor specific
    donor_type: 'Restaurant',
    // NGO specific
    organisation_name: '',
    reg_number: '',
    contact_person: '',
    // Volunteer specific
    vehicle_type: 'Bicycle',
    service_area: '',
    availability: 'Flexible / Daily',
    // Address fields
    address: '',
    city: '',
    pincode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) return 'Full Name is required.';
    if (!formData.email.trim()) return 'Email address is required.';
    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) return 'Please enter a valid email address.';
    if (!formData.username.trim()) return 'Username is required.';
    if (formData.password.length < 6) return 'Password must be at least 6 characters long.';
    if (formData.password !== formData.confirm_password) return 'Passwords do not match.';

    if (role === 'NGO') {
      if (!formData.organisation_name.trim()) return 'Organisation Name is required for NGO accounts.';
      if (!formData.address.trim()) return 'Physical address is required for NGO accounts.';
      if (!formData.city.trim()) return 'City is required for NGO accounts.';
      if (!formData.pincode.trim()) return 'Pincode is required for NGO accounts.';
    }

    if (role === 'DONOR') {
      if (!formData.donor_type) return 'Please specify your donor category.';
    }

    if (role === 'VOLUNTEER') {
      if (!formData.service_area.trim()) return 'Service area or neighborhood is required for volunteers.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      role: role,
    };
    delete payload.confirm_password;

    const res = await register(payload);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      // Wait briefly so the user sees the confirmation, then redirect to /login
      setTimeout(() => {
        navigate('/login', {
          state: {
            registeredMessage: 'Account created successfully! Please sign in with your credentials.',
            prefillUsername: formData.username,
          },
        });
      }, 1800);
    } else {
      setError(res.error || 'Registration failed. Please check the entered information.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-emerald-50/50 via-slate-50 to-teal-50/40 text-left">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden p-6 sm:p-10 lg:p-12">
        
        {/* Header & Logo */}
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white mx-auto shadow-md shadow-emerald-600/20">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Join FoodBridge
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
            Create an account to start donating surplus edible food, requesting meals for your community, or volunteering for delivery.
          </p>
        </div>

        {/* Success Modal / Banner */}
        {success && (
          <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-2 animate-in fade-in">
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="text-lg font-bold">Account Created Successfully!</h3>
            <p className="text-xs text-emerald-700">
              Welcome to the FoodBridge network. Redirecting you to the sign-in page...
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2.5 shadow-2xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Step 1: Account Type Selection Tabs */}
        <div className="mb-6 space-y-2">
          <label className="block text-xs font-bold text-gray-700">
            Select Account Type / Role <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Donor Tab */}
            <button
              type="button"
              onClick={() => setRole('DONOR')}
              className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                role === 'DONOR'
                  ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-600/20 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${role === 'DONOR' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Food Donor</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Restaurants, hotels, bakeries & grocers.</p>
              </div>
            </button>

            {/* NGO Tab */}
            <button
              type="button"
              onClick={() => setRole('NGO')}
              className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                role === 'NGO'
                  ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-600/20 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${role === 'NGO' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">NGO / Receiver</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Shelters, food banks & community kitchens.</p>
              </div>
            </button>

            {/* Volunteer Tab */}
            <button
              type="button"
              onClick={() => setRole('VOLUNTEER')}
              className={`p-4 rounded-2xl border text-left transition flex items-start gap-3 ${
                role === 'VOLUNTEER'
                  ? 'border-amber-600 bg-amber-50/50 ring-2 ring-amber-600/20 shadow-xs'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${role === 'VOLUNTEER' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Volunteer</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">Drivers and couriers assisting pickups.</p>
              </div>
            </button>
          </div>
          <p className="text-[11px] text-gray-400">
            Note: Platform Administrator accounts are granted through authorization only.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Account Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 pb-1 border-b border-gray-100">
              1. Basic Account Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    placeholder="e.g. Sarah Jenkins or Grand Palace"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="text-xs text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 font-mono">@</span>
                  <input
                    type="text"
                    required
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="choose_username"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@domain.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 555-0100"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Conditional Role Specific Details */}
          {role === 'DONOR' && (
            <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                <Utensils className="w-4 h-4 text-emerald-600" />
                <span>2. Food Donor Profile</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Donor Type / Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="donor_type"
                    value={formData.donor_type}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Restaurant">Restaurant</option>
                    <option value="Hotel">Hotel & Banquet Hall</option>
                    <option value="Bakery">Bakery & Confectionery</option>
                    <option value="Supermarket">Supermarket & Grocery Store</option>
                    <option value="Event Organiser">Event Organiser / Caterer</option>
                    <option value="Individual">Household / Individual</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Kitchen / Dispatch Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. 100 Grand Boulevard, Downtown"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Metro City"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 560001"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {role === 'NGO' && (
            <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>2. Organization & Verification Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Organisation Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="organisation_name"
                    value={formData.organisation_name}
                    onChange={handleChange}
                    placeholder="e.g. Hope Community Food Bank"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Registration / Tax Number
                  </label>
                  <input
                    type="text"
                    name="reg_number"
                    value={formData.reg_number}
                    onChange={handleChange}
                    placeholder="e.g. NGO-2024-899"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Centre Delivery Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. 12 Harmony Street, East District"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="e.g. Metro City"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Pincode <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="e.g. 560034"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {role === 'VOLUNTEER' && (
            <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-100 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>2. Volunteer Logistics & Availability</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Service Area / Neighborhood <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="service_area"
                    value={formData.service_area}
                    onChange={handleChange}
                    placeholder="e.g. Downtown & East District"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Vehicle Type
                  </label>
                  <select
                    name="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="Bicycle">Bicycle</option>
                    <option value="Motorcycle / Scooter">Motorcycle / Scooter</option>
                    <option value="Car">Car</option>
                    <option value="Van / Small Truck">Van / Small Truck</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Availability Schedule
                  </label>
                  <select
                    name="availability"
                    value={formData.availability}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 bg-white"
                  >
                    <option value="Flexible / Daily">Flexible / Daily</option>
                    <option value="Weekdays (Morning / Afternoon)">Weekdays (Morning / Afternoon)</option>
                    <option value="Weekdays (Evening 5PM - 10PM)">Weekdays (Evening 5PM - 10PM)</option>
                    <option value="Weekends Only">Weekends Only</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
            <span>{loading ? 'Creating Account...' : `Register as ${role === 'DONOR' ? 'Food Donor' : role === 'NGO' ? 'NGO Receiver' : 'Volunteer'}`}</span>
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 pt-5 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center gap-1">
              Login here <ArrowRight className="w-3 h-3" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
