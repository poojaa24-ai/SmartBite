import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Trash2, Edit, Flame, Power, Sparkles, Check, X } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';

const ManageFood = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Rescue Deal modal
  const [activeRescueModal, setActiveRescueModal] = useState(null);
  const [discountPrice, setDiscountPrice] = useState('');
  const [remainingPortions, setRemainingPortions] = useState('');
  const [pickupDeadline, setPickupDeadline] = useState('09:00 PM');

  const fetchChefFoods = async () => {
    try {
      setLoading(true);
      const profileRes = await api.get('/sellers/me/profile');
      if (profileRes.data.success && profileRes.data.seller) {
        const res = await api.get(`/foods?seller=${profileRes.data.seller._id}`);
        if (res.data.success) {
          setFoods(res.data.foods);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChefFoods();
  }, []);

  const handleToggleAvailability = async (food) => {
    try {
      const res = await api.put(`/foods/${food._id}`, {
        isAvailable: !food.isAvailable,
      });
      if (res.data.success) {
        success(`${food.name} is now ${!food.isAvailable ? 'Available' : 'Unavailable'}`);
        fetchChefFoods();
      }
    } catch (err) {
      error(err.message);
    }
  };

  const handleDeleteDish = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dish from your kitchen?')) return;
    try {
      const res = await api.delete(`/foods/${id}`);
      if (res.data.success) {
        success('Dish removed successfully.');
        setFoods(foods.filter((f) => f._id !== id));
      }
    } catch (err) {
      error(err.message);
    }
  };

  const openRescueDealModal = (food) => {
    setActiveRescueModal(food);
    setDiscountPrice(Math.round(food.price * 0.6)); // 40% off default
    setRemainingPortions(Math.min(5, food.freshBatch?.availablePortions || 5));
  };

  const handleSaveRescueDeal = async (e) => {
    e.preventDefault();
    if (!activeRescueModal) return;
    try {
      const res = await api.post(`/foods/${activeRescueModal._id}/rescue-deal`, {
        discountedPrice: Number(discountPrice),
        remainingPortions: Number(remainingPortions),
        pickupDeadline,
        active: true,
      });

      if (res.data.success) {
        success(res.data.message);
        setActiveRescueModal(null);
        fetchChefFoods();
      }
    } catch (err) {
      error(err.message);
    }
  };

  const handleDeactivateRescue = async (foodId) => {
    try {
      const res = await api.post(`/foods/${foodId}/rescue-deal`, { active: false });
      if (res.data.success) {
        success('Food Rescue Deal turned off');
        fetchChefFoods();
      }
    } catch (err) {
      error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
            Manage Food Menu
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Toggle availability, trigger Food Rescue Deals, and maintain your homemade offerings
          </p>
        </div>

        <Link
          to="/seller/add-food"
          className="px-5 py-2.5 rounded-2xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Dish</span>
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white rounded-2xl border border-cream-200 animate-pulse" />
          ))}
        </div>
      ) : foods.length === 0 ? (
        <EmptyState
          title="No Dishes In Your Kitchen Menu"
          description="Start adding your delicious home cooked recipes to let customers discover and order."
          actionText="Add First Dish"
          actionLink="/seller/add-food"
        />
      ) : (
        <div className="space-y-4">
          {foods.map((food) => {
            const isRescueActive = food.rescueDeal?.isRescueDeal && food.rescueDeal?.active;

            return (
              <div
                key={food._id}
                className="bg-white p-5 rounded-3xl border border-cream-200 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={food.image}
                    alt={food.name}
                    className="w-16 h-16 rounded-2xl object-cover shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${food.isVeg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                      <h4 className="text-sm font-bold text-slate-900">{food.name}</h4>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        food.isAvailable ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {food.isAvailable ? 'Available' : 'Paused'}
                      </span>
                      {isRescueActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-accent-100 text-accent-700 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-accent-600" />
                          <span>Rescue Deal: ₹{food.rescueDeal.discountedPrice}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="font-serif font-black text-slate-900">₹{food.price}</span>
                      <span>•</span>
                      <span>Category: {food.category?.name || food.categoryName}</span>
                      <span>•</span>
                      <span className="font-bold text-forest-800">
                        FreshBatch: {food.freshBatch?.availablePortions ?? 0} / {food.freshBatch?.totalPortions ?? 20} portions
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-cream-100">
                  {/* Food Rescue Deal Toggle (FEATURE 3) */}
                  {isRescueActive ? (
                    <button
                      onClick={() => handleDeactivateRescue(food._id)}
                      className="px-3 py-1.5 rounded-xl bg-accent-100 text-accent-800 text-xs font-bold hover:bg-accent-200 transition-colors"
                      title="Deactivate Rescue Deal"
                    >
                      Turn Off Rescue Deal
                    </button>
                  ) : (
                    <button
                      onClick={() => openRescueDealModal(food)}
                      className="px-3 py-1.5 rounded-xl border border-accent-500 text-accent-700 text-xs font-bold hover:bg-accent-50 transition-colors flex items-center gap-1"
                      title="Create Rescue Deal for remaining portions"
                    >
                      <Flame className="w-3.5 h-3.5 text-accent-500" />
                      <span>Rescue Deal</span>
                    </button>
                  )}

                  {/* Availability toggle */}
                  <button
                    onClick={() => handleToggleAvailability(food)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      food.isAvailable
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {food.isAvailable ? 'Pause Dish' : 'Make Available'}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDeleteDish(food._id)}
                    className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete Dish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FEATURE 3: Activate Food Rescue Deal Modal */}
      {activeRescueModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-cream-200">
            <div className="flex items-center gap-2 mb-2 text-accent-600">
              <Flame className="w-5 h-5" />
              <h3 className="text-xl font-bold font-serif text-slate-900">
                Create Food Rescue Deal
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              Discount remaining prepared portions of <span className="font-bold text-slate-800">{activeRescueModal.name}</span> before closing to eliminate food waste.
            </p>

            <form onSubmit={handleSaveRescueDeal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Original Price</label>
                  <input
                    type="text"
                    disabled
                    value={`₹${activeRescueModal.price}`}
                    className="w-full px-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-xl font-bold font-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rescue Discount Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={activeRescueModal.price - 1}
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl font-bold font-serif text-accent-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Portions to Rescue</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={activeRescueModal.freshBatch?.availablePortions || 20}
                    value={remainingPortions}
                    onChange={(e) => setRemainingPortions(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Deadline</label>
                  <input
                    type="text"
                    required
                    value={pickupDeadline}
                    onChange={(e) => setPickupDeadline(e.target.value)}
                    placeholder="09:00 PM"
                    className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setActiveRescueModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-accent-600 text-white text-xs font-bold hover:bg-accent-700"
                >
                  Publish Flash Deal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageFood;
