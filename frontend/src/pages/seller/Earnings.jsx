import React, { useState, useEffect } from 'react';
import { DollarSign, ArrowDownCircle, ShieldCheck, CheckCircle2, TrendingUp, Building } from 'lucide-react';
import api from '../../services/api';

const Earnings = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const res = await api.get('/sellers/me/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const totalSales = stats?.totalSales || 38400;
  const platformFee = Math.round(totalSales * 0.1);
  const netEarnings = totalSales - platformFee;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
          Earnings & Weekly Payouts
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Transparent breakdown of your homemade food sales, SmartBite platform fee, and net payouts
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Sales</span>
          <div className="text-3xl font-black font-serif text-slate-900">
            ₹{totalSales.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500">From all customer orders</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Fee (10%)</span>
          <div className="text-3xl font-black font-serif text-amber-600">
            -₹{platformFee.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-500">Covers hosting & marketing</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Take-Home Payout (90%)</span>
          <div className="text-3xl font-black font-serif text-forest-900">
            ₹{netEarnings.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-emerald-600 font-bold">Transferred to Bank / UPI</p>
        </div>
      </div>

      {/* Payout History Ledger */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-4">
        <h3 className="text-base font-bold font-serif text-slate-900 border-b border-cream-100 pb-3">
          Weekly Bank Transfer History
        </h3>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Weekly Cycle Settlement #SB-8921</h4>
                <p className="text-[11px] text-slate-400">Processed on Nov 15, 2026 • Reference: UPI-984210</p>
              </div>
            </div>
            <span className="text-sm font-black font-serif text-forest-900">
              ₹12,450.00
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-cream-50 border border-cream-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Weekly Cycle Settlement #SB-7814</h4>
                <p className="text-[11px] text-slate-400">Processed on Nov 08, 2026 • Reference: UPI-871239</p>
              </div>
            </div>
            <span className="text-sm font-black font-serif text-forest-900">
              ₹14,200.00
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
