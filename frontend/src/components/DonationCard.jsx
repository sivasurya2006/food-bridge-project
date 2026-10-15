import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Utensils, AlertCircle, CheckCircle, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const categoryImages = {
  'Cooked Meals': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  'Raw Groceries': 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
  'Bakery & Bread': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  'Fresh Produce': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
  'Dairy & Eggs': 'https://images.unsplash.com/photo-1528750997573-59b89d56f4f7?auto=format&fit=crop&w=600&q=80',
  'Packaged Foods': 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
  'Beverages': 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80',
  'Other': 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80',
};

export default function DonationCard({ donation, onRequestClick, isNGO }) {
  const { user, isNGO: authIsNGO, isAdmin } = useAuth();
  const imageUrl = donation.image_url || donation.image || categoryImages[donation.category] || categoryImages['Cooked Meals'];

  const deadline = new Date(donation.pickup_deadline);
  const now = new Date();
  const diffHours = Math.round((deadline - now) / (1000 * 60 * 60));
  const isExpired = donation.is_expired || diffHours < 0;

  const isOwner = Boolean(
    user && (user.id === donation.donor || user.username === donation.donor_username)
  );
  const isAvailable = donation.status === 'AVAILABLE' && !isExpired && donation.available_quantity > 0;
  const allowRequest = isAvailable && !isOwner && (isNGO || authIsNGO || isAdmin);

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-md transition-all flex flex-col group">
      {/* Image Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={donation.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = categoryImages[donation.category] || categoryImages['Other'];
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Category Pill */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-gray-800 shadow-xs">
          {donation.category}
        </span>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {isAvailable ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Available
            </span>
          ) : donation.status === 'COMPLETED' ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-600 text-white shadow-xs">
              Completed
            </span>
          ) : isExpired ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-gray-500 text-white shadow-xs">
              Expired
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-xs">
              Reserved
            </span>
          )}
        </div>

        {/* Quantity on image bottom */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1 font-semibold">
            <Utensils className="w-3.5 h-3.5 text-emerald-400" />
            <span>{donation.available_quantity} / {donation.quantity} {donation.unit} left</span>
          </div>
          <div className="bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs font-medium">
            ~{donation.estimated_servings} servings
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="mb-2">
          <h3 className="font-bold text-gray-900 text-base line-clamp-1 group-hover:text-emerald-600 transition-colors">
            {donation.title}
          </h3>
          <p className="text-xs text-emerald-700 font-medium mt-0.5">
            By {donation.donor_name || donation.donor_username}
          </p>
        </div>

        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
          {donation.description || 'Nutritious surplus edible food packaged hygienically and ready for collection.'}
        </p>

        {/* Metadata Details */}
        <div className="mt-auto pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="truncate">{donation.pickup_location || donation.city || 'Metro Area'}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>
                {isExpired ? 'Deadline passed' : `${diffHours > 0 ? `${diffHours}h remaining` : 'Ending soon'}`}
              </span>
            </div>
            {donation.allergen_information && (
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded truncate max-w-[120px]" title={donation.allergen_information}>
                ⚠️ {donation.allergen_information}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 pt-3 flex gap-2">
          {isOwner ? (
            <Link
              to={`/donations/${donation.id}`}
              className="flex-1 py-2 text-center text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition border border-emerald-200"
            >
              Your Listing • View Details
            </Link>
          ) : allowRequest ? (
            <>
              <Link
                to={`/donations/${donation.id}`}
                className="flex-1 py-2 text-center text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
              >
                Details
              </Link>
              <button
                onClick={() => onRequestClick(donation)}
                className="flex-1 py-2 text-center text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs cursor-pointer"
              >
                Request Food
              </button>
            </>
          ) : (
            <Link
              to={`/donations/${donation.id}`}
              className="w-full py-2 text-center text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
