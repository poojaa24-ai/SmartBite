import React from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Heart,
  Calendar,
  Users,
  User,
  ShieldCheck,
  PlusCircle,
  Package,
  Clock,
  DollarSign,
  Star,
  Layers,
  TicketPercent,
  BarChart3,
  LifeBuoy,
  LogOut,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

const DashboardLayout = ({ role = 'customer' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  let navItems = [];

  if (role === 'customer') {
    navItems = [
      { to: '/customer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/my-orders', label: 'My Orders', icon: ShoppingBag },
      { to: '/my-profile', label: 'Profile & Addresses', icon: User },
      { to: '/favorites', label: 'Favorite Foods', icon: Heart },
      { to: '/subscriptions/my', label: 'Meal Subscriptions', icon: Calendar },
      { to: '/group-orders', label: 'Community Group Orders', icon: Users },
      { to: '/support', label: 'Help & Complaints', icon: LifeBuoy },
    ];
  } else if (role === 'seller') {
    navItems = [
      { to: '/seller/dashboard', label: 'Overview', icon: LayoutDashboard },
      { to: '/seller/orders', label: 'Live Orders', icon: ShoppingBag },
      { to: '/seller/freshbatch', label: 'FreshBatch Portions', icon: Clock },
      { to: '/seller/add-food', label: 'Add Food Item', icon: PlusCircle },
      { to: '/seller/manage-food', label: 'Manage Food Menu', icon: Package },
      { to: '/seller/subscriptions', label: 'Meal Subscribers', icon: Calendar },
      { to: '/seller/earnings', label: 'Earnings & Payouts', icon: DollarSign },
      { to: '/seller/kitchen-profile', label: 'Kitchen Profile', icon: UtensilsCrossed },
      { to: '/seller/verification', label: 'Verification & FSSAI', icon: ShieldCheck },
      { to: '/seller/reviews', label: 'Customer Reviews', icon: Star },
    ];
  } else if (role === 'admin') {
    navItems = [
      { to: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
      { to: '/admin/verification', label: 'Seller Verification', icon: ShieldCheck },
      { to: '/admin/sellers', label: 'Manage Home Chefs', icon: UtensilsCrossed },
      { to: '/admin/customers', label: 'Manage Customers', icon: Users },
      { to: '/admin/products', label: 'Manage Food Listings', icon: Package },
      { to: '/admin/orders', label: 'Global Orders', icon: ShoppingBag },
      { to: '/admin/categories', label: 'Food Categories', icon: Layers },
      { to: '/admin/coupons', label: 'Promo Coupons', icon: TicketPercent },
      { to: '/admin/analytics', label: 'Platform Analytics', icon: BarChart3 },
      { to: '/admin/support', label: 'Customer Complaints', icon: LifeBuoy },
    ];
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 sticky top-28">
            {/* User Mini Profile Header */}
            <div className="flex items-center gap-3 pb-5 mb-5 border-b border-slate-100">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={user?.name}
                className="w-12 h-12 rounded-2xl object-cover ring-2 ring-forest-700/20"
              />
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 truncate">{user?.name}</h4>
                <p className="text-xs text-slate-500 capitalize">{user?.role} Portal</p>
                {role === 'seller' && user?.sellerProfile && (
                  <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md ${
                    user.sellerProfile.verificationStatus === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {user.sellerProfile.verificationStatus}
                  </span>
                )}
              </div>
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/customer/dashboard' || item.to === '/seller/dashboard' || item.to === '/admin/dashboard'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-forest-900 text-white shadow-md shadow-forest-900/15'
                          : 'text-slate-600 hover:text-forest-950 hover:bg-slate-100'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Bottom Actions */}
            <div className="pt-5 mt-5 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Dashboard Main View Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
