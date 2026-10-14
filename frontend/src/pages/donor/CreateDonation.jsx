import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Utensils, PlusCircle, ArrowLeft, Camera,
  Clock, MapPin, AlertCircle, CheckCircle2, Trash2, Sparkles, Check
} from 'lucide-react';

export default function CreateDonation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Calculate default deadline: 8 hours from now
  const defaultDeadline = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 16);
  const defaultPrepared = new Date(Date.now() - 2 * 3600 * 1000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    quantity: 40,
    unit: 'servings',
    estimated_servings: 40,
    prepared_at: defaultPrepared,
    pickup_deadline: defaultDeadline,
    pickup_location: user?.address || '100 Grand Boulevard, Kitchen Dispatch Dock',
    city: user?.city || 'Metro City',
    pincode: user?.pincode || '560001',
    storage_instructions: 'Keep in thermal warm holding containers or consume within 4 hours.',
    allergen_information: 'Contains dairy and gluten. Nut-free.',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1 is complete when donor has entered food name AND attached a photo
  const isStep1Complete = Boolean(formData.title.trim() && previewUrl);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'quantity' && prev.unit === 'servings' ? { estimated_servings: value } : {}),
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPG, PNG, JPEG, or WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file size must be less than 10MB.');
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide a food name / title.');
      return;
    }
    if (!selectedFile && !previewUrl) {
      setError('Please upload a food photo first.');
      return;
    }
    if (parseInt(formData.quantity) <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('description', formData.description.trim());
      submitData.append('category', formData.category.trim() || 'General Food');
      submitData.append('quantity', parseInt(formData.quantity));
      submitData.append('unit', formData.unit);
      submitData.append('estimated_servings', parseInt(formData.estimated_servings || formData.quantity));
      submitData.append('prepared_at', formData.prepared_at);
      submitData.append('pickup_deadline', formData.pickup_deadline);
      submitData.append('pickup_location', formData.pickup_location);
      submitData.append('city', formData.city);
      submitData.append('pincode', formData.pincode);
      submitData.append('storage_instructions', formData.storage_instructions);
      submitData.append('allergen_information', formData.allergen_information);

      if (selectedFile) {
        submitData.append('image', selectedFile);
      } else {
        submitData.append('image_url', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80');
      }

      await api.createDonation(submitData);
      navigate('/donor/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to publish donation listing. Please review the form.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <Link
        to="/donor/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Donor Portal
      </Link>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
            <Utensils className="w-4 h-4" />
            <span>Surplus Listing Flow</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            List Surplus Edible Food
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Upload food photo and enter the food name to begin publishing surplus meals to local NGOs.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ═══════════════════════════════════════════════════════════
              STEP 1: Food Photo Upload & Food Name (Always Visible)
          ══════════════════════════════════════════════════════════════ */}
          <div className="p-5 sm:p-6 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <h3 className="font-bold text-sm text-gray-900">Food Identification</h3>
              </div>
              {isStep1Complete && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                  <Check className="w-3.5 h-3.5" /> Step 1 Complete
                </span>
              )}
            </div>

            {/* Photo Upload Dropzone */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">
                Food Photo *
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {!previewUrl ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01]'
                      : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50/20 bg-white'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs mb-3">
                    <Camera className="w-8 h-8" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-800">
                    Click to Upload or Drag &amp; Drop Food Photo
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm">
                    Take a fresh photo of the food or select an image file from your device
                  </p>
                  <div className="flex items-center gap-2 mt-3 text-[11px] font-semibold text-gray-400">
                    <span>PNG, JPG, JPEG, WEBP</span>
                    <span>•</span>
                    <span>Up to 10 MB</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-emerald-200 bg-white p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 shadow-xs">
                  <div className="w-full sm:w-40 h-32 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-xs border border-gray-200">
                    <img
                      src={previewUrl}
                      alt="Food Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-left space-y-1 w-full">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Food Photo Attached</span>
                    </div>
                    <p className="text-xs font-bold text-gray-900 truncate max-w-xs sm:max-w-md">
                      {selectedFile?.name || 'Uploaded food photo'}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready` : 'Ready'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-200"
                    >
                      Change Photo
                    </button>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Food Name / Listing Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Food Name / Title *
              </label>
              <input
                type="text"
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. 50 Packs of South Indian Veg Meals (Rice, Sambar, Poriyal)"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Mention the dish name and what food items are included.
              </p>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
              HELPER: Shown until Photo + Food Name are entered
          ══════════════════════════════════════════════════════════════ */}
          {!isStep1Complete && (
            <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-amber-900">Unlock Portion &amp; Delivery Details</h5>
                <p className="text-amber-800 text-[11px] mt-0.5 leading-relaxed">
                  Please <strong>upload a food photo</strong> and type the <strong>food name</strong> above. The remaining portion, category, and dispatch fields will appear automatically!
                </p>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              STEP 2: Portion, Category & Dispatch Details
              (Revealed ONLY after Step 1 is filled)
          ══════════════════════════════════════════════════════════════ */}
          {isStep1Complete && (
            <div className="space-y-6 pt-2 animate-fadeIn">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <h3 className="font-bold text-sm text-gray-900">Portions, Category &amp; Pickup Details</h3>
              </div>

              {/* Food Category (Free text input — no restricted dropdown options) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Food Category / Cuisine *
                </label>
                <input
                  type="text"
                  required
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. South Indian Meals, Biryani, North Indian, Bakery &amp; Bread, Sweets, Snacks..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                <p className="text-[11px] text-gray-400 mt-1">
                  Type any category or cuisine freely (e.g. South Indian, North Indian, Buffet, Snacks, etc.)
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description &amp; Ingredients</label>
                <textarea
                  name="description"
                  rows={2}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe package condition, temperature when packed, portion details..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Metrics & Servings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Quantity *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Portion Unit *</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="servings">Individual Servings (plates)</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="boxes">Boxes / Trays</option>
                    <option value="packets">Packets</option>
                    <option value="liters">Liters</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Estimated Meal Count</label>
                  <input
                    type="number"
                    min="1"
                    name="estimated_servings"
                    value={formData.estimated_servings}
                    onChange={handleChange}
                    placeholder="40"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Time Bounds */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Food Prepared / Packed At</label>
                  <input
                    type="datetime-local"
                    name="prepared_at"
                    value={formData.prepared_at}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Strict Pickup Deadline (Safe Consumption Expiry) *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    name="pickup_deadline"
                    value={formData.pickup_deadline}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Location Dispatch */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pickup Dispatch Address *</label>
                  <input
                    type="text"
                    required
                    name="pickup_location"
                    value={formData.pickup_location}
                    onChange={handleChange}
                    placeholder="Street address, building floor, or back dock dispatch"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Safety & Allergens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Storage Instructions</label>
                  <input
                    type="text"
                    name="storage_instructions"
                    value={formData.storage_instructions}
                    onChange={handleChange}
                    placeholder="e.g. Keep warm / refrigerate below 4°C"
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Allergen Information</label>
                  <input
                    type="text"
                    name="allergen_information"
                    value={formData.allergen_information}
                    onChange={handleChange}
                    placeholder="e.g. Contains Milk, Wheat. Nut-free."
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Action Row */}
              <div className="pt-4 flex gap-3">
                <Link
                  to="/donor/dashboard"
                  className="py-3 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  {loading ? 'Publishing Food Listing...' : 'Publish Surplus Food Donation'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
