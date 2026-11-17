import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  CreditCard,
  Truck,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Plus,
  ChevronRight,
  Clock,
} from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const { user } = useAuth();
  const { success, error, info } = useToast();

  const couponCode = location.state?.appliedCoupon || '';
  const initialDiscount = location.state?.discount || 0;

  const [orderType, setOrderType] = useState('delivery'); // 'delivery' or 'pickup'
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('simulated_upi');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  // New address form inline
  const [isAddingNewAddr, setIsAddingNewAddr] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newLocality, setNewLocality] = useState('');
  const [newPincode, setNewPincode] = useState('560103');

  const items = cart.items || [];
  const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const deliveryFee = orderType === 'delivery' ? 35 : 0;
  const platformFee = 5;
  const taxAmount = Math.round(Math.max(0, itemsTotal - initialDiscount) * 0.05);
  const totalAmount = Math.max(0, itemsTotal - initialDiscount + deliveryFee + platformFee + taxAmount);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const res = await api.get('/users/addresses');
        if (res.data.success && res.data.addresses.length > 0) {
          setAddresses(res.data.addresses);
          const defaultAddr = res.data.addresses.find((a) => a.isDefault) || res.data.addresses[0];
          setSelectedAddressId(defaultAddr._id);
        } else {
          setIsAddingNewAddr(true);
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadAddresses();
  }, []);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      error('Your cart is empty.');
      navigate('/cart');
      return;
    }

    let deliveryAddress = null;
    if (orderType === 'delivery') {
      if (isAddingNewAddr) {
        if (!newStreet || !newLocality || !newPincode) {
          error('Please complete the delivery address details.');
          return;
        }
        deliveryAddress = {
          street: newStreet,
          locality: newLocality,
          city: 'Bangalore',
          pincode: newPincode,
          phone: user?.phone || '9876543210',
          instructions: deliveryInstructions,
        };
      } else {
        const chosen = addresses.find((a) => a._id === selectedAddressId);
        if (!chosen) {
          error('Please select a delivery address.');
          return;
        }
        deliveryAddress = {
          street: chosen.street,
          locality: chosen.locality,
          city: chosen.city,
          pincode: chosen.pincode,
          phone: chosen.phone,
          instructions: deliveryInstructions,
        };
      }
    }

    try {
      setLoading(true);

      // 1. Create order on backend (server calculates prices, checks & decrements FreshBatch portions)
      const orderRes = await api.post('/orders', {
        orderType,
        deliveryAddress,
        paymentMethod,
        couponCode,
      });

      if (!orderRes.data.success) {
        error(orderRes.data.message);
        return;
      }

      const createdOrder = orderRes.data.order;

      // 2. Handle Payment Flow
      if (paymentMethod === 'razorpay') {
        const razorRes = await api.post('/payments/razorpay/create-order', {
          orderId: createdOrder._id,
        });

        if (razorRes.data.useSimulated) {
          // Razorpay placeholder fallback -> process simulated payment
          info('Razorpay keys in test mode. Completing demonstration payment...');
          await api.post('/payments/simulated', {
            orderId: createdOrder._id,
            method: 'simulated_upi',
          });
        }
      } else if (paymentMethod.startsWith('simulated')) {
        await api.post('/payments/simulated', {
          orderId: createdOrder._id,
          method: paymentMethod,
        });
      }

      // Refresh cart context
      await fetchCart();

      success('Order placed successfully! Fresh batch cooking in progress.');
      navigate(`/order-tracking/${createdOrder._id}`);
    } catch (err) {
      error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to="/cart" className="hover:text-forest-900">Cart</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold">Checkout</span>
      </nav>

      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">Checkout & Delivery</h1>
        <p className="text-xs text-slate-500">Confirm your delivery details and choose a payment method</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Address, Order Type & Payment Options */}
        <div className="lg:col-span-7 space-y-6">
          {/* Order Type Toggle: Delivery vs Pickup */}
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Delivery Preference</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  orderType === 'delivery'
                    ? 'border-forest-900 bg-forest-50/50 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Truck className={`w-5 h-5 ${orderType === 'delivery' ? 'text-forest-900' : 'text-slate-400'}`} />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Home Delivery</h4>
                  <p className="text-[11px] text-slate-500">Delivered warm to your doorstep (₹35)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                  orderType === 'pickup'
                    ? 'border-forest-900 bg-forest-50/50 shadow-sm'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ShoppingBag className={`w-5 h-5 ${orderType === 'pickup' ? 'text-forest-900' : 'text-slate-400'}`} />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Self Pickup</h4>
                  <p className="text-[11px] text-slate-500">Pickup directly from kitchen (Free)</p>
                </div>
              </button>
            </div>
          </div>

          {/* Delivery Address Section (if delivery selected) */}
          {orderType === 'delivery' && (
            <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-forest-800" />
                  <span>Delivery Address</span>
                </h3>
                {addresses.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsAddingNewAddr(!isAddingNewAddr)}
                    className="text-xs font-bold text-forest-800 hover:underline"
                  >
                    {isAddingNewAddr ? 'Choose Saved' : '+ New Address'}
                  </button>
                )}
              </div>

              {!isAddingNewAddr && addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id}
                      className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedAddressId === addr._id
                          ? 'border-forest-900 bg-forest-50/30 ring-1 ring-forest-900'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="addressRadio"
                          value={addr._id}
                          checked={selectedAddressId === addr._id}
                          onChange={() => setSelectedAddressId(addr._id)}
                          className="mt-1 text-forest-900 accent-forest-900"
                        />
                        <div className="min-w-0 flex-1 text-xs">
                          <span className="font-bold text-slate-900">{addr.recipientName} ({addr.label})</span>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">
                            {addr.street}, {addr.locality}, {addr.city} - {addr.pincode}
                          </p>
                          <p className="text-slate-400 mt-0.5">Phone: {addr.phone}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800">Enter Delivery Address</h4>
                  <input
                    type="text"
                    required
                    placeholder="House/Flat number, Building name, Street"
                    value={newStreet}
                    onChange={(e) => setNewStreet(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Locality / Area"
                      value={newLocality}
                      onChange={(e) => setNewLocality(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Pincode"
                      value={newPincode}
                      onChange={(e) => setNewPincode(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-cream-300 rounded-xl"
                    />
                  </div>
                </div>
              )}

              {/* Delivery instructions */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Delivery Notes / Instructions for Chef & Courier
                </label>
                <input
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Ring bell, leave package at door, extra cutlery please"
                  className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-200 rounded-xl"
                />
              </div>
            </div>
          )}

          {/* Payment Method Selection */}
          <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-forest-800" />
              <span>Select Payment Method</span>
            </h3>

            <div className="space-y-3">
              {/* Simulated UPI (Recommended for instant testing) */}
              <label
                className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'simulated_upi'
                    ? 'border-forest-900 bg-forest-50/40 ring-1 ring-forest-900'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="paymentOption"
                      value="simulated_upi"
                      checked={paymentMethod === 'simulated_upi'}
                      onChange={() => setPaymentMethod('simulated_upi')}
                      className="text-forest-900 accent-forest-900"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        Instant Simulated UPI (GPay / PhonePe / Paytm)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        1-Click Instant Demo Payment for Testing
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-forest-100 text-forest-800">
                    Recommended
                  </span>
                </div>
              </label>

              {/* Simulated Card */}
              <label
                className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'simulated_card'
                    ? 'border-forest-900 bg-forest-50/40 ring-1 ring-forest-900'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="simulated_card"
                    checked={paymentMethod === 'simulated_card'}
                    onChange={() => setPaymentMethod('simulated_card')}
                    className="text-forest-900 accent-forest-900"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Simulated Debit / Credit Card
                    </span>
                    <span className="text-[11px] text-slate-500">Zero charges demo authorization</span>
                  </div>
                </div>
              </label>

              {/* Razorpay Test Mode */}
              <label
                className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-forest-900 bg-forest-50/40 ring-1 ring-forest-900'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => setPaymentMethod('razorpay')}
                    className="text-forest-900 accent-forest-900"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Razorpay Test Mode Integration
                    </span>
                    <span className="text-[11px] text-slate-500">Full gateway test sandbox</span>
                  </div>
                </div>
              </label>

              {/* COD */}
              <label
                className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-forest-900 bg-forest-50/40 ring-1 ring-forest-900'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="paymentOption"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-forest-900 accent-forest-900"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[11px] text-slate-500">Pay cash upon meal arrival</span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft space-y-4">
            <h3 className="text-base font-bold font-serif text-slate-900 border-b border-cream-100 pb-3">
              Order Summary
            </h3>

            {/* Dishes list */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item._id} className="flex items-center justify-between text-xs">
                  <span className="text-slate-800 font-medium truncate max-w-[200px]">
                    {item.food?.name} <span className="text-slate-400">x{item.quantity}</span>
                  </span>
                  <span className="font-bold text-slate-900 font-serif">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-cream-200 pt-3 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{itemsTotal}</span>
              </div>
              {initialDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount ({couponCode})</span>
                  <span>-₹{initialDiscount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (5%)</span>
                <span>₹{taxAmount}</span>
              </div>

              <div className="border-t border-cream-200 pt-3 flex justify-between text-lg font-black text-slate-900 font-serif">
                <span>Total Amount</span>
                <span className="text-forest-900">₹{totalAmount}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm shadow-lg shadow-forest-900/20 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Place Order • ₹{totalAmount}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
