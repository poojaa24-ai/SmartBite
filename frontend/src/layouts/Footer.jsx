import React from 'react';
import { Link } from 'react-router-dom';
import { UtensilsCrossed, ShieldCheck, Heart, Sparkles, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-forest-950 text-white mt-auto border-t border-forest-900">
      {/* Top Banner */}
      <div className="border-b border-forest-900/60 bg-forest-900/40">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-forest-800/80 flex items-center justify-center shrink-0 text-accent-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Verified Home Kitchens</h4>
              <p className="text-xs text-forest-200/80">Every chef is inspected with verified food safety standards & FSSAI registration.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-forest-800/80 flex items-center justify-center shrink-0 text-accent-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">FreshBatch Daily Prep</h4>
              <p className="text-xs text-forest-200/80">Never mass produced or frozen. Home chefs cook limited, fresh portions every morning.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center md:justify-start">
            <div className="w-12 h-12 rounded-2xl bg-forest-800/80 flex items-center justify-center shrink-0 text-accent-400">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-base">Empowering Homemakers</h4>
              <p className="text-xs text-forest-200/80">Supporting passionate culinary artists, mothers & culinary elders in our neighborhoods.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-14 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-5 gap-10">
        {/* Brand Description */}
        <div className="md:col-span-2 space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-800 flex items-center justify-center text-accent-400">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <span className="text-2xl font-bold font-serif tracking-tight">
              Smart<span className="text-accent-400">Bite</span>
            </span>
          </Link>
          <p className="text-sm text-forest-200/80 leading-relaxed max-w-sm">
            SmartBite is the hyper-local culinary marketplace connecting conscious food lovers with genuine home chefs. Relish authentic regional delicacies, zero preservatives, and heartfelt family heritage recipes.
          </p>
          <div className="text-xs text-forest-300/80 space-y-1 pt-2">
            <p className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent-400" />
              Headquarters: Koramangala 5th Block, Bangalore, Karnataka
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-accent-400" />
              Support: +91 80 4912 3456
            </p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent-400" />
              support@smartbite.com
            </p>
          </div>
        </div>

        {/* Explore Links */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-accent-400 mb-4">Marketplace</h4>
          <ul className="space-y-2.5 text-sm text-forest-200/80">
            <li><Link to="/explore" className="hover:text-white transition-colors">Explore All Foods</Link></li>
            <li><Link to="/chefs" className="hover:text-white transition-colors">Featured Home Kitchens</Link></li>
            <li><Link to="/subscriptions" className="hover:text-white transition-colors">Daily Meal Plans</Link></li>
            <li><Link to="/rescue-deals" className="hover:text-white transition-colors">Food Rescue Deals</Link></li>
            <li><Link to="/group-orders" className="hover:text-white transition-colors">Community Group Orders</Link></li>
          </ul>
        </div>

        {/* Home Chefs */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-accent-400 mb-4">For Home Chefs</h4>
          <ul className="space-y-2.5 text-sm text-forest-200/80">
            <li><Link to="/become-a-chef" className="hover:text-white transition-colors">Become a Seller</Link></li>
            <li><Link to="/seller/dashboard" className="hover:text-white transition-colors">Kitchen Dashboard</Link></li>
            <li><Link to="/seller/verification" className="hover:text-white transition-colors">Food Safety Guidelines</Link></li>
            <li><Link to="/faq" className="hover:text-white transition-colors">Chef FAQs & Earnings</Link></li>
          </ul>
        </div>

        {/* Company & Support */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-accent-400 mb-4">Company</h4>
          <ul className="space-y-2.5 text-sm text-forest-200/80">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Help & Contact</Link></li>
            <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
            <li><span className="text-xs text-forest-300">FSSAI Central Compliant</span></li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-forest-900 py-6 text-center text-xs text-forest-400">
        <p>© 2026 SmartBite Inc. All rights reserved. Crafted with authentic homestyle passion.</p>
      </div>
    </footer>
  );
};

export default Footer;
