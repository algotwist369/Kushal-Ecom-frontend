import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import ProtectedRoute from './components/common/ProtectedRoute'

import LoginPage from './pages/authPage/LoginPage'
import SignupPage from './pages/authPage/SignupPage'
import UserProfilePage from './pages/UserProfilePage'

import Cart from './components/cart/Cart'
import Checkout from './components/cart/CartCheckout'
import PlaceOrderPage from './components/order/PlaceOrderPage'
import HomePage from './pages/HomePage'
import HeroDetails from './components/homePage/HeroDetails'
import ProductsPage from './pages/ProductsPage'
import ProductDetails from "./components/products/ProductDetails";

import UserOrders from './components/user/UserOrders'
import UserProductDetails from './components/user/UserProductDetails'
import OrderSuccess from './pages/OrderSuccess'
import OrderFailure from './pages/OrderFailure'
import OrderConfirmation from './pages/OrderConfirmation'
import OrderDetails from './pages/OrderDetails'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'

// Product Management
import AdminProducts from './pages/admin/productManagement/AdminProducts'
import AdminProductCreate from './pages/admin/productManagement/AdminProductCreate'
import AdminProductEdit from './pages/admin/productManagement/AdminProductEdit'

// Category Management
import AdminCategories from './pages/admin/categoryManagement/AdminCategories'
import AdminCategoryCreate from './pages/admin/categoryManagement/AdminCategoryCreate'
import AdminCategoryEdit from './pages/admin/categoryManagement/AdminCategoryEdit'

// Order Management
import AdminOrders from './pages/admin/orderManagement/AdminOrders'
import AdminOrderDetails from './pages/admin/orderManagement/AdminOrderDetails'

// User Management
import AdminUsers from './pages/admin/userManagement/AdminUsers'

// Coupon Management
import AdminCoupons from './pages/admin/couponManagement/AdminCoupons'
import AdminCouponCreate from './pages/admin/couponManagement/AdminCouponCreate'
import AdminCouponEdit from './pages/admin/couponManagement/AdminCouponEdit'

// PopUp Management
import AdminPopUps from './pages/admin/popupManagement/AdminPopUps'
import AdminPopUpCreate from './pages/admin/popupManagement/AdminPopUpCreate'
import AdminPopUpEdit from './pages/admin/popupManagement/AdminPopUpEdit'

// Contact Management
import AdminContacts from './pages/admin/contactManagement/AdminContacts'
import AdminContactDetails from './pages/admin/contactManagement/AdminContactDetails'

// Analytics
import AdminAnalytics from './pages/admin/analytics/AdminAnalytics'

// Notifications
import AdminNotifications from './pages/admin/notifications/AdminNotifications'

// About & Contact Pages
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'

// Component to redirect admins away from user pages
const AdminRedirect = ({ children }) => {
  const { user } = useAuth();

  if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

const App = () => {
  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Navbar />

      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<AdminRedirect><HomePage /></AdminRedirect>} />
          <Route path="/:link" element={<AdminRedirect><HeroDetails /></AdminRedirect>} />

          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes - Require Authentication (No Admin Access) */}
          <Route path="/profile" element={<ProtectedRoute><AdminRedirect><UserProfilePage /></AdminRedirect></ProtectedRoute>} />
          <Route path="/my-orders" element={<ProtectedRoute><AdminRedirect><UserOrders /></AdminRedirect></ProtectedRoute>} />
          <Route path="/my-products-details" element={<ProtectedRoute><AdminRedirect><UserProductDetails /></AdminRedirect></ProtectedRoute>} />

          {/* Public Routes (No Admin Access) */}
          <Route path="/products" element={<AdminRedirect><ProductsPage /></AdminRedirect>} />
          <Route path="/products/:productId" element={<AdminRedirect><ProductDetails /></AdminRedirect>} />

          <Route path="/about" element={<AdminRedirect><AboutPage /></AdminRedirect>} />
          <Route path="/contact" element={<AdminRedirect><ContactPage /></AdminRedirect>} />

          {/* Cart & Checkout - Require Authentication (No Admin Access) */}
          <Route path="/cart" element={<AdminRedirect><Cart /></AdminRedirect>} />
          <Route path="/checkout" element={<ProtectedRoute><AdminRedirect><Checkout /></AdminRedirect></ProtectedRoute>} />
          <Route path="/order-confirmation" element={<ProtectedRoute><AdminRedirect><OrderConfirmation /></AdminRedirect></ProtectedRoute>} />
          <Route path="/place-order" element={<ProtectedRoute><AdminRedirect><PlaceOrderPage /></AdminRedirect></ProtectedRoute>} />
          <Route path="/order-success/:orderId" element={<ProtectedRoute><AdminRedirect><OrderSuccess /></AdminRedirect></ProtectedRoute>} />
          <Route path="/order-failure" element={<ProtectedRoute><AdminRedirect><OrderFailure /></AdminRedirect></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><AdminRedirect><UserOrders /></AdminRedirect></ProtectedRoute>} />
          <Route path="/order-details/:orderId" element={<ProtectedRoute><AdminRedirect><OrderDetails /></AdminRedirect></ProtectedRoute>} />

          {/* Admin Routes - Require Admin Role */}
          <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminUsers /></ProtectedRoute>} />
          {/* Product routes - specific routes before general */}
          <Route path="/admin/products/create" element={<ProtectedRoute adminOnly={true}><AdminProductCreate /></ProtectedRoute>} />
          <Route path="/admin/products/edit/:id" element={<ProtectedRoute adminOnly={true}><AdminProductEdit /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute adminOnly={true}><AdminProducts /></ProtectedRoute>} />
          {/* Order routes - specific routes before general */}
          <Route path="/admin/orders/:id" element={<ProtectedRoute adminOnly={true}><AdminOrderDetails /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute adminOnly={true}><AdminOrders /></ProtectedRoute>} />
          {/* Category routes - specific routes before general */}
          <Route path="/admin/categories/create" element={<ProtectedRoute adminOnly={true}><AdminCategoryCreate /></ProtectedRoute>} />
          <Route path="/admin/categories/edit/:id" element={<ProtectedRoute adminOnly={true}><AdminCategoryEdit /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute adminOnly={true}><AdminCategories /></ProtectedRoute>} />
          {/* Coupon routes - specific routes before general */}
          <Route path="/admin/coupons/create" element={<ProtectedRoute adminOnly={true}><AdminCouponCreate /></ProtectedRoute>} />
          <Route path="/admin/coupons/edit/:id" element={<ProtectedRoute adminOnly={true}><AdminCouponEdit /></ProtectedRoute>} />
          <Route path="/admin/coupons" element={<ProtectedRoute adminOnly={true}><AdminCoupons /></ProtectedRoute>} />
          {/* PopUp routes - specific routes before general */}
          <Route path="/admin/popups/create" element={<ProtectedRoute adminOnly={true}><AdminPopUpCreate /></ProtectedRoute>} />
          <Route path="/admin/popups/edit/:id" element={<ProtectedRoute adminOnly={true}><AdminPopUpEdit /></ProtectedRoute>} />
          <Route path="/admin/popups" element={<ProtectedRoute adminOnly={true}><AdminPopUps /></ProtectedRoute>} />
          {/* Contact routes */}
          <Route path="/admin/contacts/:id" element={<ProtectedRoute adminOnly={true}><AdminContactDetails /></ProtectedRoute>} />
          <Route path="/admin/contacts" element={<ProtectedRoute adminOnly={true}><AdminContacts /></ProtectedRoute>} />
          {/* Notifications */}
          <Route path="/admin/notifications" element={<ProtectedRoute adminOnly={true}><AdminNotifications /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute adminOnly={true}><AdminAnalytics /></ProtectedRoute>} />
        </Routes>
      </div>
      <Footer />
    </>
  )
}

export default App
