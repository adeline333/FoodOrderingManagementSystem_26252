import { useState, useEffect } from 'react';
import {
  ShoppingBag, Eye, Clock, CheckCircle, Truck, Package,
  XCircle, Loader2, ChefHat, RefreshCw, Search
} from 'lucide-react';
import { Modal } from '../components/common/Modal';
import { orderApi, restaurantApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDateTime, formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const OrderManagement = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [restaurant, setRestaurant] = useState(null);

  const isRestaurantOwner = user?.role === 'RESTAURANT_OWNER';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let ordersData = [];

      if (isRestaurantOwner && user?.id) {
        // Use the dedicated endpoint to get owner's restaurants
        const restResponse = await restaurantApi.getByOwner(user.id);
        const restaurants = Array.isArray(restResponse.data) ? restResponse.data : [];

        if (restaurants.length > 0) {
          const myRestaurant = restaurants[0];
          setRestaurant(myRestaurant);
          // Get orders for this restaurant
          const response = await orderApi.getByRestaurant(myRestaurant.id);
          ordersData = Array.isArray(response.data) ? response.data : [];
        }
      } else {
        // Admin sees all orders
        const response = await orderApi.getAll();
        ordersData = Array.isArray(response.data) ? response.data : response.data?.content || [];
      }

      ordersData.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const response = await orderApi.updateStatus(orderId, newStatus);
      console.log('Order update response:', response);
      toast.success(`Order #${orderId} updated to ${newStatus.replace('_', ' ')}`);
      // Update local state immediately for better UX
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Error updating order:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const openViewModal = (order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        icon: Clock,
        emoji: '⏳',
        label: 'Pending',
        nextStatus: 'CONFIRMED',
        nextLabel: 'Confirm Order'
      },
      CONFIRMED: {
        color: 'bg-blue-100 text-blue-700 border-blue-200',
        icon: CheckCircle,
        emoji: '✅',
        label: 'Confirmed',
        nextStatus: 'PREPARING',
        nextLabel: 'Start Preparing'
      },
      PREPARING: {
        color: 'bg-purple-100 text-purple-700 border-purple-200',
        icon: Package,
        emoji: '👨‍🍳',
        label: 'Preparing',
        nextStatus: 'ON_THE_WAY',
        nextLabel: 'Out for Delivery'
      },
      ON_THE_WAY: {
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        icon: Truck,
        emoji: '🚴',
        label: 'On the Way',
        nextStatus: 'DELIVERED',
        nextLabel: 'Mark Delivered'
      },
      DELIVERED: {
        color: 'bg-green-100 text-green-700 border-green-200',
        icon: CheckCircle,
        emoji: '🎉',
        label: 'Delivered',
        nextStatus: null,
        nextLabel: null
      },
      CANCELLED: {
        color: 'bg-red-100 text-red-700 border-red-200',
        icon: XCircle,
        emoji: '❌',
        label: 'Cancelled',
        nextStatus: null,
        nextLabel: null
      },
    };
    return configs[status] || configs.PENDING;
  };

  // Filter orders by status and search term
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesSearch = searchTerm === '' ||
      order.id?.toString().includes(searchTerm) ||
      order.customer?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.deliveryAddress?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const orderCounts = {
    ALL: orders.length,
    PENDING: orders.filter(o => o.status === 'PENDING').length,
    CONFIRMED: orders.filter(o => o.status === 'CONFIRMED').length,
    PREPARING: orders.filter(o => o.status === 'PREPARING').length,
    ON_THE_WAY: orders.filter(o => o.status === 'ON_THE_WAY').length,
    DELIVERED: orders.filter(o => o.status === 'DELIVERED').length,
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-orange-500" />
            Order Management
          </h1>
          <p className="text-gray-500 mt-1">
            {isRestaurantOwner && restaurant
              ? `Manage orders for ${restaurant.name}`
              : 'Manage and update customer orders'}
          </p>
        </div>
        <button
          onClick={loadOrders}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-xl font-medium hover:bg-orange-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by order ID, customer name, email, or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-orange-100 rounded-xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
        />
      </div>

      {/* Status Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'ALL', label: 'All Orders', emoji: '📋' },
          { key: 'PENDING', label: 'Pending', emoji: '⏳' },
          { key: 'CONFIRMED', label: 'Confirmed', emoji: '✅' },
          { key: 'PREPARING', label: 'Preparing', emoji: '👨‍🍳' },
          { key: 'ON_THE_WAY', label: 'On the Way', emoji: '🚴' },
          { key: 'DELIVERED', label: 'Delivered', emoji: '🎉' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
              statusFilter === tab.key
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                : 'bg-white border border-orange-200 text-gray-700 hover:bg-orange-50'
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              statusFilter === tab.key ? 'bg-white/20' : 'bg-orange-100'
            }`}>
              {orderCounts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-orange-100">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No orders found</h2>
          <p className="text-gray-500">
            {statusFilter === 'ALL' ? 'No orders yet' : `No ${statusFilter.toLowerCase().replace('_', ' ')} orders`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            const isUpdating = updatingOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
              >
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center text-2xl shrink-0">
                        🍔
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 text-lg">Order #{order.id}</span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusConfig.color}`}>
                            {statusConfig.emoji} {statusConfig.label}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-gray-500 space-y-1">
                          <p>📍 {order.deliveryAddress || 'No address specified'}</p>
                          <p>👤 {order.customer?.firstName} {order.customer?.lastName} {order.customer?.phone && `• ${order.customer.phone}`}</p>
                          <p>🕐 {order.orderDate ? formatDateTime(order.orderDate) : 'Recently'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(order.totalAmount)}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* View Details */}
                        <button
                          onClick={() => openViewModal(order)}
                          className="p-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        {/* Next Status Action */}
                        {statusConfig.nextStatus && (
                          <button
                            onClick={() => updateOrderStatus(order.id, statusConfig.nextStatus)}
                            disabled={isUpdating}
                            className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            {isUpdating ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            {statusConfig.nextLabel}
                          </button>
                        )}

                        {/* Cancel Button (only for pending/confirmed) */}
                        {['PENDING', 'CONFIRMED'].includes(order.status) && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                            disabled={isUpdating}
                            className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50"
                            title="Cancel Order"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  {order.orderItems && order.orderItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-orange-100">
                      <p className="text-sm text-gray-500 mb-2">Items:</p>
                      <div className="flex flex-wrap gap-2">
                        {order.orderItems.slice(0, 3).map((item, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm"
                          >
                            {item.menuItem?.name || 'Item'} × {item.quantity}
                          </span>
                        ))}
                        {order.orderItems.length > 3 && (
                          <span className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm">
                            +{order.orderItems.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Order Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={`📦 Order #${selectedOrder?.id}`}
        showFooter={false}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-center">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${getStatusConfig(selectedOrder.status).color}`}>
                {getStatusConfig(selectedOrder.status).emoji}
                {getStatusConfig(selectedOrder.status).label}
              </span>
            </div>

            {/* Customer Info */}
            <div className="bg-blue-50 rounded-xl p-4 space-y-2">
              <p className="text-sm text-gray-500 mb-1">👤 Customer Details</p>
              <p className="font-semibold text-gray-900">
                {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}
              </p>
              {selectedOrder.customer?.email && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  📧 {selectedOrder.customer.email}
                </p>
              )}
              {selectedOrder.customer?.phone && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  📞 {selectedOrder.customer.phone}
                </p>
              )}
              {selectedOrder.customer?.location && (
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  📍 {selectedOrder.customer.location.name}
                </p>
              )}
            </div>

            {/* Order Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Order Date</p>
                <p className="font-semibold text-gray-900">
                  {selectedOrder.orderDate ? formatDateTime(selectedOrder.orderDate) : 'Recently'}
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                <p className="font-bold text-xl text-green-600">{formatCurrency(selectedOrder.totalAmount)}</p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500 mb-1">📍 Delivery Address</p>
              <p className="font-medium text-gray-900">{selectedOrder.deliveryAddress || 'Not specified'}</p>
            </div>

            {/* Order Items */}
            {selectedOrder.orderItems && selectedOrder.orderItems.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">🍽️ Order Items</p>
                <div className="border border-orange-100 rounded-xl divide-y divide-orange-100 overflow-hidden">
                  {selectedOrder.orderItems.map((item, index) => (
                    <div key={index} className="p-4 flex justify-between items-center bg-white">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">🍔</span>
                        <div>
                          <span className="font-medium text-gray-900">{item.menuItem?.name || 'Item'}</span>
                          <span className="text-gray-400 ml-2">× {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-bold text-green-600">{formatCurrency(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            {getStatusConfig(selectedOrder.status).nextStatus && (
              <div className="pt-4 border-t border-orange-100">
                <button
                  onClick={() => {
                    updateOrderStatus(selectedOrder.id, getStatusConfig(selectedOrder.status).nextStatus);
                    setIsViewModalOpen(false);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  {getStatusConfig(selectedOrder.status).nextLabel}
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default OrderManagement;
