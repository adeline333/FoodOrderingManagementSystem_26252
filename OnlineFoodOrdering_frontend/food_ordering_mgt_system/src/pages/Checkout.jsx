import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard, MapPin, Truck, ArrowLeft,
  ShoppingBag, Loader2, CheckCircle, Shield
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi, paymentApi } from '../services/api';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, getCartTotal, currentRestaurant } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Card details (for display purposes)
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // Mobile money
  const [mobileNumber, setMobileNumber] = useState('');

  const subtotal = getCartTotal();
  const deliveryFee = subtotal > 0 ? 500 : 0; // 500 RWF delivery fee
  const tax = subtotal * 0.1;
  const total = subtotal + deliveryFee + tax;

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-16 h-16 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No items to checkout</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Your cart is empty. Add some items before proceeding to checkout.
        </p>
        <Link
          to="/restaurants"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/30"
        >
          <ShoppingBag className="w-5 h-5" />
          Browse Restaurants
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      toast.error('Please enter a delivery address');
      return;
    }

    if (paymentMethod === 'CARD') {
      if (!cardNumber || !cardExpiry || !cardCvc || !cardName) {
        toast.error('Please fill in all card details');
        return;
      }
    }

    if (paymentMethod === 'MOBILE_MONEY' && !mobileNumber) {
      toast.error('Please enter your mobile money number');
      return;
    }

    setLoading(true);
    try {
      // Create order
      const orderData = {
        customer: { id: user?.id },
        deliveryAddress,
        totalAmount: total,
        status: 'PENDING',
        notes: specialInstructions,
        orderItems: cartItems.map((item) => ({
          menuItem: { id: item.id },
          quantity: item.quantity,
          unitPrice: item.price,
          lineTotal: item.price * item.quantity,
        })),
      };

      const orderResponse = await orderApi.create(orderData);
      const order = orderResponse.data;

      // Create payment
      const paymentData = {
        order: { id: order.id },
        amount: total,
        method: paymentMethod,
        status: 'PAID',
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      };

      await paymentApi.create(paymentData);

      // Clear cart and redirect to confirmation page
      clearCart();
      toast.success('Order placed successfully!', { duration: 4000 });
      navigate(`/order-confirmation/${order.id}`);

    } catch (error) {
      console.error('Order error:', error);
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-orange-500" />
            Checkout
          </h1>
          <p className="text-gray-500 mt-1">
            Complete your payment for {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
            {currentRestaurant && (
              <span className="ml-1">
                from <span className="font-semibold text-orange-600">{currentRestaurant.name}</span>
              </span>
            )}
          </p>
        </div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Cart
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Delivery Address */}
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <MapPin className="w-5 h-5 text-orange-500" />
              Delivery Address
            </h3>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="Enter your full delivery address..."
              rows={3}
              className="w-full px-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 resize-none"
            />
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5 text-orange-500" />
              Payment Method
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {[
                { value: 'CARD', label: 'Card', icon: '💳' },
                { value: 'MOBILE_MONEY', label: 'Mobile Money', icon: '📱' },
                { value: 'CASH', label: 'Cash on Delivery', icon: '💵' },
              ].map((method) => (
                <label
                  key={method.value}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === method.value
                      ? 'bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-400 shadow-md'
                      : 'bg-gray-50 border-2 border-transparent hover:bg-orange-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-3xl">{method.icon}</span>
                  <span className="font-medium text-gray-700 text-sm">{method.label}</span>
                  {paymentMethod === method.value && (
                    <CheckCircle className="w-5 h-5 text-orange-500" />
                  )}
                </label>
              ))}
            </div>

            {/* Card Details */}
            {paymentMethod === 'CARD' && (
              <div className="space-y-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 bg-white border-2 border-orange-100 rounded-xl outline-none transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className="w-full px-4 py-3 bg-white border-2 border-orange-100 rounded-xl outline-none transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      maxLength={5}
                      className="w-full px-4 py-3 bg-white border-2 border-orange-100 rounded-xl outline-none transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">CVC</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="123"
                      maxLength={4}
                      className="w-full px-4 py-3 bg-white border-2 border-orange-100 rounded-xl outline-none transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                  <Shield className="w-4 h-4 text-green-500" />
                  Your payment is secure and encrypted
                </div>
              </div>
            )}

            {/* Mobile Money */}
            {paymentMethod === 'MOBILE_MONEY' && (
              <div className="space-y-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Money Number</label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+250 7XX XXX XXX"
                    className="w-full px-4 py-3 bg-white border-2 border-orange-100 rounded-xl outline-none transition-all focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  You will receive a prompt on your phone to confirm the payment.
                </p>
              </div>
            )}

            {/* Cash on Delivery */}
            {paymentMethod === 'CASH' && (
              <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                <p className="text-gray-700">
                  Pay with cash when your order is delivered. Please have the exact amount ready.
                </p>
              </div>
            )}
          </div>

          {/* Special Instructions */}
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              📝 Special Instructions (Optional)
            </h3>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests? (allergies, delivery instructions, etc.)"
              rows={2}
              className="w-full px-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 resize-none"
            />
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 sticky top-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg">
              <Truck className="w-5 h-5 text-orange-500" />
              Order Summary
            </h3>

            {/* Items List */}
            <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-orange-100 pt-4 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span className="font-medium">{formatCurrency(deliveryFee)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (10%)</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="border-t-2 border-dashed border-orange-200 pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-900 text-lg">Total</span>
                <span className="font-bold text-green-600 text-2xl">{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full mt-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl active:scale-[0.98] disabled:shadow-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Pay {formatCurrency(total)}
                </>
              )}
            </button>

            <p className="text-xs text-gray-400 text-center mt-3">
              By completing this payment, you agree to our terms of service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
