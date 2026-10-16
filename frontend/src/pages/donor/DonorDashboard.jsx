import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import StatsCard from '../../components/StatsCard';
import {
  LayoutDashboard, PlusCircle, Utensils, Inbox, Truck,
  Clock, BarChart3, Bell, User, LogOut, CheckCircle2,
  XCircle, KeyRound, MapPin, AlertCircle, Trash2, Eye,
  Sparkles, Check, ArrowRight, Camera, Copy, Calendar,
  ShieldCheck, RefreshCw, Search, Filter, AlertTriangle,
  Building2, Phone, Mail, Award, Lock, Save, ExternalLink
} from 'lucide-react';

export default function DonorDashboard({ defaultTab = 'dashboard' }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuth();

  // Tab synchronization from query parameter or prop
  const queryTab = new URLSearchParams(location.search).get('tab');
  const [activeTab, setActiveTab] = useState(queryTab || defaultTab || 'dashboard');

  useEffect(() => {
    if (queryTab) {
      setActiveTab(queryTab);
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [queryTab, defaultTab]);

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    const targetPath = tabId === 'dashboard' ? '/donor/dashboard' : `/donor/${tabId}`;
    navigate(targetPath);
  };

  // Main Data States
  const [myDonations, setMyDonations] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [donorPickups, setDonorPickups] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [analyticsSummary, setAnalyticsSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Interaction feedback states
  const [actionLoading, setActionLoading] = useState(null);
  const [actionMessage, setActionMessage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Search & Filter states
  const [donationFilter, setDonationFilter] = useState('ALL');
  const [donationSearch, setDonationSearch] = useState('');
  const [requestFilter, setRequestFilter] = useState('ALL');
  const [historyFilter, setHistoryFilter] = useState('ALL');
  const [historySearch, setHistorySearch] = useState('');
  const [notifFilter, setNotifFilter] = useState('ALL');

  // Load all donor data
  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [donRes, reqRes, pickRes, notifRes, summaryRes] = await Promise.allSettled([
        api.getMyDonations(),
        api.getDonorIncomingRequests(),
        api.getDonorPickups(),
        api.getNotifications(),
        api.getAnalyticsSummary(),
      ]);

      if (donRes.status === 'fulfilled' && donRes.value?.data) {
        setMyDonations(Array.isArray(donRes.value.data) ? donRes.value.data : (donRes.value.data.results || []));
      }
      if (reqRes.status === 'fulfilled' && reqRes.value?.data) {
        setIncomingRequests(Array.isArray(reqRes.value.data) ? reqRes.value.data : (reqRes.value.data.results || []));
      }
      if (pickRes.status === 'fulfilled' && pickRes.value?.data) {
        setDonorPickups(Array.isArray(pickRes.value.data) ? pickRes.value.data : (pickRes.value.data.results || []));
      }
      if (notifRes.status === 'fulfilled' && notifRes.value?.data) {
        setNotifications(Array.isArray(notifRes.value.data) ? notifRes.value.data : (notifRes.value.data.results || []));
      }
      if (summaryRes.status === 'fulfilled' && summaryRes.value?.data) {
        setAnalyticsSummary(summaryRes.value.data);
      }
    } catch (err) {
      console.error("Error loading donor data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Notification helper
  const showFeedback = (type, text) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage(null), 5000);
  };

  // Approve NGO Request
  const handleApproveRequest = async (id) => {
    setActionLoading(`approve-${id}`);
    try {
      const res = await api.approveRequest(id);
      showFeedback('success', `Request approved! Handover OTP generated: ${res.data.pickup_otp}. A volunteer can now accept this pickup task.`);
      await loadData(true);
    } catch (err) {
      showFeedback('error', err.response?.data?.error || "Failed to approve request.");
    } finally {
      setActionLoading(null);
    }
  };

  // Reject NGO Request
  const handleRejectRequest = async (id) => {
    if (!window.confirm("Are you sure you want to decline this NGO request? The held food quantity will be released back to your available stock.")) return;
    setActionLoading(`reject-${id}`);
    try {
      await api.rejectRequest(id);
      showFeedback('info', 'Request declined. Held food servings have been restored to your available listing.');
      await loadData(true);
    } catch (err) {
      showFeedback('error', err.response?.data?.error || "Failed to decline request.");
    } finally {
      setActionLoading(null);
    }
  };

  // Cancel Donation Listing
  const handleCancelDonation = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this listing? All pending NGO requests for this listing will be cancelled.")) return;
    setActionLoading(`cancel-don-${id}`);
    try {
      await api.cancelDonation(id);
      showFeedback('info', 'Listing cancelled successfully.');
      await loadData(true);
    } catch (err) {
      showFeedback('error', err.response?.data?.error || "Failed to cancel donation.");
    } finally {
      setActionLoading(null);
    }
  };

  // Mark all notifications read
  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      showFeedback('success', 'All notifications marked as read.');
    } catch (err) {
      showFeedback('error', 'Failed to mark notifications read.');
    }
  };

  // ----------------------------------------------------
  // Calculated Metrics
  // ----------------------------------------------------
  const activeDonations = myDonations.filter((d) => d.status === 'AVAILABLE' && !d.is_expired);
  const pendingRequests = incomingRequests.filter((r) => r.status === 'PENDING');
  const completedDonations = myDonations.filter((d) => d.status === 'COMPLETED');
  const activePickups = donorPickups.filter((p) => ['SCHEDULED', 'ASSIGNED', 'IN_TRANSIT'].includes(p.status));
  const completedPickups = donorPickups.filter((p) => p.status === 'DELIVERED');

  const totalServingsRescued = myDonations.reduce((acc, curr) => {
    const servings = curr.estimated_servings || curr.quantity || 0;
    return acc + (curr.status === 'COMPLETED' ? servings : (curr.reserved_quantity || 0));
  }, 0);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const donorDisplayName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.username || 'Donor');

  // =========================================================================
  // SUB-COMPONENT: Create Donation Form
  // =========================================================================
  const CreateDonationForm = () => {
    const defaultDeadline = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 16);
    const defaultPreparedDate = new Date().toISOString().slice(0, 10);

    const [form, setForm] = useState({
      title: '',
      description: '',
      category: 'Cooked Meals',
      quantity: 30,
      unit: 'servings',
      estimated_servings: 30,
      prepared_at: defaultPreparedDate,
      pickup_deadline: defaultDeadline,
      pickup_location: user?.address || '100 Grand Boulevard, Dispatch Gate',
      city: user?.city || 'Metro City',
      pincode: user?.pincode || '560001',
      storage_instructions: 'Keep warm in insulated food containers or refrigerate below 4°C.',
      allergen_information: 'Vegetarian, contains dairy. Nut-free.',
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const fileRef = useRef(null);

    const handleFormChange = (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({
        ...prev,
        [name]: value,
        ...(name === 'quantity' && prev.unit === 'servings' ? { estimated_servings: value } : {}),
      }));
    };

    const handleFileSelect = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setFormError('');
      }
    };

    const handleRemoveFile = () => {
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileRef.current) fileRef.current.value = '';
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setFormError('');

      if (!selectedFile) {
        setFormError('Please upload a food photo first.');
        return;
      }
      if (!form.title.trim()) {
        setFormError('Please enter a food title.');
        return;
      }
      if (Number(form.quantity) <= 0) {
        setFormError('Quantity must be greater than 0.');
        return;
      }
      if (!form.pickup_location.trim()) {
        setFormError('Please provide a pickup location address.');
        return;
      }

      setSubmitting(true);
      try {
        const data = new FormData();
        data.append('title', form.title.trim());
        data.append('category', form.category);
        data.append('quantity', form.quantity);
        data.append('unit', form.unit);
        data.append('estimated_servings', form.estimated_servings || form.quantity);
        data.append('prepared_at', new Date(form.prepared_at).toISOString());
        data.append('pickup_deadline', new Date(form.pickup_deadline).toISOString());
        data.append('pickup_location', form.pickup_location.trim());
        data.append('city', form.city.trim());
        data.append('pincode', form.pincode.trim());
        data.append('storage_instructions', form.storage_instructions.trim());
        data.append('allergen_information', form.allergen_information.trim());
        data.append('description', form.description.trim());

        if (selectedFile) {
          data.append('image', selectedFile);
        }

        await api.createDonation(data);
        showFeedback('success', 'Food donation listing published successfully! NGOs can now view and request portions.');
        await loadData(true);
        switchTab('donations');
      } catch (err) {
        console.error("Create donation error:", err);
        setFormError(err.response?.data?.error || err.response?.data?.detail || 'Failed to publish listing. Please check form inputs.');
      } finally {
        setSubmitting(false);
      }
    };

    const hasPhoto = Boolean(selectedFile || previewUrl);

    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
            <PlusCircle className="w-4 h-4" />
            <span>Core Feature</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create Food Donation</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {hasPhoto
              ? 'Food photo verified. Fill in the donation details below to publish your surplus food listing.'
              : 'Upload or snap a food photo to unlock the donation listing options.'}
          </p>
        </div>

        {formError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}

        {/* STEP 1: FOOD IMAGE UPLOAD */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold text-gray-800 uppercase tracking-wide">
              <Camera className="w-4 h-4 text-emerald-600" />
              <span>Step 1: Upload Food Photo <span className="text-rose-500">*</span></span>
            </label>
            {hasPhoto && (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <Check className="w-3.5 h-3.5" />
                Photo Attached
              </span>
            )}
          </div>

          <input
            type="file"
            ref={fileRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="hidden"
          />

          {!hasPhoto ? (
            /* Unuploaded State: Large Inviting Card */
            <div
              onClick={() => fileRef.current?.click()}
              className="group cursor-pointer p-8 sm:p-10 border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-3xl bg-emerald-50/40 hover:bg-emerald-50/80 transition-all text-center space-y-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-white border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <Camera className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-gray-900 group-hover:text-emerald-800 transition-colors">
                  Click to Upload or Snap Food Photo
                </h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  Take a clear photo of the prepared meal, packed boxes, or food containers.
                </p>
              </div>
              <div>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/25 group-hover:bg-emerald-700 transition">
                  <Camera className="w-3.5 h-3.5" />
                  Choose Food Photo
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Supports JPG, PNG, WEBP up to 5MB. Photo upload is required to unlock donation details.
              </p>
            </div>
          ) : (
            /* Uploaded State: Clean preview thumbnail with Change / Remove actions */
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 border border-emerald-200 rounded-2xl bg-emerald-50/30">
              <div className="relative w-36 h-28 rounded-2xl overflow-hidden border border-emerald-300 shadow-xs shrink-0">
                <img src={previewUrl} alt="Food Preview" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Food Photo Attached</h4>
                  <p className="text-xs text-gray-500">
                    {selectedFile?.name || 'Selected Food Image'}
                  </p>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="px-3.5 py-1.5 bg-white border border-gray-200 hover:border-emerald-300 text-gray-700 text-xs font-bold rounded-xl shadow-2xs hover:bg-emerald-50 transition"
                  >
                    Change Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="px-3.5 py-1.5 bg-white border border-rose-200 hover:border-rose-300 text-rose-700 text-xs font-bold rounded-xl shadow-2xs hover:bg-rose-50 transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: REMAINING OPTIONS (Only shown when hasPhoto is true!) */}
        {!hasPhoto ? (
          /* Locked placeholder message */
          <div className="p-6 rounded-2xl border border-gray-200 bg-slate-50/70 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-gray-200/80 text-gray-500 mx-auto flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-gray-700">Donation Options Locked</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Please upload a photo of the food above. Food name, category, quantity, preparation date, and deadline options will appear here right away!
            </p>
          </div>
        ) : (
          /* Unlocked Full Form */
          <form onSubmit={handleSubmit} className="space-y-6 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase tracking-wide">
              <Utensils className="w-4 h-4" />
              <span>Step 2: Enter Donation Details</span>
            </div>

            {/* Food Name & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Food Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  placeholder="e.g. Vegetable Dum Biryani, Fresh Bread Buns"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Food Category <span className="text-rose-500">*</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                >
                  <option value="Cooked Meals">Cooked Meals / Prepared Food</option>
                  <option value="Bakery & Bread">Bakery &amp; Bread</option>
                  <option value="Fresh Produce">Fresh Produce (Fruits &amp; Vegetables)</option>
                  <option value="Packaged Food">Packaged &amp; Canned Groceries</option>
                  <option value="Dairy & Milk">Dairy &amp; Milk Products</option>
                  <option value="Beverages">Beverages &amp; Juices</option>
                  <option value="Other">Other Surplus Food</option>
                </select>
              </div>
            </div>

            {/* Quantity & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Quantity <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={form.quantity}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Unit of Measurement
                </label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleFormChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                >
                  <option value="servings">servings / portions</option>
                  <option value="kg">kg (kilograms)</option>
                  <option value="packets">packets / meal boxes</option>
                  <option value="boxes">boxes / cartons</option>
                  <option value="liters">liters</option>
                </select>
              </div>
            </div>

            {/* Preparation Date (Date only!) & Pickup Deadline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Preparation Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  name="prepared_at"
                  value={form.prepared_at}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
                <p className="text-[10px] text-gray-400 mt-1">Date when the food was cooked or packed.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Pickup Deadline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="pickup_deadline"
                  value={form.pickup_deadline}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
                <p className="text-[10px] text-gray-400 mt-1">Latest safe collection time.</p>
              </div>
            </div>

            {/* Location & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Pickup Address / Kitchen Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="pickup_location"
                  value={form.pickup_location}
                  onChange={handleFormChange}
                  placeholder="Restaurant address, gate number, or kitchen dispatch bay"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  City &amp; Pincode
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleFormChange}
                    placeholder="City"
                    className="w-2/3 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                  />
                  <input
                    type="text"
                    name="pincode"
                    value={form.pincode}
                    onChange={handleFormChange}
                    placeholder="Pin"
                    className="w-1/3 px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition text-center"
                  />
                </div>
              </div>
            </div>

            {/* Storage & Allergens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Storage Instructions
                </label>
                <input
                  type="text"
                  name="storage_instructions"
                  value={form.storage_instructions}
                  onChange={handleFormChange}
                  placeholder="e.g. Keep refrigerated, or consume within 3 hours"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Allergen Information
                </label>
                <input
                  type="text"
                  name="allergen_information"
                  value={form.allergen_information}
                  onChange={handleFormChange}
                  placeholder="e.g. Contains peanuts, dairy, gluten or nut-free"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Additional Notes / Pickup Instructions
              </label>
              <textarea
                name="description"
                rows="2"
                value={form.description}
                onChange={handleFormChange}
                placeholder="e.g. Bring insulated carry boxes; parking available at the rear ramp."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => switchTab('donations')}
                className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white text-xs font-bold rounded-xl transition shadow-sm shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Publishing Listing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Publish Food Donation</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  // =========================================================================
  // SUB-COMPONENT: My Profile Tab
  // =========================================================================
  const DonorProfileTab = () => {
    const [profileForm, setProfileForm] = useState({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      donor_type: user?.donor_type || 'Restaurant',
      address: user?.address || '',
      city: user?.city || '',
      pincode: user?.pincode || '',
      current_password: '',
      new_password: '',
      confirm_password: '',
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
    const [saving, setSaving] = useState(false);
    const avatarInputRef = useRef(null);

    const handleProfileChange = (e) => {
      const { name, value } = e.target;
      setProfileForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAvatarSelect = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
      }
    };

    const handleSaveProfile = async (e) => {
      e.preventDefault();
      if (profileForm.new_password && profileForm.new_password !== profileForm.confirm_password) {
        showFeedback('error', 'New passwords do not match.');
        return;
      }
      setSaving(true);
      try {
        const data = new FormData();
        data.append('first_name', profileForm.first_name);
        data.append('last_name', profileForm.last_name);
        data.append('email', profileForm.email);
        data.append('phone', profileForm.phone);
        data.append('donor_type', profileForm.donor_type);
        data.append('address', profileForm.address);
        data.append('city', profileForm.city);
        data.append('pincode', profileForm.pincode);

        if (avatarFile) {
          data.append('avatar', avatarFile);
        }

        if (profileForm.new_password) {
          data.append('current_password', profileForm.current_password);
          data.append('new_password', profileForm.new_password);
        }

        await api.updateMe(data);
        await refreshUser();
        showFeedback('success', 'Profile and account settings saved successfully!');
        setProfileForm((prev) => ({
          ...prev,
          current_password: '',
          new_password: '',
          confirm_password: '',
        }));
      } catch (err) {
        showFeedback('error', err.response?.data?.error || 'Failed to update profile.');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xs space-y-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
            <User className="w-4 h-4" />
            <span>Donor Account</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">My Profile &amp; Settings</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Manage your organization information, dispatch address, and credentials.
          </p>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-black text-xl text-emerald-800 uppercase">
                  {user?.username?.slice(0, 2) || 'DO'}
                </span>
              )}
            </div>
            <div className="space-y-1">
              <input
                type="file"
                ref={avatarInputRef}
                onChange={handleAvatarSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="px-3 py-1.5 bg-white border border-gray-200 text-xs font-bold text-gray-700 rounded-xl hover:bg-emerald-50 hover:border-emerald-300 transition"
              >
                Change Avatar
              </button>
              <p className="text-[10px] text-gray-400">JPG, PNG or WEBP up to 5MB.</p>
            </div>
          </div>

          {/* Name & Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">First / Org Name</label>
              <input
                type="text"
                name="first_name"
                value={profileForm.first_name}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Last Name / Branch</label>
              <input
                type="text"
                name="last_name"
                value={profileForm.last_name}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Contact Phone</label>
              <input
                type="text"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
          </div>

          {/* Donor Type Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Donor Type</label>
            <select
              name="donor_type"
              value={profileForm.donor_type}
              onChange={handleProfileChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            >
              <option value="Restaurant">Restaurant / Cafe</option>
              <option value="Hotel">Hotel / Resort</option>
              <option value="Catering Service">Catering &amp; Banquet Service</option>
              <option value="Supermarket">Supermarket / Grocery Retailer</option>
              <option value="Corporate Cafeteria">Corporate / College Cafeteria</option>
              <option value="Bakery">Bakery / Confectionery</option>
              <option value="Individual Donor">Individual / Home Donor</option>
              <option value="Other">Other Food Establishment</option>
            </select>
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Default Pickup Location</label>
              <input
                type="text"
                name="address"
                value={profileForm.address}
                onChange={handleProfileChange}
                placeholder="Street address / Kitchen dock"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">City &amp; Pincode</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="city"
                  value={profileForm.city}
                  onChange={handleProfileChange}
                  placeholder="City"
                  className="w-2/3 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                />
                <input
                  type="text"
                  name="pincode"
                  value={profileForm.pincode}
                  onChange={handleProfileChange}
                  placeholder="Pin"
                  className="w-1/3 px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-center"
                />
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="pt-4 border-t border-gray-100 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Change Password (Leave blank to keep current)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <input
                  type="password"
                  name="current_password"
                  value={profileForm.current_password}
                  onChange={handleProfileChange}
                  placeholder="Current Password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                />
              </div>
              <div>
                <input
                  type="password"
                  name="new_password"
                  value={profileForm.new_password}
                  onChange={handleProfileChange}
                  placeholder="New Password (min 6 chars)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                />
              </div>
              <div>
                <input
                  type="password"
                  name="confirm_password"
                  value={profileForm.confirm_password}
                  onChange={handleProfileChange}
                  placeholder="Confirm New Password"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold text-xs rounded-xl transition shadow-sm shadow-emerald-600/25 flex items-center gap-2"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    );
  };

  // -------------------------------------------------------------------------
  // Filtering for "My Donations"
  // -------------------------------------------------------------------------
  const filteredDonations = myDonations.filter((d) => {
    if (donationFilter === 'AVAILABLE' && (d.status !== 'AVAILABLE' || d.is_expired)) return false;
    if (donationFilter === 'PARTIALLY_RESERVED' && !(d.status === 'AVAILABLE' && d.reserved_quantity > 0 && d.available_quantity > 0)) return false;
    if (donationFilter === 'FULLY_RESERVED' && !(d.reserved_quantity > 0 && d.available_quantity === 0)) return false;
    if (donationFilter === 'COMPLETED' && d.status !== 'COMPLETED') return false;
    if (donationFilter === 'EXPIRED' && (!d.is_expired && d.status !== 'EXPIRED')) return false;
    if (donationFilter === 'CANCELLED' && d.status !== 'CANCELLED') return false;

    if (donationSearch.trim()) {
      const q = donationSearch.toLowerCase();
      return (d.title || '').toLowerCase().includes(q) || (d.category || '').toLowerCase().includes(q);
    }
    return true;
  });

  // -------------------------------------------------------------------------
  // Filtering for "NGO Requests"
  // -------------------------------------------------------------------------
  const filteredRequests = incomingRequests.filter((r) => {
    if (requestFilter === 'PENDING' && r.status !== 'PENDING') return false;
    if (requestFilter === 'APPROVED' && r.status !== 'APPROVED') return false;
    if (requestFilter === 'REJECTED' && !['REJECTED', 'CANCELLED'].includes(r.status)) return false;
    return true;
  });

  // -------------------------------------------------------------------------
  // Filtering for "Donation History"
  // -------------------------------------------------------------------------
  const historyList = myDonations.filter((d) => {
    const isPast = ['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(d.status) || d.is_expired;
    if (!isPast) return false;
    if (historyFilter === 'COMPLETED' && d.status !== 'COMPLETED') return false;
    if (historyFilter === 'CANCELLED' && d.status !== 'CANCELLED') return false;
    if (historyFilter === 'EXPIRED' && (!d.is_expired && d.status !== 'EXPIRED')) return false;

    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      return (d.title || '').toLowerCase().includes(q) || (d.category || '').toLowerCase().includes(q);
    }
    return true;
  });

  // -------------------------------------------------------------------------
  // Notifications filtering
  // -------------------------------------------------------------------------
  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'UNREAD') return !n.is_read;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Toast Alert Message */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs transition-all ${
          actionMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : actionMessage.type === 'error'
            ? 'bg-rose-50 border-rose-300 text-rose-900'
            : 'bg-blue-50 border-blue-300 text-blue-900'
        }`}>
          <div className="flex items-center gap-2.5">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : actionMessage.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            ) : (
              <KeyRound className="w-5 h-5 text-blue-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TAB: DASHBOARD / OVERVIEW                                              */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {/* Welcome Hero - Sample Design */}
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-md shadow-emerald-900/10">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-[11px] font-bold tracking-wide uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Surplus Food Rescue Active</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                  {getGreeting()}, {donorDisplayName}!
                </h1>
                <p className="text-emerald-100 text-sm sm:text-base font-medium">
                  Let's make surplus food useful.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => switchTab('create')}
                  className="px-5 py-3 bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold text-xs sm:text-sm rounded-2xl shadow-sm transition flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <span>+ Create Food Donation</span>
                </button>
                <button
                  onClick={() => switchTab('requests')}
                  className="px-5 py-3 bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-xs sm:text-sm rounded-2xl transition flex items-center gap-2"
                >
                  <Inbox className="w-4 h-4 text-amber-300" />
                  <span>View NGO Requests</span>
                  {pendingRequests.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[10px]">
                      {pendingRequests.length}
                    </span>
                  )}
                </button>
              </div>
            </div>
            {/* Background glowing gradient circles */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-40 -top-12 w-48 h-48 bg-teal-300/15 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* 4 Top Stat Cards - Sample Design (Total Donations, Pending Requests, Completed, Active Pickups) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Donations</p>
                <h3 className="text-3xl font-black text-gray-900 mt-1">{myDonations.length}</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Surplus listings created</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Utensils className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pending Requests</p>
                <h3 className="text-3xl font-black text-amber-600 mt-1">{pendingRequests.length}</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Awaiting donor approval</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Inbox className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Completed</p>
                <h3 className="text-3xl font-black text-blue-600 mt-1">{completedDonations.length}</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Successfully handed over</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Pickups</p>
                <h3 className="text-3xl font-black text-purple-600 mt-1">{activePickups.length}</h3>
                <p className="text-[11px] text-gray-500 mt-0.5">En route with OTP handover</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Truck className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Pending NGO Requests - Action Required Section */}
          {pendingRequests.length > 0 && (
            <div className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-amber-600" />
                  <h2 className="text-base font-bold text-amber-950">
                    Action Required: Pending NGO Food Requests ({pendingRequests.length})
                  </h2>
                </div>
                <button
                  onClick={() => switchTab('requests')}
                  className="text-xs font-bold text-amber-800 hover:underline flex items-center gap-1"
                >
                  <span>Manage All Requests</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-amber-800">
                NGOs have requested portions of your surplus food listings. Approve to reserve the food and generate a Volunteer Pickup OTP code.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {pendingRequests.slice(0, 3).map((req) => (
                  <div key={req.id} className="bg-white p-5 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] uppercase font-bold text-gray-400">Request #{req.id}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                          Pending Approval
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-gray-900">{req.donation_title}</h4>
                      <div className="text-xs text-gray-600 mt-1.5 space-y-1">
                        <p>Requested: <strong className="text-emerald-700">{req.requested_quantity} {req.donation_unit}</strong></p>
                        <p>NGO: <strong>{req.receiver_org_name || req.receiver_username}</strong></p>
                        {req.receiver_phone && <p>Contact: {req.receiver_phone}</p>}
                        {req.notes && <p className="italic text-gray-500 line-clamp-2">"{req.notes}"</p>}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleRejectRequest(req.id)}
                        disabled={actionLoading === `reject-${req.id}`}
                        className="w-1/3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleApproveRequest(req.id)}
                        disabled={actionLoading === `approve-${req.id}`}
                        className="w-2/3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{actionLoading === `approve-${req.id}` ? 'Approving...' : 'Approve & OTP'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Pickups & Handover OTP Section */}
          {activePickups.length > 0 && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base font-bold text-emerald-950">Active Pickups — Share OTP with Courier</h2>
                </div>
                <button
                  onClick={() => switchTab('pickups')}
                  className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <span>Track Deliveries</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-emerald-800">
                Give this 6-digit code to the arriving volunteer courier. They enter it upon collection to confirm handover.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {activePickups.slice(0, 3).map((pickup) => (
                  <div key={pickup.id} className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-gray-400">Pickup #{pickup.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        pickup.status === 'IN_TRANSIT' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {pickup.status === 'IN_TRANSIT' ? 'In Transit' : 'Scheduled Handover'}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-gray-900 truncate">{pickup.donation_title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        For: <strong>{pickup.receiver_org_name || pickup.receiver_username}</strong> ({pickup.quantity} {pickup.unit})
                      </p>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Courier: <strong>{pickup.volunteer_username || 'Awaiting assignment'}</strong> {pickup.volunteer_phone ? `(${pickup.volunteer_phone})` : ''}
                      </p>
                    </div>

                    {pickup.display_otp && (
                      <div className="p-3 bg-emerald-50 rounded-xl text-center border border-emerald-200 flex items-center justify-between px-4">
                        <div>
                          <span className="text-[9px] uppercase font-bold text-emerald-700 block">Pickup OTP</span>
                          <span className="text-xl font-mono font-black text-emerald-950 tracking-widest">
                            {pickup.display_otp}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(pickup.display_otp, pickup.id)}
                          className="p-1.5 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-100 text-emerald-700 transition"
                          title="Copy OTP"
                        >
                          {copiedId === pickup.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Listings Summary Table */}
          <div className="bg-white rounded-3xl border border-gray-100 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Food Listings</h3>
                <p className="text-xs text-gray-400">Available portion stock and statuses</p>
              </div>
              <button
                onClick={() => switchTab('donations')}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
              >
                <span>View All ({myDonations.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-gray-400">Loading food listings...</div>
            ) : myDonations.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Utensils className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-xs text-gray-500">You haven't published any food donation listings yet.</p>
                <button
                  onClick={() => switchTab('create')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition"
                >
                  + Create First Donation
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="text-[11px] font-bold text-gray-400 uppercase border-b border-gray-100">
                    <tr>
                      <th className="pb-3">Food Listing</th>
                      <th className="pb-3">Available / Total</th>
                      <th className="pb-3">Reservation Status</th>
                      <th className="pb-3">Deadline</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {myDonations.slice(0, 5).map((d) => {
                      const isPartial = d.status === 'AVAILABLE' && d.reserved_quantity > 0 && d.available_quantity > 0;
                      const isFull = d.status === 'AVAILABLE' && d.available_quantity === 0 && d.reserved_quantity > 0;
                      return (
                        <tr key={d.id} className="hover:bg-gray-50/50 transition">
                          <td className="py-3.5 pr-4">
                            <div className="font-bold text-gray-900">{d.title}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5">{d.category} • ~{d.estimated_servings} servings</div>
                          </td>
                          <td className="py-3.5">
                            <div className="font-bold text-emerald-700">
                              {d.available_quantity} <span className="text-gray-400 font-normal">/ {d.quantity} {d.unit}</span>
                            </div>
                            <div className="text-[10px] text-amber-700 font-medium">
                              {d.reserved_quantity} reserved by NGOs
                            </div>
                          </td>
                          <td className="py-3.5">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              isPartial
                                ? 'bg-amber-100 text-amber-800'
                                : isFull
                                ? 'bg-purple-100 text-purple-800'
                                : d.status === 'AVAILABLE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : d.status === 'COMPLETED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {isPartial ? 'Partially Reserved' : isFull ? 'Fully Reserved' : d.status}
                            </span>
                          </td>
                          <td className="py-3.5 text-gray-500">
                            {new Date(d.pickup_deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB: CREATE FOOD DONATION                                              */}
      {/* ========================================================================= */}
      {activeTab === 'create' && <CreateDonationForm />}

      {/* ========================================================================= */}
      {/* 3. TAB: MY DONATIONS                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'donations' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
                <Utensils className="w-4 h-4" />
                <span>Inventory Management</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">My Food Donations</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Track available portions, reserved quantities, and active listing statuses.
              </p>
            </div>
            <button
              onClick={() => switchTab('create')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-sm shadow-emerald-600/25 self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Create Food Donation</span>
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
              {[
                { id: 'ALL', label: `All (${myDonations.length})` },
                { id: 'AVAILABLE', label: 'Available' },
                { id: 'PARTIALLY_RESERVED', label: 'Partially Reserved' },
                { id: 'FULLY_RESERVED', label: 'Fully Reserved' },
                { id: 'COMPLETED', label: 'Completed' },
                { id: 'CANCELLED', label: 'Cancelled' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setDonationFilter(btn.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    donationFilter === btn.id
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={donationSearch}
                onChange={(e) => setDonationSearch(e.target.value)}
                placeholder="Search food by name..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Listings Table */}
          {loading ? (
            <div className="py-16 text-center text-xs text-gray-400">Loading food listings...</div>
          ) : filteredDonations.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Utensils className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500">No food listings found for the selected filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] font-bold text-gray-400 uppercase border-b border-gray-100">
                  <tr>
                    <th className="pb-3">Food &amp; Category</th>
                    <th className="pb-3">Portion Stock Breakdown</th>
                    <th className="pb-3">Pickup Deadline</th>
                    <th className="pb-3">Listing Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredDonations.map((d) => {
                    const isPartial = d.status === 'AVAILABLE' && d.reserved_quantity > 0 && d.available_quantity > 0;
                    const isFull = d.status === 'AVAILABLE' && d.available_quantity === 0 && d.reserved_quantity > 0;
                    const pctReserved = d.quantity > 0 ? Math.min(100, Math.round((d.reserved_quantity / d.quantity) * 100)) : 0;

                    return (
                      <tr key={d.id} className="hover:bg-gray-50/50 transition">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            {d.image ? (
                              <img src={d.image} alt={d.title} className="w-12 h-12 rounded-xl object-cover shrink-0 border border-gray-100" />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                                <Utensils className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-sm text-gray-900">{d.title}</div>
                              <div className="text-[11px] text-gray-400">{d.category} • ~{d.estimated_servings} servings</div>
                              {d.storage_instructions && (
                                <div className="text-[10px] text-gray-400 italic mt-0.5 line-clamp-1">{d.storage_instructions}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Portion Stock with Visual Bar */}
                        <td className="py-4 min-w-[180px]">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-bold text-emerald-700">{d.available_quantity} {d.unit} Available</span>
                            <span className="text-[11px] text-gray-400 font-medium">{d.reserved_quantity} Reserved</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                            <div
                              style={{ width: `${pctReserved}%` }}
                              className="bg-amber-400 h-full transition-all"
                              title={`${pctReserved}% Reserved`}
                            />
                            <div
                              style={{ width: `${100 - pctReserved}%` }}
                              className="bg-emerald-500 h-full transition-all"
                              title={`${100 - pctReserved}% Available`}
                            />
                          </div>
                          <div className="text-[10px] text-gray-400 mt-1">Total: {d.quantity} {d.unit}</div>
                        </td>

                        <td className="py-4 text-gray-600">
                          <div className="font-medium">
                            {new Date(d.pickup_deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">{d.pickup_location}</div>
                        </td>

                        <td className="py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            isPartial
                              ? 'bg-amber-100 text-amber-800'
                              : isFull
                              ? 'bg-purple-100 text-purple-800'
                              : d.status === 'AVAILABLE'
                              ? 'bg-emerald-100 text-emerald-800'
                              : d.status === 'COMPLETED'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {isPartial ? 'Partially Reserved' : isFull ? 'Fully Reserved' : d.status}
                          </span>
                        </td>

                        <td className="py-4 text-right space-x-2">
                          <Link
                            to={`/donations/${d.id}`}
                            className="p-2 rounded-xl text-gray-500 hover:text-emerald-600 hover:bg-gray-100 inline-block transition"
                            title="View Public Page"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          {d.status === 'AVAILABLE' && (
                            <button
                              onClick={() => handleCancelDonation(d.id)}
                              className="p-2 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition"
                              title="Cancel Listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB: NGO REQUESTS                                                      */}
      {/* ========================================================================= */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
                <Inbox className="w-4 h-4" />
                <span>Core Feature</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">NGO Allocation Requests</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Review requesting NGO, requested quantity, and approve with pickup OTP generation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setRequestFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    requestFilter === filter
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-gray-400">Loading requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Inbox className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500">No requests found under this filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className={`p-6 rounded-2xl border transition flex flex-col justify-between space-y-4 ${
                    req.status === 'PENDING'
                      ? 'border-amber-300 bg-amber-50/30'
                      : req.status === 'APPROVED'
                      ? 'border-emerald-200 bg-white'
                      : 'border-gray-200 bg-slate-50/50 opacity-75'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        Request #{req.id} • {new Date(req.created_at).toLocaleDateString()}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {req.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-gray-900">{req.donation_title}</h3>
                    <p className="text-xs text-emerald-700 font-bold mt-1">
                      Requested Portion: {req.requested_quantity} {req.donation_unit}
                    </p>

                    <div className="mt-3 p-3 bg-white/80 rounded-xl border border-gray-100 text-xs text-gray-600 space-y-1">
                      <p className="flex items-center gap-1.5 font-bold text-gray-800">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>NGO: {req.receiver_org_name || req.receiver_username}</span>
                      </p>
                      {req.receiver_phone && (
                        <p className="flex items-center gap-1.5 text-gray-500">
                          <Phone className="w-3.5 h-3.5" />
                          <span>Contact: {req.receiver_phone}</span>
                        </p>
                      )}
                      {req.notes && (
                        <p className="italic text-gray-500 pt-1 border-t border-gray-50">
                          "{req.notes}"
                        </p>
                      )}
                    </div>

                    {/* Pickup OTP if approved */}
                    {req.pickup_otp && (
                      <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-emerald-700 block">Pickup Handover OTP</span>
                          <span className="text-xl font-mono font-black text-emerald-950 tracking-wider">
                            {req.pickup_otp}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(req.pickup_otp, req.id)}
                          className="p-1.5 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-100 text-emerald-700 transition"
                        >
                          {copiedId === req.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions for Pending Requests */}
                  {req.status === 'PENDING' && (
                    <div className="flex gap-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleRejectRequest(req.id)}
                        disabled={actionLoading === `reject-${req.id}`}
                        className="w-1/3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleApproveRequest(req.id)}
                        disabled={actionLoading === `approve-${req.id}`}
                        className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{actionLoading === `approve-${req.id}` ? 'Approving...' : 'Approve & Generate OTP'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB: PICKUP & DELIVERY TRACKING                                        */}
      {/* ========================================================================= */}
      {activeTab === 'pickups' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
              <Truck className="w-4 h-4" />
              <span>Logistics &amp; Fulfillment</span>
            </div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Pickup &amp; Delivery Tracking</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Monitor volunteer couriers, delivery progress, and handover OTP verification in real-time.
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-gray-400">Loading pickups...</div>
          ) : donorPickups.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Truck className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500">No active or historical pickups yet.</p>
              <p className="text-[11px] text-gray-400">When you approve an NGO request, a pickup dispatch is created here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {donorPickups.map((p) => {
                const isDelivered = p.status === 'DELIVERED';
                const isInTransit = p.status === 'IN_TRANSIT';
                const isAssigned = p.status === 'ASSIGNED';

                return (
                  <div key={p.id} className="p-6 rounded-2xl border border-gray-200 bg-white shadow-2xs space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Dispatch #{p.id}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isDelivered ? 'bg-blue-100 text-blue-800' :
                            isInTransit ? 'bg-purple-100 text-purple-800' :
                            isAssigned ? 'bg-amber-100 text-amber-800' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                        <h3 className="font-bold text-base text-gray-900 mt-1">{p.donation_title}</h3>
                        <p className="text-xs text-emerald-700 font-semibold">{p.quantity} {p.unit} ({p.donation_category})</p>
                      </div>

                      {/* Handover OTP Box */}
                      {p.display_otp && (
                        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center sm:text-right">
                          <span className="text-[9px] font-bold uppercase text-amber-800 block">Handover OTP Code</span>
                          <span className="text-xl font-mono font-black text-amber-950 tracking-widest">{p.display_otp}</span>
                        </div>
                      )}
                    </div>

                    {/* Courier and Destination Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Volunteer Driver</span>
                        <p className="font-bold text-gray-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{p.volunteer_username || 'Awaiting volunteer acceptance'}</span>
                        </p>
                        {p.volunteer_phone && (
                          <p className="text-gray-500 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{p.volunteer_phone}</span>
                          </p>
                        )}
                        <p className="text-[11px] text-gray-400">Vehicle: {p.volunteer_vehicle || 'Bike'}</p>
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Recipient NGO</span>
                        <p className="font-bold text-gray-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{p.receiver_org_name || p.receiver_username}</span>
                        </p>
                        {p.receiver_phone && (
                          <p className="text-gray-500 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{p.receiver_phone}</span>
                          </p>
                        )}
                        <p className="text-[11px] text-gray-400 truncate">Delivery to: {p.receiver_address || 'NGO Center'}</p>
                      </div>
                    </div>

                    {/* 4-Step Progress Stepper */}
                    <div className="pt-2">
                      <div className="grid grid-cols-4 text-center text-[10px] font-bold">
                        <div className="text-emerald-700">1. Approved</div>
                        <div className={isAssigned || isInTransit || isDelivered ? 'text-emerald-700' : 'text-gray-300'}>
                          2. Assigned
                        </div>
                        <div className={isInTransit || isDelivered ? 'text-emerald-700' : 'text-gray-300'}>
                          3. Picked Up
                        </div>
                        <div className={isDelivered ? 'text-blue-700' : 'text-gray-300'}>
                          4. Delivered
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-100 rounded-full mt-2 overflow-hidden flex">
                        <div className="w-1/4 bg-emerald-500 h-full" />
                        <div className={`w-1/4 h-full ${isAssigned || isInTransit || isDelivered ? 'bg-emerald-500' : 'bg-transparent'}`} />
                        <div className={`w-1/4 h-full ${isInTransit || isDelivered ? 'bg-emerald-500' : 'bg-transparent'}`} />
                        <div className={`w-1/4 h-full ${isDelivered ? 'bg-blue-600' : 'bg-transparent'}`} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB: DONATION HISTORY                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
                <Clock className="w-4 h-4" />
                <span>Archive &amp; Records</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Donation History</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Past records of completed, cancelled, and expired food surplus donations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {['ALL', 'COMPLETED', 'CANCELLED', 'EXPIRED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setHistoryFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    historyFilter === filter
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder="Search historical listings..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
            />
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-gray-400">Loading history...</div>
          ) : historyList.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Clock className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500">No past donation records match your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="text-[11px] font-bold text-gray-400 uppercase border-b border-gray-100">
                  <tr>
                    <th className="pb-3">Food Listing</th>
                    <th className="pb-3">Quantity Donated</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Final Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {historyList.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50/50 transition">
                      <td className="py-3.5 pr-4">
                        <div className="font-bold text-gray-900">{d.title}</div>
                        <div className="text-[11px] text-gray-400">{d.category}</div>
                      </td>
                      <td className="py-3.5 font-bold text-gray-700">
                        {d.quantity} {d.unit} (~{d.estimated_servings} people)
                      </td>
                      <td className="py-3.5 text-gray-500">
                        {new Date(d.created_at).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          d.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' :
                          d.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TAB: IMPACT & ANALYTICS                                                */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
                <BarChart3 className="w-4 h-4" />
                <span>Environmental &amp; Social Impact</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Impact &amp; Analytics</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Measurable food waste prevented and meals provided to communities in need.
              </p>
            </div>

            {/* Impact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-800 uppercase block">Food Rescued</span>
                <p className="text-3xl font-black text-emerald-950 mt-1">~{Math.round(totalServingsRescued)}</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">Servings saved from landfill</p>
              </div>

              <div className="p-5 rounded-2xl bg-teal-50/80 border border-teal-200">
                <span className="text-xs font-bold text-teal-800 uppercase block">People Fed</span>
                <p className="text-3xl font-black text-teal-950 mt-1">~{Math.round(totalServingsRescued)}</p>
                <p className="text-[11px] text-teal-700 mt-0.5">Nutritious meals served</p>
              </div>

              <div className="p-5 rounded-2xl bg-blue-50/80 border border-blue-200">
                <span className="text-xs font-bold text-blue-800 uppercase block">Successful Rescues</span>
                <p className="text-3xl font-black text-blue-950 mt-1">{completedDonations.length}</p>
                <p className="text-[11px] text-blue-700 mt-0.5">Completed rescue cycles</p>
              </div>

              <div className="p-5 rounded-2xl bg-purple-50/80 border border-purple-200">
                <span className="text-xs font-bold text-purple-800 uppercase block">CO2 Prevented</span>
                <p className="text-3xl font-black text-purple-950 mt-1">~{Math.round(totalServingsRescued * 0.8)} kg</p>
                <p className="text-[11px] text-purple-700 mt-0.5">Greenhouse gas averted</p>
              </div>
            </div>

            {/* Monthly Trends & Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
              {/* Monthly Trend Bars */}
              <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
                <h3 className="font-bold text-sm text-gray-900">Monthly Donation Trends</h3>
                <div className="space-y-3">
                  {[
                    { month: 'Current Month', count: myDonations.length, pct: 100 },
                    { month: 'Last Month', count: Math.max(0, myDonations.length - 2), pct: 75 },
                    { month: '2 Months Ago', count: Math.max(0, myDonations.length - 4), pct: 50 },
                  ].map((m) => (
                    <div key={m.month} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-gray-700">
                        <span>{m.month}</span>
                        <span className="font-bold text-emerald-700">{m.count} donations</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div style={{ width: `${m.pct}%` }} className="h-full bg-emerald-500 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-4">
                <h3 className="font-bold text-sm text-gray-900">Food Category Distribution</h3>
                <div className="space-y-3">
                  {[
                    { cat: 'Cooked Meals', count: myDonations.filter((d) => d.category === 'Cooked Meals').length },
                    { cat: 'Bakery & Bread', count: myDonations.filter((d) => d.category === 'Bakery & Bread').length },
                    { cat: 'Fresh Produce', count: myDonations.filter((d) => d.category === 'Fresh Produce').length },
                    { cat: 'Packaged & Other', count: myDonations.filter((d) => !['Cooked Meals', 'Bakery & Bread', 'Fresh Produce'].includes(d.category)).length },
                  ].map((c) => {
                    const pct = myDonations.length > 0 ? Math.round((c.count / myDonations.length) * 100) : 0;
                    return (
                      <div key={c.cat} className="space-y-1">
                        <div className="flex justify-between text-xs font-medium text-gray-700">
                          <span>{c.cat}</span>
                          <span className="font-bold text-gray-900">{c.count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div style={{ width: `${pct}%` }} className="h-full bg-teal-500 rounded-full" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Certificate Badge Banner */}
            <div className="p-5 bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-2xl border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">FoodBridge Sustainability Champion</h4>
                  <p className="text-xs text-gray-500">Recognized partner in local zero-hunger and surplus food redistribution.</p>
                </div>
              </div>
              <span className="hidden sm:inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                Active Tier 1 Rescuer
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. TAB: NOTIFICATIONS                                                     */}
      {/* ========================================================================= */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
                <Bell className="w-4 h-4" />
                <span>Alerts &amp; Updates</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Platform Notifications</h2>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                New NGO food requests, courier dispatch alerts, and receipt confirmations.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setNotifFilter(notifFilter === 'ALL' ? 'UNREAD' : 'ALL')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-gray-700 text-xs font-bold rounded-xl transition"
              >
                {notifFilter === 'ALL' ? 'Show Unread Only' : 'Show All'}
              </button>
              <button
                onClick={handleMarkAllNotificationsRead}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-2xs"
              >
                Mark All as Read
              </button>
            </div>
          </div>

          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Bell className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-xs text-gray-500">No notifications to display.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`py-4 flex items-start justify-between gap-4 transition ${
                    !notif.is_read ? 'bg-emerald-50/40 px-4 rounded-xl' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      notif.notification_type === 'success' ? 'bg-emerald-100 text-emerald-800' :
                      notif.notification_type === 'warning' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{notif.title}</h4>
                      <p className="text-xs text-gray-600 mt-0.5">{notif.message}</p>
                      <span className="text-[10px] text-gray-400 mt-1 block">
                        {new Date(notif.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {!notif.is_read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 shrink-0 mt-2" title="Unread" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 9. TAB: MY PROFILE                                                        */}
      {/* ========================================================================= */}
      {activeTab === 'profile' && <DonorProfileTab />}
    </div>
  );
}
