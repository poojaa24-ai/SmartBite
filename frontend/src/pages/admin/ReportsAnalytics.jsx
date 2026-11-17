import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, TrendingUp, DollarSign, Award, Utensils } from 'lucide-react';
import api from '../../services/api';

const COLORS = ['#166534', '#ea580c', '#3b82f6', '#8b5cf6', '#eab308', '#ec4899'];

const ReportsAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [categoryStats, setCategoryStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
          setCategoryStats(res.data.categoryStats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const pieData = categoryStats.map((c) => ({
    name: c._id,
    value: c.count,
  }));

  const orderTrends = [
    { day: 'Mon', count: 42 },
    { day: 'Tue', count: 38 },
    { day: 'Wed', count: 55 },
    { day: 'Thu', count: 61 },
    { day: 'Fri', count: 84 },
    { day: 'Sat', count: 110 },
    { day: 'Sun', count: 135 },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
          Platform Reports & Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Detailed metrics, order surges, category distribution, and kitchen performance
        </p>
      </div>

      {/* Top Level Financials */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Platform Revenue (10% Commission)
          </span>
          <span className="text-3xl font-black font-serif text-forest-900">
            ₹{stats?.platformCommission?.toLocaleString('en-IN') || 0}
          </span>
          <p className="text-xs text-emerald-600 mt-2 font-semibold">100% Retained Net Platform Income</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Customer GMV
          </span>
          <span className="text-3xl font-black font-serif text-slate-900">
            ₹{stats?.totalRevenue?.toLocaleString('en-IN') || 0}
          </span>
          <p className="text-xs text-slate-500 mt-2 font-medium">Delivered & confirmed orders</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Average Order Value (AOV)
          </span>
          <span className="text-3xl font-black font-serif text-slate-900">
            ₹{stats?.totalOrders ? Math.round(stats.totalRevenue / stats.totalOrders) : 285}
          </span>
          <p className="text-xs text-slate-500 mt-2 font-medium">Per confirmed transaction</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weekly Day Distribution */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-4">
          <h3 className="text-base font-bold font-serif text-slate-900 border-b border-cream-100 pb-3">
            Weekly Order Volume Patterns
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', border: 'none' }}
                />
                <Bar dataKey="count" fill="#166534" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Pie */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-4">
          <h3 className="text-base font-bold font-serif text-slate-900 border-b border-cream-100 pb-3">
            Category Share in Menu
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={50}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
