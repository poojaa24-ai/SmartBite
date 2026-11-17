import React, { useState, useEffect } from 'react';
import { Flame, Clock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import api from '../../services/api';
import FoodCard from '../../components/FoodCard';
import EmptyState from '../../components/EmptyState';
import { FoodCardSkeleton } from '../../components/LoadingSkeleton';

const FoodRescueDeals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        const res = await api.get('/foods/rescue-deals');
        if (res.data.success) {
          setDeals(res.data.deals);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-accent-600 via-accent-500 to-amber-600 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold uppercase tracking-wider">
            <Flame className="w-4 h-4 animate-bounce" />
            <span>Feature 3: Food Waste Reduction</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-serif">
            Food Rescue Deals: Fresh Homestyle Food at 40%–50% Off
          </h1>
          <p className="text-xs sm:text-sm text-accent-100 leading-relaxed font-normal">
            Before home chefs close their kitchens each evening, remaining prepared portions of daily batches are listed at deeply discounted rates. High quality, fresh food, and zero domestic food waste!
          </p>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <FoodCardSkeleton />
          <FoodCardSkeleton />
          <FoodCardSkeleton />
        </div>
      ) : deals.length === 0 ? (
        <EmptyState
          icon={Flame}
          title="No Active Rescue Deals Right Now"
          description="Home kitchens activate rescue deals towards closing hours (typically between 7:30 PM and 9:30 PM). Check back soon or explore regular fresh batches!"
          actionText="Explore Fresh Batches"
          actionLink="/explore"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {deals.map((food) => (
            <FoodCard key={food._id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodRescueDeals;
