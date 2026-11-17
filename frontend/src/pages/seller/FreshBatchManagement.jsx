import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, Plus, Minus, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const FreshBatchManagement = () => {
  const { success, error } = useToast();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [portionEdits, setPortionEdits] = useState({});

  const fetchFoods = async () => {
    try {
      setLoading(true);
      const profileRes = await api.get('/sellers/me/profile');
      if (profileRes.data.success && profileRes.data.seller) {
        const res = await api.get(`/foods?seller=${profileRes.data.seller._id}`);
        if (res.data.success) {
          setFoods(res.data.foods);

          // Initialize local edits
          const initial = {};
          res.data.foods.forEach((f) => {
            initial[f._id] = {
              totalPortions: f.freshBatch?.totalPortions || 20,
              availablePortions: f.freshBatch?.availablePortions || 20,
            };
          });
          setPortionEdits(initial);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  const handleUpdateBatch = async (foodId) => {
    try {
      const edit = portionEdits[foodId];
      if (!edit) return;

      const res = await api.put(`/foods/${foodId}/freshbatch`, {
        totalPortions: Number(edit.totalPortions),
        availablePortions: Number(edit.availablePortions),
      });

      if (res.data.success) {
        success(res.data.message);
        fetchFoods();
      }
    } catch (err) {
      error(err.message);
    }
  };

  const adjustPortion = (foodId, field, delta) => {
    setPortionEdits((prev) => {
      const current = prev[foodId] || { totalPortions: 20, availablePortions: 20 };
      const newVal = Math.max(0, current[field] + delta);
      return {
        ...prev,
        [foodId]: {
          ...current,
          [field]: newVal,
        },
      };
    });
  };

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-forest-900 to-forest-950 text-white p-6 sm:p-8 rounded-3xl shadow-soft">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-500 text-white text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Feature 1: FreshBatch Daily Inventory Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-serif">
          FreshBatch™ Daily Portion Management
        </h1>
        <p className="text-xs sm:text-sm text-forest-200 mt-2 max-w-2xl leading-relaxed">
          Specify exactly how many portions you prepare each day. As customer orders are confirmed, portions automatically decrease. Customers can never order more than what is fresh in your kitchen today.
        </p>
      </div>

      {/* Dishes Cards Grid */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 bg-white rounded-3xl border border-cream-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {foods.map((food) => {
            const currentEdit = portionEdits[food._id] || {
              totalPortions: food.freshBatch?.totalPortions || 20,
              availablePortions: food.freshBatch?.availablePortions || 20,
            };

            const soldPortions = Math.max(0, currentEdit.totalPortions - currentEdit.availablePortions);
            const percentageSold = Math.round((soldPortions / (currentEdit.totalPortions || 1)) * 100);

            return (
              <div
                key={food._id}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-cream-200 shadow-soft space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0"
                    />
                    <div>
                      <h3 className="text-base font-bold font-serif text-slate-900">{food.name}</h3>
                      <p className="text-xs text-slate-400">
                        ₹{food.price} per portion • {food.category?.name || food.categoryName}
                      </p>
                    </div>
                  </div>

                  {/* Summary Metric Pills */}
                  <div className="flex items-center gap-4 text-xs font-bold">
                    <div className="bg-cream-100 p-2.5 px-4 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 uppercase block">Total Batch</span>
                      <span className="text-sm font-black text-slate-900 font-serif">
                        {currentEdit.totalPortions}
                      </span>
                    </div>

                    <div className="bg-emerald-50 p-2.5 px-4 rounded-xl text-center border border-emerald-200">
                      <span className="text-[10px] text-emerald-700 uppercase block">Available</span>
                      <span className="text-sm font-black text-emerald-950 font-serif">
                        {currentEdit.availablePortions}
                      </span>
                    </div>

                    <div className="bg-amber-50 p-2.5 px-4 rounded-xl text-center border border-amber-200">
                      <span className="text-[10px] text-amber-700 uppercase block">Sold Today</span>
                      <span className="text-sm font-black text-amber-950 font-serif">
                        {soldPortions}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Daily Batch Consumption:</span>
                    <span className="font-bold text-slate-700">{percentageSold}% Sold Out</span>
                  </div>
                  <div className="w-full bg-cream-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-forest-800 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentageSold}%` }}
                    />
                  </div>
                </div>

                {/* Edit Controls */}
                <div className="pt-4 border-t border-cream-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-6">
                    {/* Total portions adjuster */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-700">Total Portions:</span>
                      <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1">
                        <button
                          type="button"
                          onClick={() => adjustPortion(food._id, 'totalPortions', -1)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-600"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-slate-900">
                          {currentEdit.totalPortions}
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustPortion(food._id, 'totalPortions', 1)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-600"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Available portions adjuster */}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-bold text-slate-700">Available Now:</span>
                      <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1">
                        <button
                          type="button"
                          onClick={() => adjustPortion(food._id, 'availablePortions', -1)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-600"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-slate-900">
                          {currentEdit.availablePortions}
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustPortion(food._id, 'availablePortions', 1)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-600"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpdateBatch(food._id)}
                    className="px-5 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 shrink-0"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Daily Portions</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FreshBatchManagement;
