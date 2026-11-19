import { useEffect, useState } from 'react';
import {
  ShoppingBag, TrendingUp, Clock,
  Loader2, ShoppingCart, Store, UtensilsCrossed,
  CheckCircle, AlertCircle, Coins, Users,
  Plus, Star, MapPin, Search, Sparkles, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { orderApi, restaurantApi, menuItemApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const { getCartCount, getCartTotal, addToCart, cartItems } = useCart();
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState(null);
  const [allRestaurants, setAllRestaurants] = useState([]);
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [foodSearch, setFoodSearch] = useState('');

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

        // Fetch restaurants and menu items to display immediately on login!
        try {
          const [restRes, menuRes] = await Promise.all([
            restaurantApi.getAll(),
            menuItemApi.getAll(),
          ]);
          const restData = Array.isArray(restRes.data) ? restRes.data : restRes.data?.content || [];
          const menuData = Array.isArray(menuRes.data) ? menuRes.data : menuRes.data?.content || [];
          setAllRestaurants(restData);
          setAllMenuItems(menuData);
        } catch (err) {
          console.log('Could not fetch restaurants or menu items:', err);
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

  const handleAddToCart = (item) => {
    const itemWithRestaurant = {
      ...item,
      restaurantId: item.restaurant?.id || item.restaurantId,
      restaurantName: item.restaurant?.name || item.restaurantName || 'Restaurant',
    };
    const added = addToCart(itemWithRestaurant);
    if (added) {
      toast.success(`${item.name} added to cart!`, { icon: '🛒' });
    }
  };

  const foodCategories = [
    { value: '', label: 'All Dishes', icon: '🍽️' },
    { value: 'MAIN_COURSE', label: 'Main Courses', icon: '🍔' },
    { value: 'APPETIZER', label: 'Appetizers', icon: '🥗' },
    { value: 'SIDE_DISH', label: 'Sides', icon: '🍟' },
    { value: 'DESSERT', label: 'Desserts', icon: '🍰' },
    { value: 'BEVERAGE', label: 'Drinks', icon: '🥤' },
  ];

  const filteredFoods = allMenuItems.filter((item) => {
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    const term = foodSearch.toLowerCase();
    const matchesSearch = !term ||
      item.name?.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.restaurant?.name?.toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  });

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
    <div className="space-y-10">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 rounded-3xl p-8 md:p-10 text-white relative overflow-hidden shadow-xl shadow-orange-500/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Handpicked Food From Kigali's Best Kitchens
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
            {getGreeting()}, {user?.firstName || 'Food Lover'}! 🍔
          </h1>
          <p className="text-white/90 text-base md:text-lg mb-6">
            Craving something delicious? Order from Philbert's Kitchen, Divine Delights, and more.
          </p>

          {/* Quick Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={foodSearch}
              onChange={(e) => setFoodSearch(e.target.value)}
              placeholder="Search burgers, wings, tilapia, katogo..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-gray-900 placeholder-gray-400 font-medium shadow-lg outline-none focus:ring-4 focus:ring-white/30 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Featured Kitchens Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Store className="w-6 h-6 text-orange-500" /> Featured Kitchens & Restaurants
            </h2>
            <p className="text-sm text-gray-500 mt-1">Discover popular places creating fresh meals for you</p>
          </div>
          <Link
            to="/restaurants"
            className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 hover:gap-2 transition-all"
          >
            All Restaurants <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {allRestaurants.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-orange-100">
            <Store className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">Loading restaurants...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allRestaurants.map((r) => (
              <Link
                key={r.id}
                to={`/restaurants/${r.id}/menu`}
                className="group bg-white rounded-2xl overflow-hidden border border-orange-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="relative h-44 overflow-hidden bg-gray-100">
                  <img
                    src={r.imageUrl || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&fit=crop'}
                    alt={r.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&fit=crop';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="px-2 py-0.5 bg-orange-500/90 rounded-md text-xs font-semibold backdrop-blur">
                      ⭐ 4.8 Highly Rated
                    </span>
                    <h3 className="text-lg font-bold mt-1 text-white truncate drop-shadow">{r.name}</h3>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-gray-500 line-clamp-2 mb-3">{r.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-600">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span className="truncate">{r.address || 'Kigali, Rwanda'}</span>
                    </span>
                    <span className="font-semibold text-orange-600 group-hover:translate-x-0.5 transition-transform">
                      View Menu →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Slap the Food in Your Face - Popular Dishes Grid */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UtensilsCrossed className="w-6 h-6 text-orange-500" /> Delicious Dishes Across Restaurants
            </h2>
            <p className="text-sm text-gray-500 mt-1">Tap (+) to add straight to your cart and satisfy your cravings</p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {foodCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.value
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                    : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-orange-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {filteredFoods.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-orange-100 shadow-sm">
            <div className="text-5xl mb-3">🍲</div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No dishes match your filter</h3>
            <p className="text-sm text-gray-500 mb-4">Try clearing your search or picking another category</p>
            <button
              onClick={() => { setSelectedCategory(''); setFoodSearch(''); }}
              className="px-5 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
            >
              Show All Dishes
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredFoods.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl overflow-hidden border border-orange-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Food Image */}
                <div className="relative h-48 overflow-hidden bg-orange-50">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&fit=crop'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&fit=crop';
                    }}
                  />
                  {item.category && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 bg-black/60 text-white rounded-lg text-xs font-semibold backdrop-blur">
                      {item.category.replace('_', ' ')}
                    </span>
                  )}
                  {item.restaurant?.name && (
                    <span className="absolute bottom-3 left-3 px-2.5 py-1 bg-orange-600/90 text-white rounded-lg text-xs font-bold backdrop-blur shadow">
                      📍 {item.restaurant.name}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900 text-base mb-1 group-hover:text-orange-600 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                      {item.description || 'Deliciously prepared with authentic ingredients'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-xs text-gray-400 block font-medium">Price</span>
                      <span className="text-lg font-extrabold text-orange-600">
                        {formatCurrency(item.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 hover:shadow-lg transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Account Overview & Stats */}
      <div className="pt-6 border-t border-orange-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Your Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-orange-100 p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Cart Total</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(getCartTotal())}</p>
              <p className="text-xs text-orange-600 font-semibold mt-1">{getCartCount()} items in cart</p>
            </div>
            <Link to="/cart" className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center hover:bg-orange-200 transition-colors">
              <ShoppingCart className="w-6 h-6" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-orange-100 p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
              <p className="text-xs text-green-600 font-semibold mt-1">Lifetime orders</p>
            </div>
            <Link to="/orders" className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-200 transition-colors">
              <ShoppingBag className="w-6 h-6" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-orange-100 p-6 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalSpent)}</p>
              <p className="text-xs text-gray-400 font-medium mt-1">All time</p>
            </div>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
