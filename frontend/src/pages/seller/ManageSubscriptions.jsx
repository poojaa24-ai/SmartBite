import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Clock, MapPin, User, Phone, Check } from 'lucide-react';
import api from '../../services/api';
import EmptyState from '../../components/EmptyState';

const ManageSubscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        setLoading(true);
        const res = await api.get('/subscriptions/seller');
        if (res.data.success) {
          setSubscriptions(res.data.subscriptions);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubs();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
          Meal Subscribers & Dispatch
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Daily tiffin delivery roster and customer dietary preferences
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-white rounded-3xl border border-cream-200 animate-pulse" />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Active Subscribers"
          description="Customers subscribing to your daily meal plans will appear here on your daily kitchen checklist."
        />
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <div
              key={sub._id}
              className="bg-white p-6 rounded-3xl border border-cream-200 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-forest-100 text-forest-900">
                    {sub.planDuration} • {sub.mealType}
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    Slot: {sub.deliveryTimeSlot}
                  </span>
                </div>

                <h3 className="text-base font-bold font-serif text-slate-900">{sub.planTitle}</h3>

                <div className="text-xs text-slate-600 space-y-1">
                  <p className="font-semibold text-slate-900">
                    Customer: {sub.customer?.name} (Phone: {sub.deliveryAddress?.phone})
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{sub.deliveryAddress?.street}, {sub.deliveryAddress?.locality}, {sub.deliveryAddress?.city} - {sub.deliveryAddress?.pincode}</span>
                  </p>
                  {sub.dietaryNotes && (
                    <p className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-medium">
                      Special Diet Note: {sub.dietaryNotes}
                    </p>
                  )}
                </div>
              </div>

              {/* Progress & Status */}
              <div className="text-right space-y-2 shrink-0">
                <span className="text-xs font-bold text-slate-700 block">
                  Delivered {sub.deliveredMeals} of {sub.totalMeals} Meals
                </span>
                <span className="text-lg font-black font-serif text-forest-900 block">
                  ₹{sub.totalAmount}
                </span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                  sub.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {sub.status.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageSubscriptions;
