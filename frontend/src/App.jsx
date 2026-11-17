import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import AboutUs from './pages/AboutUs';
import ExploreFood from './pages/ExploreFood';
import HomeChefs from './pages/HomeChefs';
import FoodDetails from './pages/FoodDetails';
import ChefDetails from './pages/ChefDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import BecomeHomeChef from './pages/BecomeHomeChef';
import ContactUs from './pages/ContactUs';
import FAQ from './pages/FAQ';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MyProfile from './pages/customer/MyProfile';
import MyCart from './pages/customer/MyCart';
import Checkout from './pages/customer/Checkout';
import MyOrders from './pages/customer/MyOrders';
import OrderTracking from './pages/customer/OrderTracking';
import FavouriteFoods from './pages/customer/FavouriteFoods';
import MealSubscriptions from './pages/customer/MealSubscriptions';
import GroupOrders from './pages/customer/GroupOrders';
import FoodRescueDeals from './pages/customer/FoodRescueDeals';
import ReviewsRatings from './pages/customer/ReviewsRatings';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import KitchenProfile from './pages/seller/KitchenProfile';
import AddFood from './pages/seller/AddFood';
import ManageFood from './pages/seller/ManageFood';
import ManageOrders from './pages/seller/ManageOrders';
import ManageSellerSubscriptions from './pages/seller/ManageSubscriptions';
import FreshBatchManagement from './pages/seller/FreshBatchManagement';
import Earnings from './pages/seller/Earnings';
import SellerReviews from './pages/seller/SellerReviews';
import VerificationStatus from './pages/seller/VerificationStatus';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCustomers from './pages/admin/ManageCustomers';
import ManageSellers from './pages/admin/ManageSellers';
import SellerVerification from './pages/admin/SellerVerification';
import ManageProducts from './pages/admin/ManageProducts';
import AdminOrders from './pages/admin/AdminOrders';
import ManageCategories from './pages/admin/ManageCategories';
import ManageCoupons from './pages/admin/ManageCoupons';
import ReportsAnalytics from './pages/admin/ReportsAnalytics';
import CustomerComplaints from './pages/admin/CustomerComplaints';

function App() {
  return (
    <Routes>
      {/* Public Pages inside MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/explore" element={<ExploreFood />} />
        <Route path="/chefs" element={<HomeChefs />} />
        <Route path="/chefs/:id" element={<ChefDetails />} />
        <Route path="/food/:id" element={<FoodDetails />} />
        <Route path="/rescue-deals" element={<FoodRescueDeals />} />
        <Route path="/become-a-chef" element={<BecomeHomeChef />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/cart" element={<MyCart />} />
        <Route path="/group-orders" element={<GroupOrders />} />
        <Route path="/group-orders/:code" element={<GroupOrders />} />
        <Route path="/subscriptions" element={<MealSubscriptions />} />

        {/* Customer Protected Pages with Navbar & Footer */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
              <Checkout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-tracking/:id"
          element={
            <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
              <OrderTracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews/add"
          element={
            <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
              <ReviewsRatings />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Auth Pages (Clean full view) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer Dashboard Area with Sidebar */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['customer', 'seller', 'admin']}>
            <DashboardLayout role="customer" />
          </ProtectedRoute>
        }
      >
        <Route path="/customer/dashboard" element={<CustomerDashboard />} />
        <Route path="/my-profile" element={<MyProfile />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/favorites" element={<FavouriteFoods />} />
        <Route path="/subscriptions/my" element={<MealSubscriptions />} />
        <Route path="/support" element={<ContactUs />} />
      </Route>

      {/* Seller Dashboard Area with Sidebar */}
      <Route
        path="/seller"
        element={
          <ProtectedRoute allowedRoles={['seller', 'admin']}>
            <DashboardLayout role="seller" />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<SellerDashboard />} />
        <Route path="kitchen-profile" element={<KitchenProfile />} />
        <Route path="add-food" element={<AddFood />} />
        <Route path="manage-food" element={<ManageFood />} />
        <Route path="orders" element={<ManageOrders />} />
        <Route path="subscriptions" element={<ManageSellerSubscriptions />} />
        <Route path="freshbatch" element={<FreshBatchManagement />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="reviews" element={<SellerReviews />} />
        <Route path="verification" element={<VerificationStatus />} />
      </Route>

      {/* Admin Dashboard Area with Sidebar */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout role="admin" />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="customers" element={<ManageCustomers />} />
        <Route path="sellers" element={<ManageSellers />} />
        <Route path="verification" element={<SellerVerification />} />
        <Route path="products" element={<ManageProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="categories" element={<ManageCategories />} />
        <Route path="coupons" element={<ManageCoupons />} />
        <Route path="analytics" element={<ReportsAnalytics />} />
        <Route path="support" element={<CustomerComplaints />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
