import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Tag,
  Clock,
  ChevronRight,
  UtensilsCrossed,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import EmptyState from '../../components/EmptyState';

const MyCart = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const items = cart.items || [];
  const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const deliveryFee = itemsTotal > 0 ? 35 : 0;
  const platformFee = itemsTotal > 0 ? 5 : 0;
  const taxAmount = Math.round(Math.max(0, itemsTotal - discount) * 0.05);
  const finalTotal = Math.max(0, itemsTotal - discount + deliveryFee + platformFee + taxAmount);

  const handleApplyCoupon = async (codeToApply) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) {
      error('Please enter a coupon code.');
      return;
    }

    try {
      setValidatingCoupon(true);
      const res = await api.post('/coupons/validate', {
        code,
        orderAmount: itemsTotal,
      });

      if (res.data.success) {
        setDiscount(res.data.discount);
        setAppliedCoupon(code);
        setCouponCode('');
        success(`Coupon "${code}" applied! You save ₹${res.data.discount}`);
      }
    } catch (err) {
      error(err.message);
      setDiscount(0);
      setAppliedCoupon('');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon('');
    success('Coupon removed');
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Your Cart is Empty"
          description="You haven't added any fresh homemade dishes yet. Explore authentic regional meals from local home chefs!"
          actionText="Explore Homemade Dishes"
          actionLink="/explore"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to="/" className="hover:text-forest-900">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold">Shopping Cart</span>
      </nav>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
            Your Homemade Food Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Order prepared by {cart.seller?.kitchenName || 'Local Home Kitchen'}
          </p>
        </div>

        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Cart Items List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-4">
            {items.map((item) => {
              const food = item.food;
              if (!food) return null;

              const isRescue = item.isRescueItem;
              const availableStock = isRescue
                ? (food.rescueDeal?.remainingPortions ?? 0)
                : (food.freshBatch?.availablePortions ?? 20);

              return (
                <div
                  key={item._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-cream-100 last:border-b-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={food.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=200&q=80'}
                      alt={food.name}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            food.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                          }`}
                        />
                        <h4 className="text-sm font-bold text-slate-900 leading-snug">{food.name}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">₹{item.price} each</p>
                      {isRescue && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-accent-100 text-accent-700 text-[10px] font-bold">
                          Rescue Deal Item
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity adjustment & Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="flex items-center border border-slate-200 rounded-xl bg-white p-1">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-600"
                        title="Decrease"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        disabled={item.quantity >= availableStock}
                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 disabled:opacity-30"
                        title="Increase"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[70px]">
                      <span className="text-sm font-bold font-serif text-slate-900 block">
                        ₹{item.price * item.quantity}
                      </span>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-[11px] text-red-500 hover:text-red-700 font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Home Kitchen Info & FSSAI Note */}
          {cart.seller && (
            <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest-800 text-white flex items-center justify-center font-bold">
                  <UtensilsCrossed className="w-5 h-5 text-accent-400" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{cart.seller.kitchenName}</h4>
                  <p className="text-[11px] text-slate-500">{cart.seller.address?.locality || 'Bangalore'}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" /> Verified Kitchen
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Coupon & Bill Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Promo Coupon Application */}
          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-accent-600" />
              <span>Apply Discount Coupon</span>
            </h3>

            {appliedCoupon ? (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-emerald-900 block">Code: {appliedCoupon}</span>
                  <span className="text-emerald-700 text-[11px]">₹{discount} discount applied</span>
                </div>
                <button
                  onClick={removeCoupon}
                  className="font-bold text-red-600 hover:underline text-xs"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter code (e.g. SMART50)"
                  className="flex-1 px-3.5 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl uppercase font-bold focus:outline-none focus:ring-2 focus:ring-forest-800"
                />
                <button
                  type="button"
                  onClick={() => handleApplyCoupon()}
                  disabled={validatingCoupon}
                  className="px-4 py-2 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800 transition-colors"
                >
                  {validatingCoupon ? 'Checking...' : 'Apply'}
                </button>
              </div>
            )}

            {/* Quick Demo Coupons Pill */}
            {!appliedCoupon && (
              <div className="pt-2">
                <span className="text-[10px] text-slate-400 block mb-1">Available Promo Codes:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => handleApplyCoupon('SMART50')}
                    className="px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-cream-200 text-slate-800 text-[10px] font-bold"
                  >
                    SMART50 (50% Off)
                  </button>
                  <button
                    onClick={() => handleApplyCoupon('HOMELOVE')}
                    className="px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-cream-200 text-slate-800 text-[10px] font-bold"
                  >
                    HOMELOVE (₹60 Off)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bill Breakdown Summary */}
          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-4">
            <h3 className="text-base font-bold font-serif text-slate-900 border-b border-cream-100 pb-3">
              Bill Details
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Total</span>
                <span className="font-semibold text-slate-900">₹{itemsTotal}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery Partner Fee</span>
                <span className="font-semibold text-slate-900">₹{deliveryFee}</span>
              </div>

              <div className="flex justify-between">
                <span>Govt Taxes & Food Safety Cess (5%)</span>
                <span className="font-semibold text-slate-900">₹{taxAmount}</span>
              </div>

              <div className="flex justify-between">
                <span>SmartBite Platform Fee</span>
                <span className="font-semibold text-slate-900">₹{platformFee}</span>
              </div>

              <div className="border-t border-cream-200 pt-3 flex justify-between text-base font-black text-slate-900 font-serif">
                <span>To Pay</span>
                <span className="text-forest-900">₹{finalTotal}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout', { state: { appliedCoupon, discount } })}
              className="w-full py-3.5 rounded-2xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm shadow-md shadow-forest-900/15 flex items-center justify-center gap-2 transition-all mt-4"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCart;
