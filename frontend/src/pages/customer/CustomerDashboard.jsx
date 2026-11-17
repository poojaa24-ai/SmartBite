import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  Calendar,
  Heart,
  Clock,
  ArrowRight,
  Sparkles,
  MapPin,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import FoodCard from '../../components/FoodCard';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [ordersRes, subsRes, favsRes, recRes] = await Promise.all([
          api.get('/orders/my-orders'),
          api.get('/subscriptions/my'),
          api.get('/users/favorites'),
          api.get('/recommendations'),
        ]);

        if (ordersRes.data.success) setOrders(ordersRes.data.orders);
        if (subsRes.data.success) setSubscriptions(subsRes.data.subscriptions);
        if (favsRes.data.success) setFavorites(favsRes.data.favorites);
        if (recRes.data.success) setRecommendations(recRes.data.recommendations);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Find active orders currently in preparation or delivery
  const activeOrder = orders.find((o) =>
    ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.orderStatus)
  );

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-forest-900 to-forest-950 text-white p-6 sm:p-8 rounded-3xl shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-accent-400 block mb-1">
            Welcome Back
          </span>
          <h1 className="text-2xl sm:text-3xl font-black font-serif">
            Namaste, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-forest-200 mt-1 max-w-lg">
            Ready for wholesome homemade food? Discover today's fresh batches prepared by neighborhood home chefs.
          </p>
        </div>
        <Link
          to="/explore"
          className="px-6 py-3 rounded-full bg-accent-500 hover:bg-accent-600 text-white font-bold text-xs shadow-md transition-all shrink-0 flex items-center justify-center gap-2"
        >
          <span>Order Fresh Food</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Active Live Order Alert Banner (if any) */}
      {activeOrder && (
        <div className="p-5 rounded-3xl bg-amber-500 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-white animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider bg-white text-amber-900 px-2.5 py-0.5 rounded-full">
                  Live Order In Progress
                </span>
                <span className="text-xs font-bold">#{activeOrder.orderNumber}</span>
              </div>
              <h3 className="text-base font-bold font-serif mt-1">
                Status: {activeOrder.orderStatus.replace(/_/g, ' ').toUpperCase()}
              </h3>
              <p className="text-xs text-amber-100">
                Prepared by {activeOrder.seller?.kitchenName || 'Home Kitchen'}
              </p>
            </div>
          </div>
          <Link
            to={`/order-tracking/${activeOrder._id}`}
            className="px-5 py-2.5 rounded-xl bg-white text-amber-900 font-bold text-xs hover:bg-cream-100 transition-colors shadow-md shrink-0 flex items-center justify-center gap-1.5"
          >
            <span>Live Tracking & ETA</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Mini Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link
          to="/my-orders"
          className="bg-white p-5 rounded-3xl border border-cream-200 shadow-sm hover:shadow-soft transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-800 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 font-serif">{orders.length}</span>
            <p className="text-xs text-slate-500 font-medium">Orders Placed</p>
          </div>
        </Link>

        <Link
          to="/subscriptions/my"
          className="bg-white p-5 rounded-3xl border border-cream-200 shadow-sm hover:shadow-soft transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 font-serif">
              {subscriptions.filter((s) => s.status === 'active').length}
            </span>
            <p className="text-xs text-slate-500 font-medium">Active Meal Plans</p>
          </div>
        </Link>

        <Link
          to="/favorites"
          className="bg-white p-5 rounded-3xl border border-cream-200 shadow-sm hover:shadow-soft transition-all flex items-center gap-4 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 font-serif">{favorites.length}</span>
            <p className="text-xs text-slate-500 font-medium">Favorite Dishes</p>
          </div>
        </Link>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold font-serif text-slate-900">Recent Orders</h2>
          <Link to="/my-orders" className="text-xs font-bold text-forest-800 hover:underline">
            View All Orders
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            You haven't placed any homemade orders yet. Discover your first meal!
          </p>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((ord) => (
              <div
                key={ord._id}
                className="p-4 rounded-2xl bg-cream-50/70 border border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">#{ord.orderNumber}</span>
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
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    {ord.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                  </p>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <span className="text-sm font-black font-serif text-slate-900">
                    ₹{ord.totalAmount}
                  </span>
                  <Link
                    to={`/order-tracking/${ord._id}`}
                    className="px-3 py-1.5 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800 transition-colors"
                  >
                    Track / Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FEATURE 6: Personalized Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-forest-800">
                <Sparkles className="w-3.5 h-3.5 text-accent-500" />
                <span>Smart Food Discovery</span>
              </div>
              <h2 className="text-xl font-bold font-serif text-slate-900">Recommended For You</h2>
            </div>
            <Link to="/explore" className="text-xs font-bold text-forest-800 hover:underline">
              Explore All
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
