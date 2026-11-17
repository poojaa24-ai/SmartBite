import React, { useState, useEffect } from 'react';
import { ChefHat, ShieldCheck, MapPin, Star, Search, ArrowRight } from 'lucide-react';
import api from '../../services/api';

const ManageSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchSellers = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/sellers?search=${encodeURIComponent(search)}`);
        if (res.data.success) {
          setSellers(res.data.sellers);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSellers();
  }, [search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
            Manage Home Chefs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Registered kitchen profiles, cuisines, orders completed, and hygiene status
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search kitchen or city..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-cream-300 rounded-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.map((s) => (
          <div
            key={s._id}
            className="bg-white rounded-3xl p-6 border border-cream-200 shadow-soft flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                    s.verificationStatus === 'approved'
                      ? 'bg-emerald-100 text-emerald-800'
                      : s.verificationStatus === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {s.verificationStatus}
                </span>

                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{s.rating}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <img
                  src={s.logo || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=150&q=80'}
                  alt={s.kitchenName}
                  className="w-12 h-12 rounded-2xl object-cover shrink-0"
                />
                <div>
                  <h3 className="text-base font-bold font-serif text-slate-900 leading-tight">
                    {s.kitchenName}
                  </h3>
                  <p className="text-xs text-slate-500">{s.user?.name} ({s.phone})</p>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-cream-100">
                <p>
                  <span className="font-bold">Location:</span> {s.address?.locality}, {s.address?.city}
                </p>
                <p>
                  <span className="font-bold">FSSAI Number:</span> {s.fssaiNumber || 'Pending'}
                </p>
                <p>
                  <span className="font-bold">Orders Completed:</span> {s.totalOrdersCompleted}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-cream-100 flex justify-between items-center">
              <span className="text-xs font-serif font-black text-forest-900">
                ₹{s.totalEarnings.toLocaleString()} Earned
              </span>
              <a
                href={`/chefs/${s._id}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-forest-900 text-white text-xs font-bold hover:bg-forest-800 transition-colors"
              >
                View Kitchen
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageSellers;
