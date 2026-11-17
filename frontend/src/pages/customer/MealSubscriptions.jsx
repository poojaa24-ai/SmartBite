import React, { useState, useEffect } from 'react';
import { Calendar, Plus, CheckCircle2, PauseCircle, PlayCircle, Clock, ShieldCheck, MapPin } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import EmptyState from '../../components/EmptyState';

const MealSubscriptions = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [subscriptions, setSubscriptions] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Subscription Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedSellerId, setSelectedSellerId] = useState('');
  const [mealType, setMealType] = useState('lunch');
  const [planDuration, setPlanDuration] = useState('weekly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliverySlot, setDeliverySlot] = useState('12:30 PM - 01:30 PM');
  const [street, setStreet] = useState('');
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState('560103');
  const [phone, setPhone] = useState(user?.phone || '9876543210');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsRes, sellersRes] = await Promise.all([
        api.get('/subscriptions/my'),
        api.get('/sellers'),
      ]);

      if (subsRes.data.success) setSubscriptions(subsRes.data.subscriptions);
      if (sellersRes.data.success) {
        setSellers(sellersRes.data.sellers);
        if (sellersRes.data.sellers.length > 0) {
          setSelectedSellerId(sellersRes.data.sellers[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    if (!street || !locality || !pincode || !phone) {
      error('Please complete all delivery address fields.');
      return;
    }

    try {
      setCreating(true);
      const res = await api.post('/subscriptions', {
        sellerId: selectedSellerId,
        mealType,
        planDuration,
        startDate,
        deliveryTimeSlot: deliverySlot,
        deliveryAddress: {
          street,
          locality,
          city: 'Bangalore',
          pincode,
          phone,
        },
        dietaryNotes,
      });

      if (res.data.success) {
        success(res.data.message);
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const togglePause = async (subId, currentStatus) => {
    try {
      const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
      const res = await api.put(`/subscriptions/${subId}/status`, { status: nextStatus });
      if (res.data.success) {
        success(res.data.message);
        setSubscriptions(subscriptions.map((s) => (s._id === subId ? res.data.subscription : s)));
      }
    } catch (err) {
      error(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900/10 text-forest-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-4 h-4 text-accent-500" />
            <span>Feature 2: Daily Meal Subscriptions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
            My Daily Meal Plans
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Scheduled breakfast, lunch, or dinner cooked daily by your chosen home chef
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-forest-900 text-white font-bold text-xs hover:bg-forest-800 transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Meal Subscription</span>
        </button>
      </div>

      {/* Subscriptions List */}
      {loading ? (
        <div className="space-y-4">
          <div className="h-40 bg-white rounded-3xl border border-cream-200 animate-pulse" />
        </div>
      ) : subscriptions.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Active Subscriptions"
          description="Never worry about cooking daily. Subscribe to a weekly or monthly home meal tiffin plan."
          actionText="Start Meal Subscription"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {subscriptions.map((sub) => (
            <div
              key={sub._id}
              className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 rounded-full bg-forest-100 text-forest-900 text-[10px] font-extrabold uppercase">
                    {sub.planDuration} • {sub.mealType}
                  </span>
                  <span
                    className={`text-xs font-extrabold capitalize ${
                      sub.status === 'active' ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    ● {sub.status}
                  </span>
                </div>

                <h3 className="text-base font-bold font-serif text-slate-900">{sub.planTitle}</h3>
                <p className="text-xs text-forest-800 font-semibold mt-0.5">
                  Chef: {sub.seller?.kitchenName || 'Home Kitchen'}
                </p>

                {/* Progress */}
                <div className="mt-4 p-3 rounded-2xl bg-cream-50 border border-cream-200">
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Meals Delivered:</span>
                    <span className="font-bold text-slate-900">
                      {sub.deliveredMeals} / {sub.totalMeals} meals
                    </span>
                  </div>
                  <div className="w-full bg-cream-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-forest-800 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (sub.deliveredMeals / sub.totalMeals) * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Slot: {sub.deliveryTimeSlot}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{sub.deliveryAddress?.locality}, {sub.deliveryAddress?.city}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-cream-100 flex items-center justify-between">
                <span className="text-sm font-black font-serif text-slate-900">
                  ₹{sub.totalAmount} Total
                </span>
                <button
                  onClick={() => togglePause(sub._id, sub.status)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                    sub.status === 'active'
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                  }`}
                >
                  {sub.status === 'active' ? (
                    <>
                      <PauseCircle className="w-4 h-4" />
                      <span>Pause Plan</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4" />
                      <span>Resume Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create New Subscription Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-cream-200 my-8">
            <h3 className="text-xl font-bold font-serif text-slate-900 mb-1">
              Start a Daily Meal Subscription
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Choose your neighborhood chef, schedule, and preferences.
            </p>

            <form onSubmit={handleCreateSubscription} className="space-y-4">
              {/* Select Chef Kitchen */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Home Chef</label>
                <select
                  value={selectedSellerId}
                  onChange={(e) => setSelectedSellerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
                >
                  {sellers.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.kitchenName} ({s.address?.locality})
                    </option>
                  ))}
                </select>
              </div>

              {/* Meal Type & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meal Type</label>
                  <select
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
                  >
                    <option value="lunch">Homestyle Lunch</option>
                    <option value="dinner">Homestyle Dinner</option>
                    <option value="breakfast">Traditional Breakfast</option>
                    <option value="all_day">All-Day (3 Meals)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                  <select
                    value={planDuration}
                    onChange={(e) => setPlanDuration(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
                  >
                    <option value="weekly">Weekly (7 Days)</option>
                    <option value="monthly">Monthly (30 Days)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Delivery Time Window</label>
                  <select
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
                  >
                    <option value="07:30 AM - 08:30 AM">07:30 AM - 08:30 AM (Breakfast)</option>
                    <option value="12:30 PM - 01:30 PM">12:30 PM - 01:30 PM (Lunch)</option>
                    <option value="07:30 PM - 08:30 PM">07:30 PM - 08:30 PM (Dinner)</option>
                  </select>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="space-y-2 pt-2 border-t border-cream-200">
                <span className="text-xs font-bold text-slate-800">Daily Delivery Address</span>
                <input
                  type="text"
                  required
                  placeholder="Street / Flat Address"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Locality"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Pincode"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dietary Preferences</label>
                <input
                  type="text"
                  placeholder="e.g. Less spicy, strictly vegetarian, no onions"
                  value={dietaryNotes}
                  onChange={(e) => setDietaryNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-cream-50 border border-cream-300 rounded-xl"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800 transition-colors shadow-md"
                >
                  {creating ? 'Starting Plan...' : 'Confirm Subscription'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealSubscriptions;
