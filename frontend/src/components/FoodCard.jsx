import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, ShieldCheck, Flame, Plus, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

const FoodCard = ({ food, showChef = true }) => {
  const { addToCart, cart } = useCart();

  const isRescue = food.rescueDeal && food.rescueDeal.active && food.rescueDeal.remainingPortions > 0;
  const availableStock = isRescue
    ? food.rescueDeal.remainingPortions
    : food.freshBatch?.availablePortions ?? 0;

  const isSoldOut = availableStock <= 0;

  // Check if item already in cart
  const cartItem = cart.items?.find((item) => item.food?._id === food._id || item.food === food._id);
  const cartQty = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isSoldOut) {
      addToCart(food._id, 1, isRescue);
    }
  };

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-all duration-300 border border-cream-200/90 flex flex-col group food-card-hover">
      {/* Food Image Container */}
      <Link to={`/food/${food._id}`} className="relative h-48 sm:h-52 overflow-hidden block">
        <img
          src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Veg / Non-Veg Indicator */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 border border-white">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              food.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
            }`}
          />
          <span className="text-[11px] font-bold text-slate-800">
            {food.isVeg ? 'Pure Veg' : 'Non-Veg'}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-white flex items-center gap-1 shadow-sm">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-bold">{food.rating || '4.8'}</span>
          <span className="text-[10px] text-slate-300">({food.numReviews || 0})</span>
        </div>

        {/* FEATURE 3: Rescue Deal Ribbon */}
        {isRescue && (
          <div className="absolute bottom-3 left-3 bg-gradient-to-r from-accent-600 to-amber-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 animate-bounce" />
            <span>RESCUE DEAL: {food.rescueDeal.remainingPortions} left</span>
          </div>
        )}

        {/* Prep Time */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-700 flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{food.preparationTime || 25} mins</span>
        </div>
      </Link>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Kitchen Name with Verified Badge */}
          {showChef && food.seller && (
            <Link
              to={`/chefs/${food.seller._id || food.seller}`}
              className="flex items-center gap-1 text-xs font-semibold text-forest-800 hover:text-forest-950 mb-1.5 truncate"
            >
              <span className="truncate">{food.seller.kitchenName || food.kitchenName}</span>
              {food.seller.verificationStatus === 'approved' && (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" title="Verified Home Kitchen" />
              )}
            </Link>
          )}

          {/* Dish Name */}
          <Link to={`/food/${food._id}`} className="block">
            <h3 className="font-bold text-slate-900 text-base leading-snug hover:text-forest-800 transition-colors line-clamp-1">
              {food.name}
            </h3>
          </Link>

          {/* Description snippet */}
          <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
            {food.description}
          </p>

          {/* FEATURE 1: FreshBatch Availability Bar */}
          <div className="mt-3 pt-3 border-t border-cream-100">
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="font-semibold text-slate-600 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-forest-600"></span>
                FreshBatch:
              </span>
              <span className={`font-bold ${isSoldOut ? 'text-rose-600' : 'text-forest-800'}`}>
                {isSoldOut ? 'Sold Out Today' : `${availableStock} portions available`}
              </span>
            </div>
            <div className="w-full bg-cream-200/80 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isSoldOut
                    ? 'bg-rose-500 w-full'
                    : 'bg-forest-700'
                }`}
                style={{
                  width: isSoldOut
                    ? '100%'
                    : `${Math.min(100, (availableStock / (food.freshBatch?.totalPortions || 20)) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Price & Add to Cart Button */}
        <div className="flex items-center justify-between mt-4 pt-2">
          <div>
            <span className="text-xs text-slate-400 block font-medium">Price</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-black text-slate-900 font-serif">
                ₹{isRescue ? food.rescueDeal.discountedPrice : food.price}
              </span>
              {isRescue && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{food.rescueDeal.originalPrice || food.price}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAdd}
            disabled={isSoldOut}
            className={`px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              isSoldOut
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : cartQty > 0
                ? 'bg-forest-900 text-white hover:bg-forest-800'
                : 'bg-forest-900 text-white hover:bg-forest-800 hover:shadow-md'
            }`}
          >
            {isSoldOut ? (
              'Sold Out'
            ) : cartQty > 0 ? (
              <>
                <Check className="w-3.5 h-3.5 text-accent-400" />
                <span>Added ({cartQty})</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
