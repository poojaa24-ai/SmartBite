import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  ChefHat,
  Truck,
  MapPin,
  Phone,
  ShieldCheck,
  AlertCircle,
  XCircle,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';

const steps = [
  { key: 'placed', label: 'Order Placed', desc: 'Received by SmartBite' },
  { key: 'confirmed', label: 'Kitchen Accepted', desc: 'Home chef confirmed your batch' },
  { key: 'preparing', label: 'Cooking Fresh', desc: 'Homestyle cooking in progress' },
  { key: 'ready', label: 'Packed & Ready', desc: 'Packed in hygienic insulated bag' },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Delivery partner on the way' },
  { key: 'delivered', label: 'Delivered', desc: 'Enjoy your homemade happiness!' },
];

const OrderTracking = () => {
  const { id } = useParams();
  const { joinOrderRoom, socket } = useSocket();
  const { success, error, info } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    joinOrderRoom(id);

    // Socket.io real-time listener for status update
    if (socket) {
      socket.on('order:status_update', (data) => {
        if (data.orderId === id) {
          info(`Order status updated to: ${data.orderStatus.replace(/_/g, ' ')}!`);
          fetchOrder();
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('order:status_update');
      }
    };
  }, [id, socket]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancelling(true);
      const res = await api.put(`/orders/${id}/cancel`, {
        reason: 'Customer requested cancellation',
      });
      if (res.data.success) {
        setOrder(res.data.order);
        success('Order cancelled and FreshBatch portions have been restored.');
      }
    } catch (err) {
      error(err.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-forest-800 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-slate-500 font-medium">Connecting to live order tracking...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold font-serif mb-2">Order Not Found</h2>
        <Link to="/my-orders" className="px-6 py-2.5 rounded-full bg-forest-900 text-white font-bold text-xs">
          View All Orders
        </Link>
      </div>
    );
  }

  const isCancelled = order.orderStatus === 'cancelled';
  const currentStepIndex = steps.findIndex((s) => s.key === order.orderStatus);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to="/my-orders" className="hover:text-forest-900">My Orders</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-900 font-semibold">Track #{order.orderNumber}</span>
      </nav>

      {/* Header status bar */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">ORDER NO:</span>
            <span className="text-sm font-black text-slate-900">{order.orderNumber}</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-forest-100 text-forest-900">
              {order.orderType}
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 font-serif mt-1">
            {isCancelled ? (
              <span className="text-red-600">Order Cancelled</span>
            ) : order.orderStatus === 'delivered' ? (
              <span className="text-emerald-700">Order Delivered! Enjoy your meal</span>
            ) : (
              <span>Your Homemade Meal is in Progress</span>
            )}
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Ordered on {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Cancellation button (if still placed) */}
        {order.orderStatus === 'placed' && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="px-4 py-2 rounded-xl border border-red-300 text-red-600 font-bold text-xs hover:bg-red-50 transition-colors shrink-0"
          >
            {cancelling ? 'Cancelling...' : 'Cancel Order'}
          </button>
        )}
      </div>

      {/* Visual Live Stepper */}
      {!isCancelled ? (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Live Order Status Timeline
          </h3>

          <div className="relative">
            {/* Desktop Stepper */}
            <div className="hidden sm:grid sm:grid-cols-6 gap-2 text-center">
              {steps.map((st, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={st.key} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs mb-2 transition-all ${
                        isCurrent
                          ? 'bg-forest-900 text-white ring-4 ring-forest-700/20 shadow-md'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : idx + 1}
                    </div>
                    <span className={`text-xs font-bold leading-tight ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                      {st.label}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">{st.desc}</span>
                  </div>
                );
              })}
            </div>

            {/* Mobile Vertical Stepper */}
            <div className="sm:hidden space-y-4">
              {steps.map((st, idx) => {
                const isCompleted = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={st.key} className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 font-bold ${
                        isCurrent
                          ? 'bg-forest-900 text-white'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold ${isCompleted ? 'text-slate-900' : 'text-slate-400'}`}>
                        {st.label}
                      </h4>
                      <p className="text-[11px] text-slate-500">{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-red-50 p-6 rounded-3xl border border-red-200 text-center space-y-2">
          <XCircle className="w-8 h-8 text-red-600 mx-auto" />
          <h4 className="text-base font-bold text-red-950 font-serif">Order Was Cancelled</h4>
          <p className="text-xs text-red-700">Reason: {order.cancellationReason || 'Cancelled by user'}</p>
          <p className="text-[11px] text-red-600">Any charges paid via online payment have been initiated for refund.</p>
        </div>
      )}

      {/* Grid: Kitchen Details & Items Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kitchen Info */}
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Home Chef Kitchen</h3>
          <div className="flex items-center gap-3">
            <img
              src={order.seller?.logo || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80'}
              alt={order.seller?.kitchenName}
              className="w-14 h-14 rounded-2xl object-cover shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-base font-bold text-slate-900 font-serif">{order.seller?.kitchenName}</h4>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-slate-500">{order.seller?.address?.locality || 'Bangalore'}</p>
              <p className="text-xs text-forest-800 font-semibold mt-0.5">Phone: {order.seller?.phone}</p>
            </div>
          </div>

          <div className="pt-3 border-t border-cream-100 text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">Delivery Address:</p>
            <p>{order.deliveryAddress?.street}, {order.deliveryAddress?.locality}, {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}</p>
          </div>
        </div>

        {/* Order Items Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Ordered Homemade Dishes</h3>
          <div className="space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs pb-2 border-b border-cream-100 last:border-b-0">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                  <span className="font-bold text-slate-900">{item.name}</span>
                  <span className="text-slate-400">x{item.quantity}</span>
                </div>
                <span className="font-bold font-serif text-slate-900">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-cream-200 text-xs text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span>₹{order.itemsTotal}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Discount ({order.couponCode})</span>
                <span>-₹{order.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Delivery Partner Fee</span>
              <span>₹{order.deliveryFee}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes & Cess</span>
              <span>₹{order.taxAmount}</span>
            </div>
            <div className="flex justify-between text-base font-black font-serif text-slate-900 pt-2 border-t border-cream-100">
              <span>Total Paid ({order.paymentMethod})</span>
              <span className="text-forest-900">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
