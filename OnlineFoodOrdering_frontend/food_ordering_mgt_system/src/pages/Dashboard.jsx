import { useEffect, useState } from 'react';
import { 
  Users, 
  Store, 
  ShoppingBag, 
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Card } from '../components/common/Card';
import { userApi, restaurantApi, orderApi } from '../services/api';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRestaurants: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    loading: true,
  });

  // ✔️ Safe effect (no warnings)
  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [usersRes, restaurantsRes, ordersRes] = await Promise.all([
          userApi.getAll(),
          restaurantApi.getAll(),
          orderApi.getAll(),
        ]);

        if (!isMounted) return;

        const orders = ordersRes.data;
        const totalRevenue = orders.reduce(
          (sum, order) => sum + (order.totalAmount || 0),
          0
        );

        setStats({
          totalUsers: usersRes.data.length,
          totalRestaurants: restaurantsRes.data.length,
          totalOrders: orders.length,
          totalRevenue,
          recentOrders: orders.slice(-5).reverse(),
          loading: false,
        });
      } catch (error) {
        console.error('Error loading dashboard:', error);
        toast.error('Failed to load dashboard data');

        if (isMounted) {
          setStats(prev => ({ ...prev, loading: false }));
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false; // ✔️ Prevent memory leaks
    };
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue',
      change: '+12%',
      trend: 'up',
    },
    {
      title: 'Restaurants',
      value: stats.totalRestaurants,
      icon: Store,
      color: 'green',
      change: '+8%',
      trend: 'up',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'purple',
      change: '+23%',
      trend: 'up',
    },
    {
      title: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'orange',
      change: '+15%',
      trend: 'up',
    },
  ];

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            orange: 'bg-orange-100 text-orange-600',
          };

          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <h3 className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendIcon className={`w-4 h-4 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card title="Recent Orders" className="mt-6">
        <div className="space-y-4">
          {stats.recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent orders</p>
          ) : (
            stats.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${order.totalAmount}</p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'DELIVERED'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Restaurant</h3>
            <p className="text-gray-600 text-sm mb-4">Register a new restaurant to the platform</p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Add Now
            </button>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Manage Users</h3>
            <p className="text-gray-600 text-sm mb-4">View and manage platform users</p>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              View Users
            </button>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">View Orders</h3>
            <p className="text-gray-600 text-sm mb-4">Track and manage all orders</p>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              View Orders
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
