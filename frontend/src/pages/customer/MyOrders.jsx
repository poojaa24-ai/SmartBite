import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';
import EmptyState from '../../components/EmptyState';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/my-orders');
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') {
      return ['placed', 'confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.orderStatus);
    }
    if (filterStatus === 'delivered') return o.orderStatus === 'delivered';
    if (filterStatus === 'cancelled') return o.orderStatus === 'cancelled';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">My Order History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track live preparation and view past homemade food orders
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-cream-200 rounded-2xl shadow-sm text-xs font-bold">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === 'all' ? 'bg-forest-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({orders.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === 'active' ? 'bg-forest-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilterStatus('delivered')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === 'delivered' ? 'bg-forest-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Delivered
          </button>
          <button
            onClick={() => setFilterStatus('cancelled')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              filterStatus === 'cancelled' ? 'bg-forest-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cancelled
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-3xl border border-cream-200 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No Orders Found"
          description="You do not have any orders in this category."
          actionText="Explore Dishes"
          actionLink="/explore"
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((ord) => (
            <div
              key={ord._id}
              className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-slate-900">#{ord.orderNumber}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      ord.orderStatus === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.orderStatus === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ord.orderStatus.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-slate-400">
                    • {new Date(ord.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-800">
                  {ord.seller?.kitchenName || 'Home Kitchen'}
                </h4>

                <div className="text-xs text-slate-600 space-y-0.5">
                  {ord.items.map((item, idx) => (
                    <p key={idx} className="line-clamp-1">
                      • {item.name} <span className="text-slate-400 font-semibold">(x{item.quantity})</span>
                    </p>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between md:flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-cream-100">
                <span className="text-xl font-black font-serif text-slate-900">
                  ₹{ord.totalAmount}
                </span>

                <div className="flex gap-2">
                  {ord.orderStatus === 'delivered' && !ord.reviewSubmitted && (
                    <Link
                      to={`/reviews/add?orderId=${ord._id}&foodId=${ord.items[0]?.food}`}
                      className="px-3.5 py-1.5 rounded-xl border border-forest-800 text-forest-900 text-xs font-bold hover:bg-forest-50 transition-colors"
                    >
                      Rate Meal
                    </Link>
                  )}
                  <Link
                    to={`/order-tracking/${ord._id}`}
                    className="px-4 py-2 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800 transition-colors flex items-center gap-1"
                  >
                    <span>Track Order</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
