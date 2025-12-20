import { useState, useEffect } from 'react';
import { Search, Plus, ShoppingCart, Loader2, Filter, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { menuItemApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [imageErrors, setImageErrors] = useState({});
  const { addToCart, cartItems, getCartCount } = useCart();

  const categories = [
    { value: '', label: 'All', icon: '🍽️' },
    { value: 'APPETIZER', label: 'Appetizers', icon: '🥗' },
    { value: 'MAIN_COURSE', label: 'Main Course', icon: '🍔' },
    { value: 'DESSERT', label: 'Desserts', icon: '🍰' },
    { value: 'BEVERAGE', label: 'Beverages', icon: '🥤' },
    { value: 'SIDE_DISH', label: 'Sides', icon: '🍟' },
  ];

  useEffect(() => {
    loadMenuItems();
  }, [categoryFilter]);

  const loadMenuItems = async () => {
    setLoading(true);
    try {
      let response;
      if (categoryFilter) {
        response = await menuItemApi.getByCategory(categoryFilter);
      } else {
        response = await menuItemApi.getAll();
      }
      const items = Array.isArray(response.data) ? response.data : response.data?.content || [];
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading menu:', error);
      toast.error('Failed to load menu items');
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const term = searchTerm.toLowerCase();
    const id = item.id?.toString() || '';
    const name = item.name?.toLowerCase() || '';
    const description = item.description?.toLowerCase() || '';
    const category = item.category?.toLowerCase().replace('_', ' ') || '';
    const price = item.price?.toString() || '';
    const restaurantName = item.restaurant?.name?.toLowerCase() || '';

    return id.includes(term) ||
           name.includes(term) ||
           description.includes(term) ||
           category.includes(term) ||
           price.includes(term) ||
           restaurantName.includes(term);
  });

  const handleAddToCart = (item) => {
    // Add restaurant info if available (from the menu item's restaurant relationship)
    const itemWithRestaurant = {
      ...item,
      restaurantId: item.restaurant?.id || item.restaurantId,
      restaurantName: item.restaurant?.name || item.restaurantName,
    };
    const added = addToCart(itemWithRestaurant);
    // Only show success toast if item was actually added
    if (added) {
      toast.success(
        <div className="flex items-center gap-2">
          <span className="font-semibold">{item.name}</span>
          <span>added to cart!</span>
        </div>,
        { icon: '🛒' }
      );
    }
  };

  const getItemQuantityInCart = (itemId) => {
    const cartItem = cartItems.find((item) => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

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

  const getCategoryLabel = (category) => {
    const labels = {
      APPETIZER: 'Appetizer',
      MAIN_COURSE: 'Main Course',
      DESSERT: 'Dessert',
      BEVERAGE: 'Beverage',
      SIDE_DISH: 'Side Dish',
    };
    return labels[category] || category;
  };

  const handleImageError = (itemId) => {
    setImageErrors((prev) => ({ ...prev, [itemId]: true }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCategoryFilter('');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading delicious food...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            🍕 Our Menu
          </h1>
          <p className="text-gray-500 mt-1">Discover delicious food made with love</p>
        </div>
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/30 font-semibold"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Cart ({getCartCount()})</span>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, category, price, restaurant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-12 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat.value
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                  : 'bg-orange-50 text-gray-600 hover:bg-orange-100'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <p className="text-gray-500">
          Showing <span className="font-semibold text-gray-900">{filteredItems.length}</span> items
          {categoryFilter && (
            <span> in <span className="font-semibold text-orange-600">{categories.find(c => c.value === categoryFilter)?.label}</span></span>
          )}
          {searchTerm && (
            <span> matching "<span className="font-semibold text-orange-600">{searchTerm}</span>"</span>
          )}
        </p>
        {(searchTerm || categoryFilter) && (
          <button
            onClick={clearFilters}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear filters
          </button>
        )}
      </div>

      {/* Menu Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">🔍</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500 mb-6">Try a different search or category</p>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
          >
            <Filter className="w-5 h-5" />
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const quantityInCart = getItemQuantityInCart(item.id);
            const hasImageError = imageErrors[item.id];
            // Handle both imageUrl and image_url from backend
            const imageUrl = item.imageUrl || item.image_url;
            
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Image Area */}
                <div className="relative h-48 bg-gradient-to-br from-orange-50 via-orange-100 to-red-100 overflow-hidden">
                  {imageUrl && !hasImageError ? (
                    <img
                      src={imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={() => handleImageError(item.id)}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl group-hover:scale-125 transition-transform duration-500">
                        {getCategoryEmoji(item.category)}
                      </span>
                    </div>
                  )}
                  
                  {/* Quantity Badge */}
                  {quantityInCart > 0 && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg animate-bounce">
                      {quantityInCart}
                    </div>
                  )}
                  
                  {/* Category Tag */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 shadow-sm flex items-center gap-1">
                      <span>{getCategoryEmoji(item.category)}</span>
                      <span>{getCategoryLabel(item.category)}</span>
                    </span>
                  </div>

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-3">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 min-h-[40px]">
                      {item.description || 'Delicious food made fresh'}
                    </p>
                  </div>
                  
                  {/* Restaurant Name (if available) */}
                  {item.restaurantName && (
                    <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                      <span>🏪</span>
                      <span>{item.restaurantName}</span>
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xl font-bold text-green-600">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Cart Button (Mobile) */}
      {getCartCount() > 0 && (
        <Link
          to="/cart"
          className="fixed bottom-6 right-6 lg:hidden flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold shadow-2xl shadow-orange-500/40 hover:from-orange-600 hover:to-red-600 transition-all z-50"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{getCartCount()}</span>
          <span className="text-white/80">•</span>
          <span>{formatCurrency(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0))}</span>
        </Link>
      )}
    </div>
  );
};

export default Menu;