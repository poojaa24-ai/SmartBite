import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, MapPin, Sparkles } from 'lucide-react';
import api from '../services/api';
import ChefCard from '../components/ChefCard';
import EmptyState from '../components/EmptyState';

const HomeChefs = () => {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');

  useEffect(() => {
    const fetchChefs = async () => {
      try {
        setLoading(true);
        let url = `/sellers?search=${encodeURIComponent(search)}`;
        if (cuisineFilter) url += `&cuisine=${encodeURIComponent(cuisineFilter)}`;

        const res = await api.get(url);
        if (res.data.success) {
          setChefs(res.data.sellers);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChefs();
  }, [search, cuisineFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-forest-900/10 text-forest-900 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Domestic Kitchens</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 font-serif">Discover Local Home Chefs</h1>
          <p className="text-sm text-slate-600 mt-1">
            Meet the talented home cooks crafting authentic regional flavors with love and hygiene
          </p>
        </div>

        {/* Search */}
        <div className="flex gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search kitchen or cuisine..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-cream-300 rounded-full focus:outline-none focus:ring-2 focus:ring-forest-800"
            />
          </div>
        </div>
      </div>

      {/* Chefs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl h-72 border border-cream-200 animate-pulse" />
          ))}
        </div>
      ) : chefs.length === 0 ? (
        <EmptyState
          title="No Home Chefs Found"
          description="Try searching with a different cuisine name or location."
          actionText="Clear Search"
          onAction={() => {
            setSearch('');
            setCuisineFilter('');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {chefs.map((seller) => (
            <ChefCard key={seller._id} seller={seller} />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeChefs;
