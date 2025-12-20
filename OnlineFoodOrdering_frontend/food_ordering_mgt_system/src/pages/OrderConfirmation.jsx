import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle, Clock, Package, Truck, MapPin,
  ShoppingBag, ArrowRight, Loader2, Home
} from 'lucide-react';
import { orderApi } from '../services/api';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import confetti from 'canvas-confetti';

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
      // Trigger confetti on successful order
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 500);
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      const response = await orderApi.getById(orderId);
      setOrder(response.data);
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      PENDING: {
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        icon: Clock,
        emoji: '⏳',
        label: 'Waiting for Approval',
        message: 'Your order has been placed and is waiting for the restaurant to confirm.',
        bgGradient: 'from-yellow-50 to-orange-50'
      },
      CONFIRMED: {
        color: 'bg-blue-100 text-blue-700 border-blue-300',
        icon: CheckCircle,
        emoji: '✅',
        label: 'Order Confirmed',
        message: 'Great news! The restaurant has confirmed your order.',
        bgGradient: 'from-blue-50 to-indigo-50'
      },
      PREPARING: {
        color: 'bg-purple-100 text-purple-700 border-purple-300',
        icon: Package,
        emoji: '👨‍🍳',
        label: 'Being Prepared',
        message: 'Your delicious food is being prepared with care!',
        bgGradient: 'from-purple-50 to-pink-50'
      },
      ON_THE_WAY: {
        color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
        icon: Truck,
        emoji: '🚴',
        label: 'On the Way',
        message: 'Your order is on its way to you!',
        bgGradient: 'from-indigo-50 to-blue-50'
      },
      DELIVERED: {
        color: 'bg-green-100 text-green-700 border-green-300',
        icon: CheckCircle,
        emoji: '🎉',
        label: 'Delivered',
        message: 'Your order has been delivered. Enjoy your meal!',
        bgGradient: 'from-green-50 to-emerald-50'
      },
      CANCELLED: {
        color: 'bg-red-100 text-red-700 border-red-300',
        icon: Clock,
        emoji: '❌',
        label: 'Cancelled',
        message: 'This order has been cancelled.',
        bgGradient: 'from-red-50 to-pink-50'
      },
    };
    return configs[status] || configs.PENDING;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-16 h-16 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order not found</h2>
        <p className="text-gray-500 mb-6">We couldn't find this order.</p>
        <Link
          to="/orders"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold"
        >
          View All Orders
        </Link>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Header */}
      <div className={`bg-gradient-to-br ${statusConfig.bgGradient} rounded-3xl p-8 text-center border-2 ${statusConfig.color.split(' ')[0].replace('bg-', 'border-')}`}>
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-5xl">{statusConfig.emoji}</span>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {order.status === 'PENDING' ? 'Order Placed Successfully!' : statusConfig.label}
        </h1>

        <p className="text-gray-600 mb-4">
          {statusConfig.message}
        </p>

        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusConfig.color}`}>
          <StatusIcon className="w-4 h-4" />
          {statusConfig.label}
        </div>
      </div>

      {/* Order Info Card */}
      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Order Number</p>
              <p className="text-2xl font-bold text-gray-900">#{order.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(order.totalAmount)}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Order Date */}
          <div className="flex items-center gap-3 text-gray-600">
            <Clock className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-sm text-gray-500">Order Date</p>
              <p className="font-medium">{order.orderDate ? formatDateTime(order.orderDate) : 'Just now'}</p>
            </div>
          </div>

          {/* Delivery Address */}
          {order.deliveryAddress && (
            <div className="flex items-start gap-3 text-gray-600">
              <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Delivery Address</p>
                <p className="font-medium">{order.deliveryAddress}</p>
              </div>
            </div>
          )}
        </div>

        {/* Order Items */}
        {order.orderItems && order.orderItems.length > 0 && (
          <div className="border-t border-orange-100">
            <div className="p-4 bg-gray-50">
              <p className="font-semibold text-gray-700">Order Items</p>
            </div>
            <div className="divide-y divide-orange-100">
              {order.orderItems.map((item, index) => (
                <div key={index} className="p-4 flex justify-between items-center">
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

        {/* Order Progress */}
        {order.status !== 'CANCELLED' && (
          <div className="p-6 border-t border-orange-100 bg-gray-50">
            <p className="text-sm font-semibold text-gray-700 mb-4">Order Progress</p>
            <div className="flex items-center justify-between">
              {['PENDING', 'CONFIRMED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED'].map((step, i) => {
                const stepConfig = getStatusConfig(step);
                const StepIcon = stepConfig.icon;
                const stepIndex = ['PENDING', 'CONFIRMED', 'PREPARING', 'ON_THE_WAY', 'DELIVERED'].indexOf(order.status);
                const isCompleted = i <= stepIndex;
                const isCurrent = i === stepIndex;

                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                            : 'bg-gray-200 text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-orange-200 scale-110' : ''} transition-all`}
                      >
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <span className={`text-xs mt-2 ${isCompleted ? 'text-orange-600 font-medium' : 'text-gray-400'}`}>
                        {stepConfig.label.split(' ')[0]}
                      </span>
                    </div>
                    {i < 4 && (
                      <div className={`flex-1 h-1 mx-1 rounded ${
                        i < stepIndex ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* What's Next */}
      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">📋 What happens next?</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">1</div>
            <div>
              <p className="font-medium text-gray-900">Restaurant Reviews</p>
              <p className="text-sm text-gray-500">The restaurant will review and confirm your order</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">2</div>
            <div>
              <p className="font-medium text-gray-900">Food Preparation</p>
              <p className="text-sm text-gray-500">Once confirmed, your food will be prepared fresh</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">3</div>
            <div>
              <p className="font-medium text-gray-900">Delivery</p>
              <p className="text-sm text-gray-500">Your order will be delivered to your address</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          to="/orders"
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
        >
          <ShoppingBag className="w-5 h-5" />
          Track My Orders
          <ArrowRight className="w-5 h-5" />
        </Link>
        <Link
          to="/restaurants"
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-orange-200 text-orange-600 rounded-xl font-semibold hover:bg-orange-50 transition-all"
        >
          <Home className="w-5 h-5" />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
