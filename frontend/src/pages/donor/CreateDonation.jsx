import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import {
  Utensils, PlusCircle, ArrowLeft, Image as ImageIcon,
  Clock, MapPin, AlertCircle, Sparkles, CheckCircle2
} from 'lucide-react';

const PRESET_IMAGES = [
  { label: 'Cooked Dinner Buffet', url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80', cat: 'Cooked Meals' },
  { label: 'Artisan Bakery Bread', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80', cat: 'Bakery & Bread' },
  { label: 'Farm Fresh Produce', url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80', cat: 'Fresh Produce' },
  { label: 'Sandwich & Lunch Boxes', url: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=800&q=80', cat: 'Packaged Foods' },
  { label: 'Dairy & Fresh Milk', url: 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=800&q=80', cat: 'Dairy & Eggs' },
];

export default function CreateDonation() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Calculate default deadline: 8 hours from now
  const defaultDeadline = new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 16);
  const defaultPrepared = new Date(Date.now() - 2 * 3600 * 1000).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Cooked Meals',
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
    image_url: PRESET_IMAGES[0].url,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Keep estimated servings synchronized if quantity changed
      ...(name === 'quantity' && prev.unit === 'servings' ? { estimated_servings: value } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Please provide a descriptive title for the food donation.');
      return;
    }
    if (parseInt(formData.quantity) <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.createDonation({
        ...formData,
        quantity: parseInt(formData.quantity),
        estimated_servings: parseInt(formData.estimated_servings || formData.quantity),
      });
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
            Publish surplus portions to verified NGOs. FoodBridge will automatically protect quantity reservations and coordinate volunteer pickup.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Preset image selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700">
              Select Preset Food Image or Enter Custom Image URL
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PRESET_IMAGES.map((preset) => (
                <button
                  type="button"
                  key={preset.label}
                  onClick={() => setFormData({ ...formData, image_url: preset.url, category: preset.cat })}
                  className={`p-1.5 rounded-xl border text-left transition overflow-hidden group ${
                    formData.image_url === preset.url
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/30'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-14 object-cover rounded-lg mb-1" />
                  <span className="text-[10px] font-semibold text-gray-700 line-clamp-1 block">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
            <input
              type="url"
              name="image_url"
              value={formData.image_url}
              onChange={handleChange}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-600 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-8">
              <label className="block text-xs font-bold text-gray-700 mb-1">Listing Title *</label>
              <input
                type="text"
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. 50 Gourmet Dinner Boxes (Rice, Paneer Curry & Naan)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-gray-700 mb-1">Food Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Cooked Meals">Cooked Meals</option>
                <option value="Bakery & Bread">Bakery & Bread</option>
                <option value="Fresh Produce">Fresh Produce</option>
                <option value="Dairy & Eggs">Dairy & Eggs</option>
                <option value="Packaged Foods">Packaged Foods</option>
                <option value="Raw Groceries">Raw Groceries</option>
                <option value="Beverages">Beverages</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="sm:col-span-12">
              <label className="block text-xs font-bold text-gray-700 mb-1">Description & Ingredients</label>
              <textarea
                rows="2"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe package condition, temperature when packed, portion details..."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs resize-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quantities & Servings */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200/80">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Total Quantity *</label>
              <input
                type="number"
                min="1"
                required
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Quantity Unit</label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="servings">servings</option>
                <option value="kg">kg</option>
                <option value="boxes">boxes / packs</option>
                <option value="items">items / pieces</option>
                <option value="liters">liters</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Estimated Meal Servings</label>
              <input
                type="number"
                min="1"
                name="estimated_servings"
                value={formData.estimated_servings}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>
          </div>

          {/* Schedule & Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Prepared Time</label>
              <input
                type="datetime-local"
                name="prepared_at"
                value={formData.prepared_at}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Pickup Deadline *</label>
              <input
                type="datetime-local"
                required
                name="pickup_deadline"
                value={formData.pickup_deadline}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-500 text-rose-700"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Food must be collected before this time.
              </span>
            </div>
          </div>

          {/* Pickup Location */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-6">
              <label className="block text-xs font-bold text-gray-700 mb-1">Pickup Address / Kitchen Location *</label>
              <input
                type="text"
                required
                name="pickup_location"
                value={formData.pickup_location}
                onChange={handleChange}
                placeholder="Specific loading dock or front counter instructions"
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
        </form>
      </div>
    </div>
  );
}
