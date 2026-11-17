import React, { useState, useEffect } from 'react';
import { Package, Search, Trash2, Power, Star } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const ManageProducts = () => {
  const { success, error } = useToast();
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchAllFoods = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/foods?limit=50&search=${encodeURIComponent(search)}`);
      if (res.data.success) {
        setFoods(res.data.foods);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllFoods();
  }, [search]);

  const handleToggle = async (food) => {
    try {
      const res = await api.put(`/foods/${food._id}`, { isAvailable: !food.isAvailable });
      if (res.data.success) {
        success(`${food.name} availability toggled.`);
        fetchAllFoods();
      }
    } catch (err) {
      error(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this food listing from the platform?')) return;
    try {
      const res = await api.delete(`/foods/${id}`);
      if (res.data.success) {
        success('Food listing deleted.');
        setFoods(foods.filter((f) => f._id !== id));
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
            Manage Food Listings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global catalog of all homemade dishes across all registered home kitchens
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dish by name..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-cream-300 rounded-full"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-cream-200 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-cream-100/70 border-b border-cream-200 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">Dish Name</th>
                <th className="py-4 px-6">Home Kitchen</th>
                <th className="py-4 px-6">Category & Type</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">FreshBatch</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-100">
              {foods.map((food) => (
                <tr key={food._id} className="hover:bg-cream-50/50 transition-colors">
                  <td className="py-4 px-6 flex items-center gap-3">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-10 h-10 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block">{food.name}</span>
                      <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {food.rating} ({food.numReviews})
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-800">
                    {food.seller?.kitchenName || 'Kitchen'}
                  </td>
                  <td className="py-4 px-6">
                    <span className="block">{food.category?.name || food.categoryName}</span>
                    <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold ${
                      food.isVeg ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {food.isVeg ? 'Veg' : 'Non-Veg'}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-bold font-serif text-slate-900">
                    ₹{food.price}
                  </td>
                  <td className="py-4 px-6 font-medium">
                    {food.freshBatch?.availablePortions ?? 0} / {food.freshBatch?.totalPortions ?? 20}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      food.isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {food.isAvailable ? 'Active' : 'Unlisted'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => handleToggle(food)}
                      className="px-2.5 py-1 rounded-lg bg-cream-100 hover:bg-cream-200 text-[11px] font-bold text-slate-700"
                    >
                      {food.isAvailable ? 'Delist' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDelete(food._id)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
