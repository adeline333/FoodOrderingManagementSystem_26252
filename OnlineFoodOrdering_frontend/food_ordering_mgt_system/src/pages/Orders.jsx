import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Eye, Clock, CheckCircle, Truck, Package, XCircle, Loader2, Search, X } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Modal } from '../components/common/Modal';
import { orderApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatDateTime, formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const Orders = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const highlightId = searchParams.get('highlight');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [highlightedOrder, setHighlightedOrder] = useState(null);
  const highlightRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  // Handle highlighting from global search
  useEffect(() => {
    if (highlightId && orders.length > 0) {
      const orderId = parseInt(highlightId);
      setHighlightedOrder(orderId);
      // Find and open the order modal
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setTimeout(() => {
          if (highlightRef.current) {
            highlightRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
          // Auto-open the order details
          setSelectedOrder(order);
          setIsViewModalOpen(true);
        }, 500);
      }
      // Remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightedOrder(null);
        navigate('/orders', { replace: true });
      }, 3000);
    }
  }, [highlightId, orders, navigate]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      let response;
      try {
        if (user?.id) {
          response = await orderApi.getByCustomer(user.id);
        } else {
          response = await orderApi.getAll();
        }
      } catch  {
        response = await orderApi.getAll();
      }
      
      const ordersData = Array.isArray(response.data) ? response.data : response.data?.content || [];
      ordersData.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
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
        label: 'Pending'
      },
      CONFIRMED: { 
        color: 'bg-blue-100 text-blue-700 border-blue-200', 
        icon: CheckCircle, 
        emoji: '✅',
        label: 'Confirmed'
      },
      PREPARING: { 
        color: 'bg-purple-100 text-purple-700 border-purple-200', 
        icon: Package, 
        emoji: '👨‍🍳',
        label: 'Preparing'
      },
      ON_THE_WAY: { 
        color: 'bg-indigo-100 text-indigo-700 border-indigo-200', 
        icon: Truck, 
        emoji: '🚴',
        label: 'On the Way'
      },
      DELIVERED: { 
        color: 'bg-green-100 text-green-700 border-green-200', 
        icon: CheckCircle, 
        emoji: '🎉',
        label: 'Delivered'
      },
      CANCELLED: { 
        color: 'bg-red-100 text-red-700 border-red-200', 
        icon: XCircle, 
        emoji: '❌',
        label: 'Cancelled'
      },
    };
    return configs[status] || configs.PENDING;
  };

  const getOrderEmoji = (index) => {
    const emojis = ['🍔', '🍕', '🌮', '🍜', '🍣', '🥗', '🍝', '🍛'];
    return emojis[index % emojis.length];
  };

  // Filter orders by search term and status
  const filteredOrders = orders.filter((order) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      order.id?.toString().includes(term) ||
      order.status?.toLowerCase().includes(term) ||
      order.deliveryAddress?.toLowerCase().includes(term) ||
      order.totalAmount?.toString().includes(term) ||
      order.customer?.firstName?.toLowerCase().includes(term) ||
      order.customer?.lastName?.toLowerCase().includes(term) ||
      order.customer?.email?.toLowerCase().includes(term);

    const matchesStatus = statusFilter === '' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingBag className="w-8 h-8 text-orange-500" />
          My Orders
        </h1>
        <p className="text-gray-500 mt-1">Track and view your order history</p>
      </div>

      {/* Search & Filter */}
      {orders.length > 0 && (
        <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by order ID, status, address, amount, customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-10 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 md:w-48"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PREPARING">Preparing</option>
              <option value="ON_THE_WAY">On the Way</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          {(searchTerm || statusFilter) && (
            <p className="text-sm text-gray-500 mt-3">
              Showing <span className="font-semibold text-gray-900">{filteredOrders.length}</span> of {orders.length} orders
            </p>
          )}
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-16 h-16 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-6">When you place orders, they will appear here</p>
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
          >
            🍕 Start Ordering
          </Link>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-orange-200 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No orders found</p>
          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;
            const isHighlighted = highlightedOrder === order.id;

            return (
              <div
                key={order.id}
                ref={isHighlighted ? highlightRef : null}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all ${
                  isHighlighted
                    ? 'border-orange-500 ring-4 ring-orange-500/50 shadow-2xl shadow-orange-500/30 scale-[1.02] animate-pulse'
                    : 'border-orange-100'
                }`}
              >
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Order Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center text-2xl">
                        {getOrderEmoji(index)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 text-lg">Order #{order.id}</span>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusConfig.color}`}>
                            {statusConfig.emoji} {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {order.orderDate ? formatDateTime(order.orderDate) : 'Recently'}
                        </p>
                      </div>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(order.totalAmount)}</p>
                      </div>
                      <button
                        onClick={() => openViewModal(order)}
                        className="p-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Order Progress */}
                  {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                    <div className="mt-4 pt-4 border-t border-orange-100">
                      <div className="flex items-center justify-between">
                        {['PENDING', 'CONFIRMED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED'].map((step, i) => {
                          const stepConfig = getStatusConfig(step);
                          const StepIcon = stepConfig.icon;
                          const stepIndex = ['PENDING', 'CONFIRMED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED'].indexOf(order.status);
                          const isCompleted = i <= stepIndex;
                          const isCurrent = i === stepIndex;
                          
                          return (
                            <div key={step} className="flex items-center flex-1">
                              <div 
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isCompleted 
                                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white' 
                                    : 'bg-gray-100 text-gray-400'
                                } ${isCurrent ? 'ring-4 ring-orange-200' : ''}`}
                                title={stepConfig.label}
                              >
                                <StepIcon className="w-4 h-4" />
                              </div>
                              {i < 4 && (
                                <div className={`flex-1 h-1 mx-2 rounded ${
                                  i < stepIndex ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gray-100'
                                }`} />
                              )}
                            </div>
                          );
                        })}
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
                    <div key={index} className="p-4 flex justify-between items-center bg-white hover:bg-orange-50 transition-colors">
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
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;