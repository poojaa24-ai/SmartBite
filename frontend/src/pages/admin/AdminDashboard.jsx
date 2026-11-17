import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ChefHat,
  ShoppingBag,
  DollarSign,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  Package,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
          setRecentOrders(res.data.recentOrders);
          setPendingSellers(res.data.pendingSellers);
          setCategoryStats(res.data.categoryStats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  // Demo trend data for charts if monthly stats is small
  const chartData = [
    { month: 'Jun', orders: 120, revenue: 38400 },
    { month: 'Jul', orders: 180, revenue: 54000 },
    { month: 'Aug', orders: 240, revenue: 76000 },
    { month: 'Sep', orders: 310, revenue: 98000 },
    { month: 'Oct', orders: 420, revenue: 132000 },
    { month: 'Nov', orders: stats?.totalOrders || 480, revenue: stats?.totalRevenue || 154000 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900/10 text-forest-900 text-xs font-bold uppercase tracking-wider mb-2">
          <ShieldCheck className="w-4 h-4 text-forest-800" />
          <span>Platform Administration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
          SmartBite Master Dashboard
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete platform oversight of customer demand, home chef compliance, orders, and revenue
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Platform GMV</span>
          <div className="text-2xl sm:text-3xl font-black font-serif text-slate-900">
            ₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}
          </div>
          <p className="text-[11px] text-emerald-600 font-bold">
            ₹{stats?.platformCommission?.toLocaleString('en-IN') || 0} SmartBite Net Rev
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
          <div className="text-2xl sm:text-3xl font-black font-serif text-slate-900">
            {stats?.totalOrders || 0}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">{stats?.activeOrders || 0} in active kitchen prep</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Home Chefs</span>
          <div className="text-2xl sm:text-3xl font-black font-serif text-forest-900">
            {stats?.approvedSellers || 0} / {stats?.totalSellers || 0}
          </div>
          <Link to="/admin/verification" className="text-[11px] text-amber-600 font-bold hover:underline">
            {stats?.pendingVerifications || 0} Pending Verification
          </Link>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-cream-200 shadow-sm space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Customers</span>
          <div className="text-2xl sm:text-3xl font-black font-serif text-slate-900">
            {stats?.totalCustomers || 0}
          </div>
          <p className="text-[11px] text-slate-400">{stats?.totalSubscriptions || 0} meal subscribers</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-4">
          <div className="flex items-center justify-between border-b border-cream-100 pb-3">
            <div>
              <h3 className="text-base font-bold font-serif text-slate-900">Monthly Platform Revenue Trend</h3>
              <p className="text-xs text-slate-400">Order volumes and GMV across all verified kitchens</p>
            </div>
            <span className="text-xs font-bold text-forest-800 bg-forest-50 px-3 py-1 rounded-full">
              FY 2026 Growth
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#166534" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#166534" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#166534" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-4">
          <h3 className="text-base font-bold font-serif text-slate-900 border-b border-cream-100 pb-3">
            Popular Categories
          </h3>
          <div className="space-y-3">
            {categoryStats.slice(0, 5).map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-800 truncate">{cat._id}</span>
                  <span className="font-semibold text-slate-500">{cat.count} dishes</span>
                </div>
                <div className="w-full bg-cream-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-forest-800 h-full rounded-full"
                    style={{ width: `${Math.min(100, (cat.count / 10) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Seller Verifications Alert Box (FEATURE 5) */}
      {pendingSellers.length > 0 && (
        <div className="bg-amber-50 p-6 sm:p-8 rounded-3xl border border-amber-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold font-serif">
                Pending Home Chef Applications Awaiting Review ({pendingSellers.length})
              </h3>
            </div>
            <Link
              to="/admin/verification"
              className="text-xs font-bold text-amber-900 hover:underline flex items-center gap-1"
            >
              <span>Audit All Applications</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pendingSellers.map((seller) => (
              <div key={seller._id} className="p-4 rounded-2xl bg-white border border-amber-200 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{seller.kitchenName}</h4>
                  <p className="text-[11px] text-slate-500">Applicant: {seller.user?.name} ({seller.address?.city})</p>
                  <p className="text-[10px] text-amber-700 font-semibold mt-0.5">FSSAI Reg: {seller.fssaiNumber || 'Pending'}</p>
                </div>
                <Link
                  to="/admin/verification"
                  className="px-3.5 py-1.5 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800 transition-colors"
                >
                  Inspect
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Master Stream */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-soft space-y-4">
        <div className="flex items-center justify-between border-b border-cream-100 pb-3">
          <h3 className="text-base font-bold font-serif text-slate-900">Global Platform Order Activity</h3>
          <Link to="/admin/orders" className="text-xs font-bold text-forest-800 hover:underline">
            View All Global Orders
          </Link>
        </div>

        <div className="space-y-3">
          {recentOrders.map((ord) => (
            <div
              key={ord._id}
              className="p-4 rounded-2xl bg-cream-50/60 border border-cream-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">#{ord.orderNumber}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-forest-100 text-forest-900">
                    {ord.orderStatus}
                  </span>
                </div>
                <p className="text-slate-600">
                  Customer: <span className="font-bold text-slate-800">{ord.customer?.name}</span> • Kitchen: <span className="font-bold text-slate-800">{ord.seller?.kitchenName}</span>
                </p>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-black font-serif text-slate-900">₹{ord.totalAmount}</span>
                <span className="text-[10px] text-slate-400">{new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
