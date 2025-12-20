import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';
import ForgotPassword from './pages/auth/ForgotPassword';
import ForgotPasswordOTP from './pages/auth/ForgotPasswordOTP';
import ResetPassword from './pages/auth/ResetPassword';

// Main Pages
import Dashboard from './pages/Dashboard';
import Restaurants from './pages/Restaurants';
import RestaurantMenu from './pages/RestaurantMenu';
import Menu from './pages/Menu';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import OrderManagement from './pages/OrderManagement';
import MyRestaurant from './pages/MyRestaurant';
import MyMenu from './pages/MyMenu';
import Users from './pages/Users';
import Locations from './pages/Locations';
import Payments from './pages/Payments';
import MenuItems from './pages/MenuItems';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#fff',
                color: '#333',
                borderRadius: '12px',
                border: '1px solid #fed7aa',
              },
              success: {
                iconTheme: {
                  primary: '#f97316',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/forgot-password-otp" element={<ForgotPasswordOTP />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Protected Routes */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              {/* Admin & Restaurant Owner */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Restaurant Owner */}
              <Route path="/my-restaurant" element={<MyRestaurant />} />
              <Route path="/my-menu" element={<MyMenu />} />
              <Route path="/order-management" element={<OrderManagement />} />

              {/* Admin only */}
              <Route path="/users" element={<Users />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/menu-items" element={<MenuItems />} />

              {/* Customer & General */}
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/restaurants/:id/menu" element={<RestaurantMenu />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-confirmation/:orderId" element={<OrderConfirmation />} />
              <Route path="/orders" element={<Orders />} />
            </Route>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/restaurants" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  </ErrorBoundary>
  );
}

export default App;