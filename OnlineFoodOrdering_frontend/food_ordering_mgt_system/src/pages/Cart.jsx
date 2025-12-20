import { Link } from 'react-router-dom';
import {
  ShoppingCart, Plus, Minus, Trash2, ArrowLeft,
  ArrowRight, ShoppingBag
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, getCartTotal, currentRestaurant } = useCart();

  const total = getCartTotal();

  const getCategoryEmoji = (category) => {
    const emojis = {
      APPETIZER: '🥗',
      MAIN_COURSE: '🍔',
      DESSERT: '🍰',
      BEVERAGE: '🥤',
      SIDE_DISH: '🍟',
    };
    return emojis[category] || '🍽️';
  };

  // Empty Cart State
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="w-16 h-16 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          Looks like you haven't added anything to your cart yet.
          Explore our restaurants and find something delicious!
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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-8 h-8 text-orange-500" />
            Your Cart
          </h1>
          <p className="text-gray-500 mt-1">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            {currentRestaurant && (
              <span className="ml-2">
                from <span className="font-semibold text-orange-600">{currentRestaurant.name}</span>
              </span>
            )}
          </p>
        </div>
        <Link
          to={currentRestaurant ? `/restaurants/${currentRestaurant.id}/menu` : '/restaurants'}
          className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>

      {/* Cart Items */}
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            {/* Item Image/Emoji */}
            <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-4xl">{getCategoryEmoji(item.category)}</span>
            </div>

            {/* Item Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
              <p className="text-sm text-gray-500 mt-0.5">{formatCurrency(item.price)} each</p>
            </div>

            {/* Quantity Controls */}
            <div className="flex items-center gap-1 bg-orange-50 rounded-xl p-1">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-orange-600 hover:bg-orange-100 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-bold text-gray-900">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg text-orange-600 hover:bg-orange-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Item Total */}
            <div className="text-right min-w-[80px]">
              <p className="font-bold text-lg text-gray-900">
                {formatCurrency(item.price * item.quantity)}
              </p>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => {
                removeFromCart(item.id);
                toast.success(`Removed ${item.name} from cart`);
              }}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>

      {/* Clear Cart Button */}
      <div className="flex justify-end">
        <button
          onClick={() => {
            clearCart();
            toast.success('Cart cleared');
          }}
          className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
        >
          Clear entire cart
        </button>
      </div>

      {/* Total and Proceed to Payment */}
      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-gray-500 text-sm">Total Amount</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(total)}</p>
          </div>
          <Link
            to="/checkout"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl active:scale-[0.98]"
          >
            Proceed to Payment
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
