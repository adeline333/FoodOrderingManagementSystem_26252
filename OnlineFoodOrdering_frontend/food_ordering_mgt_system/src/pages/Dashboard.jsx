import { useEffect, useState } from 'react';
import {
  ShoppingBag, TrendingUp, Clock,
  Loader2, ShoppingCart, Store, UtensilsCrossed,
  CheckCircle, AlertCircle, Coins, Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderApi, restaurantApi, menuItemApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency, formatDateTime } from '../utils/helpers';

const Dashboard = () => {
  const { user } = useAuth();
  const { getCartCount, getCartTotal } = useCart();
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);

  // Stats for different roles
  const [stats, setStats] = useState({
    // Customer stats
    totalOrders: 0,
    totalSpent: 0,
    recentOrders: [],
    // Restaurant owner stats
    restaurantOrders: 0,
    restaurantRevenue: 0,
    pendingOrders: 0,
    menuItemCount: 0,
    recentRestaurantOrders: [],
  });

  const isRestaurantOwner = user?.role === 'RESTAURANT_OWNER';
  const isAdmin = user?.role === 'ADMIN';

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      if (isRestaurantOwner) {
        // Load restaurant owner data
        const restResponse = await restaurantApi.getAll();
        const restaurants = Array.isArray(restResponse.data) ? restResponse.data : [];
        const myRestaurant = restaurants.find(r => r.owner?.id === user?.id || r.ownerId === user?.id);

        if (myRestaurant) {
          setRestaurant(myRestaurant);

          // Get restaurant stats
          const [statsRes, ordersRes, menuRes] = await Promise.all([
            orderApi.getRestaurantStats(myRestaurant.id),
            orderApi.getByRestaurant(myRestaurant.id),
            menuItemApi.getByRestaurant(myRestaurant.id),
          ]);

          const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
          const menuItems = Array.isArray(menuRes.data) ? menuRes.data : [];

          setStats({
            ...stats,
            restaurantOrders: statsRes.data?.totalOrders || 0,
            restaurantRevenue: statsRes.data?.totalRevenue || 0,
            pendingOrders: statsRes.data?.pendingOrders || 0,
            menuItemCount: menuItems.length,
            recentRestaurantOrders: orders.slice(0, 5),
          });
        }
      } else if (isAdmin) {
        // Load admin data - all orders
        const ordersRes = await orderApi.getAll();
        const orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
        const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);

        setStats({
          ...stats,
          totalOrders: orders.length,
          totalSpent: totalRevenue,
          recentOrders: orders.slice(0, 5),
        });
      } else {
        // Load customer data
        let orders = [];
        if (user?.id) {
          try {
            const ordersRes = await orderApi.getByCustomer(user.id);
            orders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
          } catch (err) {
            console.log('Could not fetch orders:', err);
          }
        }

        const totalSpent = orders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);

        setStats({
          ...stats,
          totalOrders: orders.length,
          totalSpent,
          recentOrders: orders.slice(0, 3),
        });
      }
    } catch (error) {
      console.error('Dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getStatusEmoji = (status) => {
    const emojis = {
      PENDING: '⏳',
      CONFIRMED: '✅',
      PREPARING: '👨‍🍳',
      ON_THE_WAY: '🚴',
      DELIVERED: '🎉',
      CANCELLED: '❌',
    };
    return emojis[status] || '📦';
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PREPARING: 'bg-purple-100 text-purple-800',
      ON_THE_WAY: 'bg-orange-100 text-orange-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  // Restaurant Owner Dashboard
  if (isRestaurantOwner) {
    return (
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative">
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, {user?.firstName || 'there'}! 👨‍🍳
            </h1>
            <p className="text-white/80 mb-6">
              {restaurant ? `Managing ${restaurant.name}` : 'Set up your restaurant to get started'}
            </p>
            <div className="flex flex-wrap gap-4">
              {restaurant ? (
                <>
                  <Link
                    to="/my-menu"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg"
                  >
                    <UtensilsCrossed className="w-5 h-5" />
                    Manage Menu
                  </Link>
                  <Link
                    to="/order-management"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors backdrop-blur"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    View Orders
                  </Link>
                </>
              ) : (
                <Link
                  to="/my-restaurant"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg"
                >
                  <Store className="w-5 h-5" />
                  Create Restaurant
                </Link>
              )}
            </div>
          </div>
        </div>

        {restaurant ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Total Orders */}
              <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.restaurantOrders}</p>
                    <p className="text-sm text-green-600 font-medium mt-1 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" /> All time
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <ShoppingBag className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Revenue */}
              <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {formatCurrency(stats.restaurantRevenue)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Lifetime earnings</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Coins className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Pending Orders */}
              <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.pendingOrders}</p>
                    <p className="text-sm text-orange-600 font-medium mt-1 flex items-center gap-1">
                      {stats.pendingOrders > 0 ? (
                        <>
                          <AlertCircle className="w-4 h-4" /> Needs attention
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" /> All caught up
                        </>
                      )}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Menu Items</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.menuItemCount}</p>
                    <Link to="/my-menu" className="text-sm text-orange-600 font-medium mt-1 hover:underline">
                      Manage menu →
                    </Link>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <UtensilsCrossed className="w-7 h-7 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl border border-orange-100 shadow-sm">
              <div className="p-6 border-b border-orange-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-500" />
                  Recent Orders
                </h2>
                <Link
                  to="/order-management"
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                  View All →
                </Link>
              </div>
              <div className="p-6">
                {stats.recentRestaurantOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📦</div>
                    <p className="text-gray-500">No orders yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Orders will appear here when customers order from your restaurant
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recentRestaurantOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{getStatusEmoji(order.status)}</span>
                          <div>
                            <p className="font-bold text-gray-900">Order #{order.id}</p>
                            <p className="text-xs text-gray-500">
                              {order.customer?.firstName} {order.customer?.lastName} • {formatDateTime(order.orderDate)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                          <p className="font-bold text-green-600">{formatCurrency(order.totalAmount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/my-menu"
                className="flex items-center gap-4 p-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg"
              >
                <UtensilsCrossed className="w-8 h-8" />
                <div>
                  <p className="font-bold text-lg">Manage Menu</p>
                  <p className="text-sm text-white/80">Add or edit menu items</p>
                </div>
              </Link>
              <Link
                to="/order-management"
                className="flex items-center gap-4 p-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl text-white hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
              >
                <ShoppingBag className="w-8 h-8" />
                <div>
                  <p className="font-bold text-lg">Manage Orders</p>
                  <p className="text-sm text-white/80">Update order statuses</p>
                </div>
              </Link>
              <Link
                to="/my-restaurant"
                className="flex items-center gap-4 p-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
              >
                <Store className="w-8 h-8" />
                <div>
                  <p className="font-bold text-lg">Restaurant Profile</p>
                  <p className="text-sm text-white/80">Edit restaurant details</p>
                </div>
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-orange-100">
            <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Store className="w-16 h-16 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Restaurant Yet</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Create your restaurant to start receiving orders and managing your menu.
            </p>
            <Link
              to="/my-restaurant"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold"
            >
              <Store className="w-5 h-5" />
              Create My Restaurant
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Admin Dashboard
  if (isAdmin) {
    return (
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative">
            <h1 className="text-3xl font-bold mb-2">
              {getGreeting()}, Admin! 🛡️
            </h1>
            <p className="text-white/80 mb-6">
              System overview and management
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                <ShoppingBag className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalSpent)}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Coins className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Recent Activity</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.recentOrders.length}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/users" className="p-4 bg-white rounded-xl border border-orange-100 text-center hover:shadow-md transition-shadow">
            <Users className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="font-semibold text-gray-900">Manage Users</p>
          </Link>
          <Link to="/restaurants" className="p-4 bg-white rounded-xl border border-orange-100 text-center hover:shadow-md transition-shadow">
            <Store className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="font-semibold text-gray-900">Restaurants</p>
          </Link>
          <Link to="/order-management" className="p-4 bg-white rounded-xl border border-orange-100 text-center hover:shadow-md transition-shadow">
            <ShoppingBag className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="font-semibold text-gray-900">Orders</p>
          </Link>
          <Link to="/payments" className="p-4 bg-white rounded-xl border border-orange-100 text-center hover:shadow-md transition-shadow">
            <Coins className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="font-semibold text-gray-900">Payments</p>
          </Link>
        </div>
      </div>
    );
  }

  // Customer Dashboard (default)
  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

        <div className="relative">
          <h1 className="text-3xl font-bold mb-2">
            {getGreeting()}, {user?.firstName || 'there'}! 👋
          </h1>
          <p className="text-white/80 mb-6">
            Ready to order something delicious today?
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/restaurants"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-colors shadow-lg"
            >
              🍕 Browse Restaurants
            </Link>
            {getCartCount() > 0 && (
              <Link
                to="/cart"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl font-semibold hover:bg-white/30 transition-colors backdrop-blur"
              >
                <ShoppingCart className="w-5 h-5" />
                View Cart ({getCartCount()})
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cart Value */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Cart Value</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(getCartTotal())}
              </p>
              <p className="text-sm text-gray-500 mt-1">{getCartCount()} items</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
              <p className="text-sm text-green-600 font-medium mt-1 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> All time
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <ShoppingBag className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {formatCurrency(stats.totalSpent)}
              </p>
              <p className="text-sm text-gray-500 mt-1">Lifetime value</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Coins className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-orange-100 shadow-sm">
          <div className="p-6 border-b border-orange-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Recent Orders
            </h2>
            <Link
              to="/orders"
              className="text-sm font-semibold text-orange-600 hover:text-orange-700"
            >
              View All →
            </Link>
          </div>
          <div className="p-6">
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-gray-500">No orders yet</p>
                <Link
                  to="/restaurants"
                  className="inline-block mt-4 text-orange-600 font-semibold hover:text-orange-700"
                >
                  Place your first order →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-100"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getStatusEmoji(order.status)}</span>
                      <div>
                        <p className="font-bold text-gray-900">Order #{order.id}</p>
                        <p className="text-xs text-gray-500">{order.status}</p>
                      </div>
                    </div>
                    <p className="font-bold text-green-600">{formatCurrency(order.totalAmount)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            ⚡ Quick Actions
          </h2>
          <div className="space-y-3">
            <Link
              to="/restaurants"
              className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
            >
              <span className="text-2xl">🍔</span>
              <div>
                <p className="font-semibold">Order Food</p>
                <p className="text-xs text-gray-400">Browse restaurants</p>
              </div>
            </Link>
            <Link
              to="/cart"
              className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
            >
              <span className="text-2xl">🛒</span>
              <div>
                <p className="font-semibold">View Cart</p>
                <p className="text-xs text-gray-400">{getCartCount()} items</p>
              </div>
            </Link>
            <Link
              to="/orders"
              className="flex items-center gap-3 p-4 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
            >
              <span className="text-2xl">📦</span>
              <div>
                <p className="font-semibold">Track Orders</p>
                <p className="text-xs text-gray-400">View order status</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
