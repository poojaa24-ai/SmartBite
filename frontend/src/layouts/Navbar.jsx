import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  ShoppingCart,
  User,
  LogOut,
  LayoutDashboard,
  Search,
  Sparkles,
  Calendar,
  Users,
  Menu,
  X,
  ChevronDown,
  ShieldCheck,
  ChefHat,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { user, logout, isSeller, isAdmin } = useAuth();
  const { totalItemsCount } = useCart();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cream-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Tagline */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-forest-800 to-forest-950 flex items-center justify-center text-white shadow-md shadow-forest-900/20">
              <UtensilsCrossed className="w-6 h-6 text-accent-400" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-forest-950 font-serif">
                Smart<span className="text-accent-500">Bite</span>
              </span>
              <span className="hidden sm:block text-[11px] font-medium tracking-wide uppercase text-slate-500">
                Homemade Happiness, Delivered Fresh
              </span>
            </div>
          </Link>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center flex-1 max-w-md mx-4 relative"
          >
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search homemade dishes, regional rotti, biryani..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-cream-50 border border-cream-300 rounded-full focus:outline-none focus:ring-2 focus:ring-forest-800 focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
            />
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-700">
            <Link to="/explore" className="hover:text-forest-800 transition-colors">
              Explore Food
            </Link>
            <Link to="/chefs" className="hover:text-forest-800 transition-colors">
              Home Chefs
            </Link>
            <Link to="/subscriptions" className="hover:text-forest-800 flex items-center gap-1.5 transition-colors">
              <Calendar className="w-4 h-4 text-accent-500" />
              Meal Plans
            </Link>
            <Link to="/rescue-deals" className="hover:text-forest-800 flex items-center gap-1.5 transition-colors text-accent-600 font-semibold">
              <Flame className="w-4 h-4 text-accent-500 animate-pulse" />
              Rescue Deals
            </Link>
            <Link to="/group-orders" className="hover:text-forest-800 flex items-center gap-1.5 transition-colors">
              <Users className="w-4 h-4 text-forest-700" />
              Group Order
            </Link>
          </nav>

          {/* Action Buttons & Profile */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-full bg-cream-100 hover:bg-cream-200 text-forest-900 transition-colors flex items-center justify-center"
              aria-label="View Shopping Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-in zoom-in">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* User Dropdown / Auth CTA */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pl-3 rounded-full border border-cream-300 hover:border-forest-700 transition-all bg-white"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <span className="text-xs font-semibold text-slate-800 max-w-[90px] truncate hidden sm:inline">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-cream-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-medium text-slate-400">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md bg-forest-100 text-forest-800">
                        {user.role}
                      </span>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-forest-50 hover:text-forest-900 font-medium"
                      >
                        <ShieldCheck className="w-4 h-4 text-forest-700" />
                        Admin Master Panel
                      </Link>
                    )}

                    {isSeller && (
                      <Link
                        to="/seller/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-forest-50 hover:text-forest-900 font-medium"
                      >
                        <ChefHat className="w-4 h-4 text-forest-700" />
                        Chef Kitchen Dashboard
                      </Link>
                    )}

                    <Link
                      to="/customer/dashboard"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-cream-100"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-500" />
                      Customer Dashboard
                    </Link>

                    <Link
                      to="/my-orders"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-cream-100"
                    >
                      <UtensilsCrossed className="w-4 h-4 text-slate-500" />
                      My Orders
                    </Link>

                    <Link
                      to="/my-profile"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-cream-100"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      Profile & Addresses
                    </Link>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-forest-900 hover:text-forest-700 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-forest-900 hover:bg-forest-800 rounded-full shadow-md shadow-forest-900/10 transition-all"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-cream-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-cream-200 py-4 space-y-3 animate-in slide-in-from-top-3">
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search homemade dishes..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-cream-100 rounded-full border border-cream-300"
              />
            </form>
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-800 rounded-lg hover:bg-cream-100"
            >
              Explore Food
            </Link>
            <Link
              to="/chefs"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-800 rounded-lg hover:bg-cream-100"
            >
              Home Chefs
            </Link>
            <Link
              to="/subscriptions"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-800 rounded-lg hover:bg-cream-100"
            >
              Daily Meal Plans
            </Link>
            <Link
              to="/rescue-deals"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-accent-600 rounded-lg hover:bg-cream-100 font-semibold"
            >
              Food Rescue Deals
            </Link>
            <Link
              to="/group-orders"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-slate-800 rounded-lg hover:bg-cream-100"
            >
              Community Group Orders
            </Link>
            <Link
              to="/become-a-chef"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 text-base font-medium text-forest-800 rounded-lg hover:bg-cream-100"
            >
              Become a Home Chef
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
