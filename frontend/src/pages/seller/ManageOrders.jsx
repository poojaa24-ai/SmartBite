import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, Clock, Truck, ChefHat, Phone, MapPin } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';

const ManageOrders = () => {
  const { success, error } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders/seller-orders');
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        success(`Order #${res.data.order.orderNumber} updated to ${newStatus.replace(/_/g, ' ')}!`);
        fetchOrders();
      }
    } catch (err) {
      error(err.message);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return ['placed', 'confirmed', 'preparing', 'ready'].includes(o.orderStatus);
    if (filter === 'dispatched') return o.orderStatus === 'out_for_delivery';
    if (filter === 'completed') return o.orderStatus === 'delivered';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
            Kitchen Live Orders
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Accept incoming orders, update live preparation stages, and dispatch meals
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-cream-200 rounded-2xl shadow-sm text-xs font-bold">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === 'all' ? 'bg-forest-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Orders ({orders.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === 'pending' ? 'bg-forest-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cooking / In Kitchen
          </button>
          <button
            onClick={() => setFilter('dispatched')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === 'dispatched' ? 'bg-forest-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Out for Delivery
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filter === 'completed' ? 'bg-forest-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Delivered
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-3xl border border-cream-200 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No Orders In This Queue"
          description="Incoming orders will automatically appear here in real-time."
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => (
            <div
              key={ord._id}
              className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cream-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black font-mono text-slate-900">#{ord.orderNumber}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    ord.orderStatus === 'delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : ord.orderStatus === 'cancelled'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {ord.orderStatus.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-400">
                    Ordered: {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-base font-black font-serif text-slate-900">
                    ₹{ord.totalAmount}
                  </span>
                  <span className="text-[10px] text-slate-400 block uppercase">
                    Paid via {ord.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Items List & Customer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                <div className="space-y-1">
                  <span className="font-bold text-slate-800 block">Ordered Dishes:</span>
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="font-medium text-slate-800">
                        • {item.name} <span className="text-slate-400">x{item.quantity}</span>
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 bg-cream-50 p-3 rounded-2xl border border-cream-200">
                  <span className="font-bold text-slate-800 block">Delivery To:</span>
                  <p className="font-medium text-slate-900">{ord.customer?.name} (Phone: {ord.customer?.phone || ord.deliveryAddress?.phone})</p>
                  <p className="text-slate-500 leading-tight">
                    {ord.deliveryAddress?.street}, {ord.deliveryAddress?.locality}, {ord.deliveryAddress?.city}
                  </p>
                  {ord.deliveryAddress?.instructions && (
                    <p className="text-accent-600 font-semibold mt-1">
                      Note: {ord.deliveryAddress.instructions}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons Stepper */}
              <div className="pt-3 border-t border-cream-100 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-400">
                  Next Step in Kitchen Workflow:
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {ord.orderStatus === 'placed' && (
                    <button
                      onClick={() => handleUpdateStatus(ord._id, 'confirmed')}
                      className="px-4 py-2 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800 transition-colors"
                    >
                      Accept & Confirm
                    </button>
                  )}

                  {ord.orderStatus === 'confirmed' && (
                    <button
                      onClick={() => handleUpdateStatus(ord._id, 'preparing')}
                      className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors"
                    >
                      Start Cooking Batch
                    </button>
                  )}

                  {ord.orderStatus === 'preparing' && (
                    <button
                      onClick={() => handleUpdateStatus(ord._id, 'ready')}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                    >
                      Pack & Mark Ready
                    </button>
                  )}

                  {ord.orderStatus === 'ready' && (
                    <button
                      onClick={() => handleUpdateStatus(ord._id, 'out_for_delivery')}
                      className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
                    >
                      Handover to Delivery
                    </button>
                  )}

                  {ord.orderStatus === 'out_for_delivery' && (
                    <button
                      onClick={() => handleUpdateStatus(ord._id, 'delivered')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Confirm Delivered
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
