import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles, ShieldCheck, Flame, Users, Calendar } from 'lucide-react';

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(0);

  const faqs = [
    {
      q: 'What is FreshBatch and how does it guarantee freshness?',
      a: 'Unlike commercial restaurants that cook in industrial bulks or store refrigerated sauces for weeks, SmartBite home chefs commit to a strict "FreshBatch" portion cap every day (e.g. only 20 portions of Jolada Rotti Oota). Food is prepared fresh from scratch every morning. Once the daily batch portions are booked, the system automatically marks it sold out for the day.',
      category: 'FreshBatch',
      icon: Sparkles,
    },
    {
      q: 'How does SmartBite verify home kitchens and food safety?',
      a: 'Every home chef on SmartBite undergoes a multi-point verification process: personal ID verification, kitchen hygiene inspection, and FSSAI registration compliance. Chefs must also disclose complete ingredient lists and allergen declarations for every dish. We display verified badges only after official administrative approval.',
      category: 'Safety',
      icon: ShieldCheck,
    },
    {
      q: 'What are Food Rescue Deals and how do they reduce waste?',
      a: 'Food Rescue Deals allow home kitchens to offer remaining portions of their daily batch at 40%–50% discounted rates before their kitchen closes (e.g., between 8:00 PM and 9:30 PM). Customers get fresh, high-quality homemade meals at affordable prices while eliminating avoidable domestic food waste.',
      category: 'Rescue Deals',
      icon: Flame,
    },
    {
      q: 'How do Daily Meal Subscriptions work?',
      a: 'Customers can subscribe to weekly (7-day) or monthly (30-day) meal plans for Breakfast, Lunch, Dinner, or All-Day combos. Your meal is automatically scheduled and delivered warm to your home or office during your preferred time window. You can easily pause days or cancel your subscription anytime via your customer dashboard.',
      category: 'Subscriptions',
      icon: Calendar,
    },
    {
      q: 'How do Community Group Orders work?',
      a: 'Anyone can start a group order and share the unique 6-character code or link with colleagues, friends, or roommates. Everyone adds their own favorite dishes from the selected home kitchen. Individual subtotals are tracked separately so there is zero confusion, and the host locks and places the consolidated order in one checkout.',
      category: 'Group Orders',
      icon: Users,
    },
    {
      q: 'How can I register as a Home Chef and sell on SmartBite?',
      a: 'Click "Become a Home Chef", create a seller account, and submit your kitchen details along with your FSSAI registration number and ID proof. Once approved by our team, you can immediately add homemade dishes, set daily FreshBatch portion limits, and begin receiving orders with weekly direct bank payouts.',
      category: 'Chefs',
      icon: HelpCircle,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <span className="px-3 py-1 rounded-full bg-forest-900 text-white text-xs font-bold uppercase tracking-wider">
          Got Questions?
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-serif">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-slate-600">
          Everything you need to know about SmartBite, FreshBatch portions, and homemade food safety.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIdx === index;
          const Icon = faq.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-sm transition-all"
            >
              <button
                onClick={() => setOpenIdx(isOpen ? -1 : index)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-forest-900 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cream-100 flex items-center justify-center text-forest-800 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-base font-serif">{faq.q}</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-forest-900' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-0 text-sm text-slate-600 leading-relaxed border-t border-slate-50 mt-1 pl-16">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQ;
