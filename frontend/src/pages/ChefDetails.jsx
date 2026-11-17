import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  UtensilsCrossed,
  ChefHat,
  Award,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import FoodCard from '../components/FoodCard';
import { FoodCardSkeleton } from '../components/LoadingSkeleton';

const ChefDetails = () => {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [foods, setFoods] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChef = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/sellers/${id}`);
        if (res.data.success) {
          setSeller(res.data.seller);
          setFoods(res.data.foods);
          setReviews(res.data.reviews);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChef();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-forest-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading home chef kitchen...</p>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold font-serif mb-2">Kitchen Not Found</h2>
        <Link to="/chefs" className="px-6 py-2.5 rounded-full bg-forest-900 text-white font-bold text-sm">
          Browse Other Kitchens
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to="/" className="hover:text-forest-900">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/chefs" className="hover:text-forest-900">Home Chefs</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 truncate font-semibold">{seller.kitchenName}</span>
      </nav>

      {/* Banner & Kitchen Hero Header */}
      <div className="bg-white rounded-3xl overflow-hidden shadow-soft border border-cream-200">
        <div className="h-48 sm:h-64 relative bg-forest-900">
          <img
            src={seller.banner || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80'}
            alt={seller.kitchenName}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute top-4 right-4">
            <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold shadow-md backdrop-blur-md ${
              seller.isKitchenOpen ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}>
              {seller.isKitchenOpen ? 'Open for Orders' : 'Closed for Today'}
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-8 pt-0 relative">
          <div className="-mt-14 sm:-mt-16 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <img
                  src={seller.logo || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=200&q=80'}
                  alt={seller.kitchenName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-white shadow-xl bg-white"
                />
                {seller.verificationStatus === 'approved' && (
                  <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1.5 rounded-full shadow-md" title="Verified Home Kitchen">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
                    {seller.kitchenName}
                  </h1>
                </div>
                <p className="text-xs font-bold text-accent-600 mt-0.5">{seller.tagline}</p>
              </div>
            </div>

            {/* Rating Box */}
            <div className="flex items-center gap-2 bg-cream-100 px-4 py-2 rounded-2xl shrink-0">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <div>
                <span className="text-sm font-black text-slate-900">{seller.rating || '4.9'}</span>
                <span className="text-xs text-slate-500 block">({seller.numReviews || 0} reviews)</span>
              </div>
            </div>
          </div>

          {/* Bio & Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-cream-100 text-xs text-slate-600">
            <div className="md:col-span-2 space-y-2">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Chef's Story</h4>
              <p className="leading-relaxed text-sm text-slate-600">{seller.bio}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {seller.cuisines?.map((c, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-cream-100 text-slate-800 font-semibold">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3 bg-cream-50 p-4 rounded-2xl border border-cream-200">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Kitchen Information</h4>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-forest-800 shrink-0" />
                <span>{seller.address?.street}, {seller.address?.locality}, {seller.address?.city} - {seller.address?.pincode}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-forest-800 shrink-0" />
                <span>Operating: {seller.operatingHours?.open} - {seller.operatingHours?.close}</span>
              </p>
              {seller.fssaiNumber && (
                <p className="flex items-center gap-2 text-emerald-800 font-semibold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>FSSAI Reg: {seller.fssaiNumber}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Dishes Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 font-serif">Today's Kitchen Menu</h2>
            <p className="text-xs text-slate-500">Fresh dishes prepared in limited batches by this home chef</p>
          </div>
        </div>

        {foods.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl text-center border border-cream-200">
            <p className="text-sm text-slate-500">No active dishes published currently by this kitchen.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {foods.map((food) => (
              <FoodCard key={food._id} food={food} showChef={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChefDetails;
