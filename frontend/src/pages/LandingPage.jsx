import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Search,
  Sparkles,
  Flame,
  ShieldCheck,
  Heart,
  Users,
  Calendar,
  Clock,
  ArrowRight,
  Star,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import api from '../services/api';
import FoodCard from '../components/FoodCard';
import ChefCard from '../components/ChefCard';
import { FoodCardSkeleton } from '../components/LoadingSkeleton';

const LandingPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [rescueDeals, setRescueDeals] = useState([]);
  const [topChefs, setTopChefs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKey, setSearchKey] = useState('');

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        setLoading(true);
        const [catRes, foodRes, dealRes, chefRes, recRes] = await Promise.all([
          api.get('/categories'),
          api.get('/foods?limit=6&sort=rating'),
          api.get('/foods/rescue-deals'),
          api.get('/sellers?limit=4'),
          api.get('/recommendations'),
        ]);

        if (catRes.data.success) setCategories(catRes.data.categories);
        if (foodRes.data.success) setFeaturedFoods(foodRes.data.foods);
        if (dealRes.data.success) setRescueDeals(dealRes.data.deals);
        if (chefRes.data.success) setTopChefs(chefRes.data.sellers);
        if (recRes.data.success) setRecommendations(recRes.data.recommendations);
      } catch (err) {
        console.error('Error fetching landing page data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  const handleHeroSearch = (e) => {
    e.preventDefault();
    if (searchKey.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchKey.trim())}`);
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-24 bg-gradient-to-b from-cream-100 via-cream-50 to-white">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-forest-900/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Trust Badge Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-forest-900/10 text-forest-900 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-forest-800" />
                <span>100% Verified Home Kitchens • Zero Preservatives</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 font-serif tracking-tight leading-[1.15]">
                Homemade Happiness,{' '}
                <span className="text-forest-900 relative inline-block">
                  Delivered Fresh.
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-accent-500 opacity-80"
                    viewBox="0 0 100 12"
                    preserveAspectRatio="none"
                  >
                    <path d="M0,8 Q50,0 100,8" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Discover authentic regional culinary treasures prepared in home kitchens by passionate mothers and seasoned culinary elders. Hand-crafted daily in strictly limited portions.
              </p>

              {/* Search Bar */}
              <form
                onSubmit={handleHeroSearch}
                className="max-w-xl mx-auto lg:mx-0 bg-white p-2 rounded-3xl shadow-xl shadow-forest-900/5 border border-cream-200 flex flex-col sm:flex-row gap-2"
              >
                <div className="flex-1 flex items-center pl-3">
                  <Search className="w-5 h-5 text-slate-400 shrink-0 mr-2" />
                  <input
                    type="text"
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    placeholder="Search Jolada Rotti, Akki Rotti, Dum Biryani..."
                    className="w-full py-2.5 text-sm bg-transparent focus:outline-none text-slate-800 placeholder:text-slate-400 font-medium"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 rounded-2xl bg-forest-900 text-white font-bold text-sm hover:bg-forest-800 transition-all shadow-md shadow-forest-900/20 shrink-0 flex items-center justify-center gap-2"
                >
                  <span>Explore Dishes</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick stats pills */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>FreshBatch™ Daily Portions</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified FSSAI Standards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero Commercial Additives</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                {/* Main Hero Image */}
                <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] relative">
                  <img
                    src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80"
                    alt="Authentic Homemade Thali"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="px-3 py-1 rounded-full bg-accent-500 text-[11px] font-black uppercase tracking-wider">
                      Chef Spotlight
                    </span>
                    <h3 className="text-xl font-bold font-serif mt-2">Annapurna Amma's Kitchen</h3>
                    <p className="text-xs text-forest-200 mt-1">North Karnataka Jolada Rotti & Yennegai Oota</p>
                  </div>
                </div>

                {/* Floating FreshBatch Card */}
                <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-cream-200 max-w-[220px] animate-in fade-in slide-in-from-left-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800">
                      FreshBatch Live
                    </span>
                  </div>
                  <p className="text-xs font-bold text-forest-950 font-serif">Jolada Rotti Oota</p>
                  <div className="text-[11px] text-slate-600 mt-1 flex justify-between">
                    <span>Available:</span>
                    <span className="font-extrabold text-forest-800">11 / 25 Portions</span>
                  </div>
                  <div className="w-full bg-cream-200 rounded-full h-1.5 mt-1 overflow-hidden">
                    <div className="bg-forest-700 h-full w-[44%]" />
                  </div>
                </div>

                {/* Floating Rating Pill */}
                <div className="absolute -top-4 -right-4 bg-white p-3 rounded-2xl shadow-xl border border-cream-200 flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                    <Star className="w-5 h-5 fill-amber-500" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 block leading-tight">4.9 / 5.0</span>
                    <span className="text-[10px] text-slate-500">Over 1,200+ Reviews</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES BROWSER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-accent-600 block mb-1">
              Curated Collections
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
              Explore Regional Cuisines
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs font-bold text-forest-800 hover:text-forest-950 flex items-center gap-1 group"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/explore?category=${cat.slug}`}
              className="bg-white p-4 rounded-3xl border border-cream-200 hover:border-forest-700 hover:shadow-soft transition-all duration-300 text-center group flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-2xl overflow-hidden mb-3 group-hover:scale-105 transition-transform duration-300">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 group-hover:text-forest-800 transition-colors line-clamp-1">
                {cat.name}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {cat.itemCount || '6'} homemade options
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FEATURE 3: FOOD RESCUE DEALS TICKER & SHOWCASE */}
      {rescueDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-accent-700 via-accent-600 to-amber-600 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
              <Flame className="w-96 h-96 -mr-16 -mb-16" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold uppercase tracking-wider mb-2">
                  <Flame className="w-4 h-4 animate-bounce" />
                  <span>Feature 3: Food Waste Reduction</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black font-serif">
                  Food Rescue Deals: Flash 40%–50% Off
                </h2>
                <p className="text-sm text-accent-100 max-w-xl mt-1.5 leading-relaxed">
                  Home kitchens list their remaining fresh portions at discounted rates before closing time. Delicious, fresh, and zero food waste!
                </p>
              </div>
              <Link
                to="/rescue-deals"
                className="px-6 py-2.5 rounded-full bg-white text-accent-700 font-bold text-sm hover:bg-accent-50 transition-colors shadow-md shrink-0 flex items-center justify-center gap-2"
              >
                <span>View All Rescue Deals</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Rescue Deal Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rescueDeals.slice(0, 3).map((deal) => (
                <div
                  key={deal._id}
                  className="bg-white rounded-2xl p-4 text-slate-800 shadow-lg flex gap-4 items-center"
                >
                  <img
                    src={deal.image}
                    alt={deal.name}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase text-accent-600 tracking-wider">
                      Pickup by {deal.rescueDeal.pickupDeadline}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 truncate">{deal.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{deal.seller?.kitchenName}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-extrabold text-forest-900 font-serif">
                          ₹{deal.rescueDeal.discountedPrice}
                        </span>
                        <span className="text-xs text-slate-400 line-through">
                          ₹{deal.rescueDeal.originalPrice}
                        </span>
                      </div>
                      <Link
                        to={`/food/${deal._id}`}
                        className="px-3 py-1 rounded-xl bg-accent-500 hover:bg-accent-600 text-white text-xs font-bold transition-colors"
                      >
                        Reserve
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. FEATURE 1: FRESHBATCH FEATURED DISHES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-forest-800 mb-1">
              <Sparkles className="w-4 h-4 text-accent-500" />
              <span>Feature 1: FreshBatch Daily Preparation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
              Today's Fresh Homemade Specials
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-xs font-bold text-forest-800 hover:text-forest-950 flex items-center gap-1 group"
          >
            <span>Explore Full Menu</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <FoodCardSkeleton />
            <FoodCardSkeleton />
            <FoodCardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredFoods.map((food) => (
              <FoodCard key={food._id} food={food} />
            ))}
          </div>
        )}
      </section>

      {/* 5. FEATURE 6: SMART FOOD DISCOVERY TEASER */}
      {recommendations.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-cream-100/70 py-12 rounded-3xl border border-cream-200">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="px-3 py-1 rounded-full bg-forest-900 text-white text-xs font-bold uppercase tracking-wider">
              Smart Food Discovery Engine
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif mt-2">
              Recommended For Your Taste
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Multi-factor transparent algorithm matching your dietary preferences, favorite cuisines, and top customer ratings.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map((food) => (
              <div key={food._id} className="relative">
                {/* Reason Pill */}
                <div className="bg-forest-900 text-accent-300 text-[10px] font-bold px-3 py-1 rounded-t-2xl flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3 h-3 text-accent-400" />
                  <span>{food.recommendationReason}</span>
                </div>
                <FoodCard food={food} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. TOP HOME CHEFS (FEATURE 5: VERIFIED KITCHENS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-forest-800 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Feature 5: Verified Home Kitchens</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif">
              Meet Local Home Chefs
            </h2>
          </div>
          <Link
            to="/chefs"
            className="text-xs font-bold text-forest-800 hover:text-forest-950 flex items-center gap-1 group"
          >
            <span>View All Home Chefs</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {topChefs.map((seller) => (
            <ChefCard key={seller._id} seller={seller} />
          ))}
        </div>
      </section>

      {/* 7. FEATURES 2 & 4 SPOTLIGHT: SUBSCRIPTIONS & GROUP ORDERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Daily Meal Subscriptions Banner */}
          <div className="bg-gradient-to-br from-forest-950 to-forest-900 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
              <Calendar className="w-64 h-64 -mr-10 -mt-10" />
            </div>
            <div>
              <span className="text-xs font-bold text-accent-400 uppercase tracking-wider block mb-2">
                Feature 2: Daily Meal Subscriptions
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-serif">
                Never Worry About Lunch or Dinner Again.
              </h3>
              <p className="text-sm text-forest-200 mt-3 leading-relaxed">
                Subscribe to weekly or monthly homestyle tiffin meal plans cooked by your chosen neighborhood home chef. Scheduled delivery, pause anytime.
              </p>
            </div>
            <div className="mt-8">
              <Link
                to="/subscriptions"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent-500 hover:bg-accent-600 text-white font-bold text-sm shadow-md transition-colors"
              >
                <span>Browse Subscription Plans</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Community Group Order Banner */}
          <div className="bg-gradient-to-br from-cream-100 to-cream-200 text-slate-900 p-8 rounded-3xl border border-cream-300 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
              <Users className="w-64 h-64 -mr-10 -mt-10" />
            </div>
            <div>
              <span className="text-xs font-bold text-forest-800 uppercase tracking-wider block mb-2">
                Feature 4: Community Group Orders
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-serif">
                Ordering for Office, Roommates or Family?
              </h3>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Start a group order and share the link! Everyone picks their favorite homemade dishes, individual subtotals are tracked, and the host checks out together.
              </p>
            </div>
            <div className="mt-8">
              <Link
                to="/group-orders"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-forest-900 hover:bg-forest-800 text-white font-bold text-sm shadow-md transition-colors"
              >
                <span>Start Group Order</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-accent-600 block mb-2">
          Simple & Transparent
        </span>
        <h2 className="text-3xl font-black text-slate-900 font-serif mb-12">
          How SmartBite Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm relative">
            <span className="text-4xl font-black font-serif text-forest-800/20 absolute top-6 right-6">
              01
            </span>
            <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-900 flex items-center justify-center font-bold text-lg mb-5">
              <Search className="w-6 h-6 text-forest-800" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">1. Discover Home Kitchens</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explore authentic regional menus from verified home chefs near you. Filter by vegetarian, spice level, or allergens.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm relative">
            <span className="text-4xl font-black font-serif text-forest-800/20 absolute top-6 right-6">
              02
            </span>
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg mb-5">
              <Clock className="w-6 h-6 text-amber-800" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">2. FreshBatch Preparation</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dishes are cooked in limited daily batches using family heirloom recipes, fresh ingredients and zero artificial colors.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm relative">
            <span className="text-4xl font-black font-serif text-forest-800/20 absolute top-6 right-6">
              03
            </span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-lg mb-5">
              <UtensilsCrossed className="w-6 h-6 text-emerald-800" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">3. Delivered Warm & Tracked</h4>
            <p className="text-sm text-slate-600 leading-relaxed">
              Track your meal live with real-time updates as the chef finishes cooking, packs in food-safe containers, and dispatches.
            </p>
          </div>
        </div>
      </section>

      {/* 9. BECOME A HOME CHEF CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-forest-900 to-forest-950 rounded-3xl p-8 sm:p-14 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl">
          <div className="max-w-xl space-y-3">
            <span className="px-3 py-1 rounded-full bg-accent-500 text-white text-xs font-bold uppercase tracking-wider">
              Earn From Your Kitchen
            </span>
            <h3 className="text-3xl sm:text-4xl font-black font-serif">
              Are You a Passionate Home Cook?
            </h3>
            <p className="text-sm text-forest-200 leading-relaxed">
              Turn your kitchen into an earning powerhouse. Set your own menu, daily batch limits, and prices. We handle customer discovery, online payments, and support.
            </p>
          </div>
          <Link
            to="/become-a-chef"
            className="px-8 py-3.5 rounded-full bg-white text-forest-950 hover:bg-cream-100 font-extrabold text-sm shadow-xl transition-all shrink-0"
          >
            Register as a Home Chef
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
