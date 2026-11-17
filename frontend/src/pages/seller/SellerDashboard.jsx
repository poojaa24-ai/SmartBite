import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Star,
  CheckCircle2,
  ChefHat,
  Package,
  PlusCircle,
  ShieldCheck,
  ArrowRight,
  Power,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const SellerDashboard = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [freshBatchDishes, setFreshBatchDishes] = useState([]);
  const [isKitchenOpen, setIsKitchenOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sellers/me/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setRecentOrders(res.data.recentOrders);
        setFreshBatchDishes(res.data.freshBatchDishes);
        setIsKitchenOpen(res.data.stats.isKitchenOpen);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleToggleKitchen = async () => {
    try {
      const res = await api.put('/sellers/me/toggle-status');
      if (res.data.success) {
        setIsKitchenOpen(res.data.isKitchenOpen);
        success(res.data.message);
      }
    } catch (err) {
      error(err.message);
    }
  };

  const handleQuickStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        success(`Order status updated to ${newStatus}!`);
        fetchStats();
      }
    } catch (err) {
      error(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Kitchen Open/Close Switch */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-forest-800">
              Kitchen Command Center
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
              stats?.verificationStatus === 'approved'
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-amber-100 text-amber-800'
            }`}>
              {stats?.verificationStatus || 'Pending Review'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
            {user?.sellerProfile?.kitchenName || `${user?.name}'s Home Kitchen`}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your daily FreshBatch portions, incoming customer orders, and kitchen operations
          </p>
        </div>

        {/* Kitchen Status Toggle */}
        <div className="flex items-center gap-3 bg-cream-50 p-2 pl-4 rounded-2xl border border-cream-200 shrink-0">
          <div>
            <span className="text-xs font-bold text-slate-900 block">
              {isKitchenOpen ? 'Kitchen is OPEN' : 'Kitchen is CLOSED'}
            </span>
            <span className="text-[10px] text-slate-400">
              {isKitchenOpen ? 'Accepting orders today' : 'No new orders'}
            </span>
          </div>
          <button
            onClick={handleToggleKitchen}
            className={`p-3 rounded-xl transition-all shadow-sm ${
              isKitchenOpen
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
            title="Toggle Open/Close Status"
          >
            <Power className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Earnings</span>
          <div className="text-2xl sm:text-3xl font-black font-serif text-forest-900">
            ₹{stats?.netEarnings?.toLocaleString('en-IN') || 0}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">90% Seller Payout</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
          <div className="text-2xl sm:text-3xl font-black font-serif text-slate-900">
            {stats?.totalOrders || 0}
          </div>
          <p className="text-[11px] text-amber-600 font-bold">{stats?.pendingOrders || 0} active now</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Dishes</span>
          <div className="text-2xl sm:text-3xl font-black font-serif text-slate-900">
            {stats?.activeFoodsCount || 0}
          </div>
          <Link to="/seller/add-food" className="text-[11px] text-forest-800 font-bold hover:underline">
            + Add New Dish
          </Link>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kitchen Rating</span>
          <div className="text-2xl sm:text-3xl font-black font-serif text-amber-500 flex items-center gap-1">
            <Star className="w-6 h-6 fill-amber-500" />
            <span>{stats?.rating || '4.9'}</span>
          </div>
          <p className="text-[11px] text-slate-400">{stats?.totalReviews || 0} reviews received</p>
        </div>
      </div>

      {/* FEATURE 1: FreshBatch Daily Portions Monitor */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-forest-600" />
              <h3 className="text-base font-bold font-serif text-slate-900">
                FreshBatch™ Daily Portions Live Monitor
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Current portion inventory for today's batches. Automatically decrements upon order placement.
            </p>
          </div>
          <Link
            to="/seller/freshbatch"
            className="text-xs font-bold text-forest-900 hover:underline"
          >
            Manage Portions
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {freshBatchDishes.map((dish) => (
            <div
              key={dish._id}
              className="p-4 rounded-2xl bg-cream-50 border border-cream-200 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 truncate max-w-[180px]">{dish.name}</h4>
                <span className="text-xs font-serif font-black text-forest-900">₹{dish.price}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-600">
                <span>Available:</span>
                <span className="font-extrabold text-forest-800">
                  {dish.freshBatch.availablePortions} / {dish.freshBatch.totalPortions} Portions
                </span>
              </div>

              <div className="w-full bg-cream-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-forest-800 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (dish.freshBatch.availablePortions / dish.freshBatch.totalPortions) * 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incoming Customer Orders Queue */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-cream-100 pb-4">
          <div>
            <h3 className="text-base font-bold font-serif text-slate-900">Recent Customer Orders</h3>
            <p className="text-xs text-slate-500">Live order queue ready for preparation</p>
          </div>
          <Link to="/seller/orders" className="text-xs font-bold text-forest-800 hover:underline">
            View All Orders
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No orders received yet today.</p>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((ord) => (
              <div
                key={ord._id}
                className="p-5 rounded-2xl bg-cream-50/70 border border-cream-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 font-mono">#{ord.orderNumber}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        ord.orderStatus === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.orderStatus === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.orderStatus.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Customer: {ord.customer?.name} ({ord.customer?.phone})
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 mt-2 font-medium">
                    {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-base font-black font-serif text-slate-900 mr-2">
                    ₹{ord.totalAmount}
                  </span>

                  {ord.orderStatus === 'placed' && (
                    <button
                      onClick={() => handleQuickStatusUpdate(ord._id, 'confirmed')}
                      className="px-3.5 py-1.5 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800 transition-colors"
                    >
                      Accept Order
                    </button>
                  )}

                  {ord.orderStatus === 'confirmed' && (
                    <button
                      onClick={() => handleQuickStatusUpdate(ord._id, 'preparing')}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors"
                    >
                      Start Cooking
                    </button>
                  )}

                  {ord.orderStatus === 'preparing' && (
                    <button
                      onClick={() => handleQuickStatusUpdate(ord._id, 'ready')}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
                    >
                      Mark Ready / Packed
                    </button>
                  )}

                  {ord.orderStatus === 'ready' && (
                    <button
                      onClick={() => handleQuickStatusUpdate(ord._id, 'out_for_delivery')}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
                    >
                      Dispatch for Delivery
                    </button>
                  )}

                  {ord.orderStatus === 'out_for_delivery' && (
                    <button
                      onClick={() => handleQuickStatusUpdate(ord._id, 'delivered')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors"
                    >
                      Confirm Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
