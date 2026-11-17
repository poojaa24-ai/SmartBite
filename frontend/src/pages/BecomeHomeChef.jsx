import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChefHat,
  DollarSign,
  Clock,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BecomeHomeChef = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [portionsPerDay, setPortionsPerDay] = useState(25);
  const [avgPrice, setAvgPrice] = useState(130);

  // Earnings calculation: portions * price * 26 working days * 0.90 net
  const monthlyRevenue = portionsPerDay * avgPrice * 26;
  const netEarnings = Math.round(monthlyRevenue * 0.9);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-forest-950 via-forest-900 to-forest-800 text-white rounded-3xl p-8 sm:p-14 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-500 text-white text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Turn Your Cooking Passion Into Income</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-serif leading-tight">
            Cook What You Love. Earn On Your Own Terms.
          </h1>
          <p className="text-sm sm:text-base text-forest-200 leading-relaxed font-normal">
            Join hundreds of mothers, homemakers, and culinary artists who share genuine homemade delicacies with hungry neighbors every day on SmartBite.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-full bg-white text-forest-950 font-bold text-sm hover:bg-cream-100 transition-colors shadow-lg flex items-center gap-2"
            >
              <span>Register Your Kitchen</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-2xl aspect-video lg:aspect-[4/3]">
          <img
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
            alt="Chef Preparing Food"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Interactive Monthly Earnings Calculator */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-cream-200 shadow-soft">
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-accent-600">
            Earnings Potential Estimator
          </span>
          <h2 className="text-3xl font-black font-serif text-slate-900">
            How Much Can You Earn from Home?
          </h2>
          <p className="text-sm text-slate-500">
            Slide to see your projected monthly earnings based on portion limits and dish prices.
          </p>
        </div>

        <div className="max-w-2xl mx-auto bg-cream-50 p-6 sm:p-8 rounded-3xl border border-cream-200 space-y-8">
          <div>
            <div className="flex justify-between text-sm font-bold text-slate-800 mb-2">
              <span>FreshBatch Portions Prepared Daily:</span>
              <span className="text-forest-900 font-serif text-lg">{portionsPerDay} portions</span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="5"
              value={portionsPerDay}
              onChange={(e) => setPortionsPerDay(Number(e.target.value))}
              className="w-full accent-forest-900 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>10 portions</span>
              <span>60 portions</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm font-bold text-slate-800 mb-2">
              <span>Average Price per Portion:</span>
              <span className="text-forest-900 font-serif text-lg">₹{avgPrice}</span>
            </div>
            <input
              type="range"
              min="60"
              max="300"
              step="10"
              value={avgPrice}
              onChange={(e) => setAvgPrice(Number(e.target.value))}
              className="w-full accent-forest-900 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>₹60 (Breakfast / Snacks)</span>
              <span>₹300 (Deluxe Meals / Biryani)</span>
            </div>
          </div>

          {/* Result Card */}
          <div className="p-6 rounded-2xl bg-forest-900 text-white text-center shadow-lg">
            <span className="text-xs font-medium text-forest-200 uppercase tracking-wider block">
              Estimated Monthly Net Take-Home (90% Payout)
            </span>
            <span className="text-4xl sm:text-5xl font-black font-serif text-accent-400 my-2 block">
              ₹{netEarnings.toLocaleString('en-IN')}
            </span>
            <p className="text-xs text-forest-300">
              *Calculated on 26 cooking days per month with our transparent 10% platform fee.
            </p>
          </div>
        </div>
      </div>

      {/* Why Partner with SmartBite */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-forest-100 flex items-center justify-center text-forest-800">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-serif">You Control Your Schedule</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Specify which days you cook, set opening and closing hours, and pause your kitchen anytime you need a personal break.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-serif">FreshBatch Portions Safety</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Never get overwhelmed by unexpected surges. You fix your maximum portion limit, and the system automatically halts orders when reached.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
            <DollarSign className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-serif">Weekly Direct Bank Payouts</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            All customer earnings are deposited directly into your linked bank account or UPI every week with clear, transparent commission statements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BecomeHomeChef;
