import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Sparkles, X, ChevronDown } from 'lucide-react';
import api from '../services/api';
import FoodCard from '../components/FoodCard';
import { FoodCardSkeleton } from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';

const ExploreFood = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Filters state initialized from query params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [isVeg, setIsVeg] = useState(searchParams.get('isVeg') === 'true');
  const [minRating, setMinRating] = useState(searchParams.get('minRating') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'rating');
  const [page, setPage] = useState(1);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data.success) setCategories(res.data.categories);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCats();
  }, []);

  // Fetch foods whenever filters change
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        let url = `/foods?page=${page}&limit=12&sort=${sort}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (category) url += `&category=${category}`;
        if (isVeg) url += `&isVeg=true`;
        if (minRating) url += `&minRating=${minRating}`;

        const res = await api.get(url);
        if (res.data.success) {
          setFoods(res.data.foods);
          setTotal(res.data.total);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, [search, category, isVeg, minRating, sort, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearchParams({ search, category, isVeg: isVeg ? 'true' : '', sort });
  };

  const handleCategorySelect = (catSlug) => {
    const newCat = category === catSlug ? '' : catSlug;
    setCategory(newCat);
    setPage(1);
  };

  const clearAllFilters = () => {
    setSearch('');
    setCategory('');
    setIsVeg(false);
    setMinRating('');
    setSort('rating');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 font-serif">Explore Homemade Food</h1>
          <p className="text-xs text-slate-500 mt-1">
            Showing {foods.length} of {total} freshly prepared dishes from verified home kitchens
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes or ingredients..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-cream-300 rounded-full focus:outline-none focus:ring-2 focus:ring-forest-800"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-forest-900 text-white rounded-full text-xs font-bold hover:bg-forest-800 transition-colors shadow-sm shrink-0"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleCategorySelect('')}
          className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
            category === ''
              ? 'bg-forest-900 text-white shadow-md'
              : 'bg-white border border-cream-300 text-slate-700 hover:bg-cream-100'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat._id}
            onClick={() => handleCategorySelect(cat.slug)}
            className={`px-4 py-2 rounded-full text-xs font-bold shrink-0 transition-all ${
              category === cat.slug
                ? 'bg-forest-900 text-white shadow-md'
                : 'bg-white border border-cream-300 text-slate-700 hover:bg-cream-100'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Filter & Sort Bar */}
      <div className="bg-white p-4 rounded-2xl border border-cream-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
        <div className="flex flex-wrap items-center gap-4">
          {/* Pure Veg Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isVeg}
              onChange={(e) => {
                setIsVeg(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
            />
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              Pure Veg Only
            </span>
          </label>

          {/* Rating Filter */}
          <div className="flex items-center gap-1.5 border-l border-slate-200 pl-4">
            <span className="text-slate-500">Min Rating:</span>
            <select
              value={minRating}
              onChange={(e) => {
                setMinRating(e.target.value);
                setPage(1);
              }}
              className="bg-cream-50 border border-cream-300 rounded-lg px-2 py-1 text-slate-700 focus:outline-none"
            >
              <option value="">Any</option>
              <option value="4.5">4.5+ ★</option>
              <option value="4.8">4.8+ ★</option>
            </select>
          </div>

          {(search || category || isVeg || minRating) && (
            <button
              onClick={clearAllFilters}
              className="text-red-600 hover:text-red-700 font-bold ml-2 underline"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Sort by:</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-cream-50 border border-cream-300 rounded-xl px-3 py-1.5 text-slate-800 font-semibold focus:outline-none"
          >
            <option value="rating">Top Customer Rating</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="time">Fastest Preparation</option>
            <option value="newest">Newly Listed</option>
          </select>
        </div>
      </div>

      {/* Foods Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <FoodCardSkeleton key={i} />
          ))}
        </div>
      ) : foods.length === 0 ? (
        <EmptyState
          title="No Dishes Match Your Search"
          description="Try relaxing your filters or search for another delicious homemade delicacy."
          actionText="Clear All Filters"
          onAction={clearAllFilters}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {foods.map((food) => (
            <FoodCard key={food._id} food={food} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExploreFood;
