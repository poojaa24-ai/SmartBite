import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Clock,
  ShieldCheck,
  Flame,
  Plus,
  Minus,
  Check,
  AlertTriangle,
  Heart,
  Share2,
  Utensils,
  ChevronRight,
  Info,
} from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const FoodDetails = () => {
  const { id } = useParams();
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const [food, setFood] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [instructions, setInstructions] = useState('');
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchDish = async () => {
      try {
        setLoading(true);
        const [foodRes, revRes] = await Promise.all([
          api.get(`/foods/${id}`),
          api.get(`/reviews/food/${id}`),
        ]);

        if (foodRes.data.success) {
          setFood(foodRes.data.food);
        }
        if (revRes.data.success) {
          setReviews(revRes.data.reviews);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDish();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-forest-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-medium text-slate-500">Loading homemade dish details...</p>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold font-serif mb-2">Dish Not Found</h2>
        <p className="text-sm text-slate-500 mb-6">This homemade dish may have been unlisted or removed.</p>
        <Link to="/explore" className="px-6 py-2.5 rounded-full bg-forest-900 text-white font-bold text-sm">
          Explore Other Dishes
        </Link>
      </div>
    );
  }

  const isRescue = food.rescueDeal && food.rescueDeal.active && food.rescueDeal.remainingPortions > 0;
  const availableStock = isRescue
    ? food.rescueDeal.remainingPortions
    : food.freshBatch?.availablePortions ?? 0;

  const isSoldOut = availableStock <= 0;
  const effectivePrice = isRescue ? food.rescueDeal.discountedPrice : food.price;

  const handleAddToCart = async () => {
    if (isSoldOut) return;
    if (quantity > availableStock) {
      error(`Cannot order more than ${availableStock} available portions.`);
      return;
    }
    await addToCart(food._id, quantity, isRescue, instructions);
  };

  const handleToggleFavorite = async () => {
    if (!user) {
      info('Please sign in to save dishes to your favorites.');
      return;
    }
    try {
      const res = await api.post(`/users/favorites/${food._id}`);
      if (res.data.success) {
        setIsFavorited(res.data.isFavorited);
        success(res.data.message);
      }
    } catch (e) {
      error(e.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to="/" className="hover:text-forest-900">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/explore" className="hover:text-forest-900">Explore Food</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 truncate font-semibold">{food.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative rounded-3xl overflow-hidden shadow-soft border border-cream-200 aspect-[4/3] bg-cream-100">
            <img
              src={food.image}
              alt={food.name}
              className="w-full h-full object-cover"
            />

            {/* Veg / Non-Veg Badge */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full shadow-md flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${food.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
              <span className="text-xs font-bold text-slate-900">{food.isVeg ? 'Pure Veg' : 'Non-Veg'}</span>
            </div>

            {/* Rescue Deal Banner */}
            {isRescue && (
              <div className="absolute bottom-4 left-4 bg-gradient-to-r from-accent-600 to-amber-600 text-white text-xs font-extrabold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
                <Flame className="w-4 h-4 animate-bounce" />
                <span>RESCUE DEAL: {food.rescueDeal.remainingPortions} portions left at ₹{food.rescueDeal.discountedPrice}!</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pricing, FreshBatch & Ordering */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header */}
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-accent-600">
                {food.category?.name || food.categoryName}
              </span>
              <button
                onClick={handleToggleFavorite}
                className="p-2 rounded-full bg-cream-100 hover:bg-cream-200 text-rose-500 transition-colors"
                title="Add to Favorites"
              >
                <Heart className={`w-5 h-5 ${isFavorited ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif leading-tight">
              {food.name}
            </h1>

            {/* Rating pill */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-slate-800 text-xs font-bold">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{food.rating || '4.8'}</span>
                <span className="text-slate-400 font-normal">({food.numReviews || 0} reviews)</span>
              </div>
              <span className="text-xs text-slate-400">•</span>
              <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{food.preparationTime || 25} mins prep</span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 rounded-2xl bg-cream-100/70 border border-cream-200 flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Price per Portion</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-black text-slate-900 font-serif">
                  ₹{effectivePrice}
                </span>
                {isRescue && (
                  <span className="text-sm text-slate-400 line-through">
                    ₹{food.rescueDeal.originalPrice || food.price}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right text-xs text-slate-500">
              <span className="block font-semibold text-slate-700">{food.servingSize || '1 Portion'}</span>
              <span>{food.calories || 350} kcal approx</span>
            </div>
          </div>

          {/* FEATURE 1: FreshBatch Availability Meter */}
          <div className="p-5 rounded-3xl bg-white border border-forest-900/20 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-forest-600 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-forest-950 font-serif">
                  FreshBatch™ Daily Availability
                </span>
              </div>
              <span className={`text-xs font-extrabold ${isSoldOut ? 'text-rose-600' : 'text-forest-800'}`}>
                {isSoldOut ? 'Sold Out' : `${availableStock} Left`}
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Home chefs cook limited batches daily to preserve hygiene and home taste. Once sold out, no more portions can be prepared today.
            </p>

            {/* Progress bar */}
            <div className="w-full bg-cream-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isSoldOut ? 'bg-rose-500' : 'bg-forest-700'}`}
                style={{
                  width: `${Math.min(100, (availableStock / (food.freshBatch?.totalPortions || 20)) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Quantity selector & Add to Cart */}
          <div className="space-y-4 pt-2">
            {!isSoldOut && (
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-300 rounded-2xl bg-white p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-1.5 rounded-xl hover:bg-slate-100 disabled:opacity-40 text-slate-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center text-sm font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                    disabled={quantity >= availableStock}
                    className="p-1.5 rounded-xl hover:bg-slate-100 disabled:opacity-40 text-slate-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-slate-400">Max {availableStock} portions</span>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={isSoldOut}
              className={`w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                isSoldOut
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-forest-900 hover:bg-forest-800 text-white shadow-forest-900/20 hover:shadow-xl'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span>{isSoldOut ? 'Sold Out For Today' : `Add ${quantity} to Cart • ₹${effectivePrice * quantity}`}</span>
            </button>
          </div>

          {/* Home Chef Info Card */}
          {food.seller && (
            <div className="p-4 rounded-2xl bg-white border border-cream-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={food.seller.logo || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80'}
                  alt={food.seller.kitchenName}
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900">{food.seller.kitchenName}</h4>
                    {food.seller.verificationStatus === 'approved' && (
                      <ShieldCheck className="w-4 h-4 text-emerald-600" title="Verified Home Kitchen" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{food.seller.address?.locality || 'Bangalore'}</p>
                </div>
              </div>

              <Link
                to={`/chefs/${food.seller._id}`}
                className="px-4 py-2 rounded-xl bg-cream-100 hover:bg-cream-200 text-forest-900 text-xs font-bold transition-colors"
              >
                View Kitchen
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tabs: Description, Ingredients & Allergens, Customer Reviews */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-200 shadow-soft space-y-10">
        {/* Description & Story */}
        <div>
          <h3 className="text-xl font-bold font-serif text-slate-900 mb-3">About this Homemade Recipe</h3>
          <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
            {food.description}
          </p>
        </div>

        {/* Ingredients & Allergens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-cream-200">
          <div>
            <h4 className="text-base font-bold font-serif text-slate-900 mb-3 flex items-center gap-2">
              <Utensils className="w-4 h-4 text-forest-800" />
              <span>Authentic Ingredients</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {food.ingredients?.map((ing, i) => (
                <span key={i} className="px-3 py-1 bg-cream-100 rounded-xl text-xs font-medium text-slate-700">
                  {ing}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-base font-bold font-serif text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Allergen Transparency</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {food.allergens && food.allergens.length > 0 ? (
                food.allergens.map((alg, i) => (
                  <span key={i} className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold">
                    Contains: {alg}
                  </span>
                ))
              ) : (
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
                  No Common Allergens Disclosed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Customer Reviews & Feedback */}
        <div className="pt-6 border-t border-cream-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold font-serif text-slate-900">
              Customer Reviews ({reviews.length})
            </h3>
          </div>

          {reviews.length === 0 ? (
            <p className="text-xs text-slate-500">No reviews yet for this dish. Be the first to order and review!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="p-4 rounded-2xl bg-cream-50/60 border border-cream-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={rev.customer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                        alt={rev.customer?.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold text-slate-900">{rev.customer?.name}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  {rev.chefReply?.reply && (
                    <div className="mt-2 ml-4 p-2.5 rounded-xl bg-white border border-forest-100 text-xs text-forest-900">
                      <span className="font-bold block text-forest-950">Chef Reply:</span>
                      <span>{rev.chefReply.reply}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodDetails;
