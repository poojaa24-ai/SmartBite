import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShieldCheck, MapPin, Clock, ArrowRight } from 'lucide-react';

const ChefCard = ({ seller }) => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-cream-200 flex flex-col group food-card-hover">
      {/* Banner */}
      <div className="relative h-36 bg-forest-900 overflow-hidden">
        <img
          src={seller.banner || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80'}
          alt={seller.kitchenName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          loading="lazy"
        />

        {/* Kitchen Open/Close Status */}
        <div className="absolute top-3 right-3">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-bold shadow-md backdrop-blur-md ${
              seller.isKitchenOpen
                ? 'bg-emerald-500/90 text-white'
                : 'bg-rose-500/90 text-white'
            }`}
          >
            {seller.isKitchenOpen ? 'Open for Orders' : 'Closed for Today'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pb-5 pt-0 flex-1 flex flex-col justify-between relative">
        {/* Floating Avatar Logo */}
        <div className="-mt-10 mb-3 flex items-end justify-between">
          <div className="relative">
            <img
              src={seller.logo || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80'}
              alt={seller.kitchenName}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
            />
            {seller.verificationStatus === 'approved' && (
              <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full shadow-md" title="FSSAI & Hygiene Verified Kitchen">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1.5 bg-cream-100 px-3 py-1 rounded-full text-slate-800 text-xs font-bold">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{seller.rating || '4.9'}</span>
            <span className="text-slate-400 font-normal">({seller.numReviews || 0})</span>
          </div>
        </div>

        {/* Kitchen Info */}
        <div>
          <div className="flex items-center gap-1.5">
            <h3 className="font-bold text-slate-900 text-lg leading-tight hover:text-forest-800 transition-colors">
              <Link to={`/chefs/${seller._id}`}>{seller.kitchenName}</Link>
            </h3>
          </div>

          <p className="text-xs font-semibold text-accent-600 mt-1">
            {seller.tagline || 'Homestyle authentic recipes'}
          </p>

          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {seller.bio}
          </p>

          {/* Location & Hours */}
          <div className="mt-3 space-y-1 text-xs text-slate-600">
            <p className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-forest-700 shrink-0" />
              <span className="truncate">{seller.address?.locality || 'Jayanagar'}, {seller.address?.city || 'Bangalore'}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-forest-700 shrink-0" />
              <span>{seller.operatingHours?.open || '08:00 AM'} - {seller.operatingHours?.close || '09:00 PM'}</span>
            </p>
          </div>

          {/* Cuisines Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-cream-100">
            {seller.cuisines?.slice(0, 3).map((cuisine, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg bg-cream-100 text-slate-700 text-[11px] font-medium"
              >
                {cuisine}
              </span>
            ))}
          </div>
        </div>

        {/* View Menu CTA */}
        <div className="mt-5 pt-3">
          <Link
            to={`/chefs/${seller._id}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-forest-900/10 hover:bg-forest-900 text-forest-900 hover:text-white font-bold text-xs transition-all duration-200"
          >
            <span>Explore Kitchen Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ChefCard;
