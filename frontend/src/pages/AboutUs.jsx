import React from 'react';
import { ShieldCheck, Heart, Sparkles, UtensilsCrossed, Award, Users, CheckCircle } from 'lucide-react';

const AboutUs = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="px-3 py-1 rounded-full bg-forest-900 text-white text-xs font-bold uppercase tracking-wider">
          Our Story & Mission
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 font-serif">
          Reviving Authentic Homestyle Cooking in Every Neighborhood
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          SmartBite was born from a simple realization: in an era of industrial cloud kitchens and frozen commercial food, the true soul of cooking resides in home kitchens.
        </p>
      </div>

      {/* Story & Image Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-white rounded-3xl p-8 sm:p-12 border border-cream-200 shadow-soft">
        <div className="space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-900">
            From Family Recipes to Local Entrepreneurship
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Across India, millions of mothers, grandmothers, and culinary artisans prepare exquisite regional dishes that commercial restaurants cannot replicate: hand-patted Jolada Rottis, wood-dum biryanis, and sun-dried podis made from heritage recipes.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            SmartBite provides home cooks with a dignified, technology-powered marketplace to share their passion and earn sustainable livelihoods without the crushing overhead of commercial restaurants.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-cream-200">
            <div>
              <span className="text-3xl font-black text-forest-900 font-serif">100%</span>
              <p className="text-xs text-slate-500 font-medium mt-1">Homestyle Authenticity</p>
            </div>
            <div>
              <span className="text-3xl font-black text-forest-900 font-serif">0%</span>
              <p className="text-xs text-slate-500 font-medium mt-1">Artificial Preservatives</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl overflow-hidden shadow-xl aspect-video lg:aspect-square">
          <img
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80"
            alt="Home Chef Preparing Food"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Core Values */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-forest-100 flex items-center justify-center text-forest-800">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-serif">Verified Hygiene & FSSAI</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            We inspect every home kitchen, verify food safety compliance, and ensure transparent ingredient disclosure and allergen warnings.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-800">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-serif">FreshBatch Integrity</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Our proprietary FreshBatch system ensures home chefs prepare only limited, fresh portions daily. Once a batch is sold out, it is done for the day.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-cream-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-serif">Zero Food Waste</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Through Food Rescue Deals, remaining daily portions are offered to the community at discounted prices before closing, eliminating avoidable food waste.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
