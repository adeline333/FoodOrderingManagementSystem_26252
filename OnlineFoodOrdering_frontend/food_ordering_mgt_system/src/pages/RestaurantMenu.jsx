import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Search, Plus, ShoppingCart, Loader2, ArrowLeft,
  MapPin, Phone, Star, X, Filter
} from 'lucide-react';
import { menuItemApi, restaurantApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const RestaurantMenu = () => {
  const { id: restaurantId } = useParams();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const searchQuery = searchParams.get('search');
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [imageErrors, setImageErrors] = useState({});
  const [highlightedItem, setHighlightedItem] = useState(null);
  const highlightRef = useRef(null);
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
    loadRestaurantAndMenu();
  }, [restaurantId]);

  // Handle highlighting from global search
  useEffect(() => {
    if (highlightId && menuItems.length > 0) {
      setHighlightedItem(parseInt(highlightId));
      // Scroll to highlighted item after a short delay
      setTimeout(() => {
        if (highlightRef.current) {
          highlightRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 500);
      // Remove highlight after 3 seconds
      setTimeout(() => {
        setHighlightedItem(null);
        // Clear URL params
        navigate(`/restaurants/${restaurantId}/menu`, { replace: true });
      }, 3000);
    }
  }, [highlightId, menuItems, restaurantId, navigate]);

  const loadRestaurantAndMenu = async () => {
    setLoading(true);
    try {
      // Load restaurant details
      const restaurantRes = await restaurantApi.getById(restaurantId);
      setRestaurant(restaurantRes.data);
      console.log('Restaurant:', restaurantRes.data);

      // Load menu items for this restaurant
      const menuRes = await menuItemApi.getByRestaurant(restaurantId);
      const items = Array.isArray(menuRes.data) ? menuRes.data : menuRes.data?.content || [];
      console.log('Menu items:', items);
      setMenuItems(items);
    } catch (error) {
      console.error('Error loading restaurant menu:', error);
      toast.error('Failed to load menu');
      
      // If restaurant not found, redirect back
      if (error.response?.status === 404) {
        navigate('/restaurants');
      }
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

    const matchesSearch = id.includes(term) ||
                          name.includes(term) ||
                          description.includes(term) ||
                          category.includes(term) ||
                          price.includes(term);
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (item) => {
    // Add restaurant info to the item for order tracking
    const itemWithRestaurant = {
      ...item,
      restaurantId: restaurant?.id,
      restaurantName: restaurant?.name,
    };
    const added = addToCart(itemWithRestaurant);
    // Only show success toast if item was actually added (not blocked by restaurant check)
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
        <p className="text-gray-500">Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button & Cart */}
      <div className="flex items-center justify-between">
        <Link
          to="/restaurants"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Restaurants
        </Link>
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg shadow-orange-500/30 font-semibold"
        >
          <ShoppingCart className="w-5 h-5" />
          <span>Cart ({getCartCount()})</span>
        </Link>
      </div>

      {/* Restaurant Header */}
      {restaurant && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
                <p className="text-white/80 mb-4 max-w-xl">
                  {restaurant.description || 'Welcome to our restaurant!'}
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  {restaurant.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{restaurant.address}</span>
                    </div>
                  )}
                  {restaurant.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{restaurant.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 px-3 py-1.5 bg-white/20 backdrop-blur rounded-xl">
                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                <span className="font-bold">4.5</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, category, price..."
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
            <span className="text-5xl">🍽️</span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No menu items found</h3>
          <p className="text-gray-500 mb-6">
            {menuItems.length === 0 
              ? 'This restaurant has no menu items yet.' 
              : 'Try a different search or category.'}
          </p>
          {(searchTerm || categoryFilter) && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
            >
              <Filter className="w-5 h-5" />
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const quantityInCart = getItemQuantityInCart(item.id);
            const hasImageError = imageErrors[item.id];
            const imageUrl = item.imageUrl || item.image_url;
            const isHighlighted = highlightedItem === item.id;

            return (
              <div
                key={item.id}
                ref={isHighlighted ? highlightRef : null}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ${
                  isHighlighted
                    ? 'border-orange-500 ring-4 ring-orange-500/50 shadow-2xl shadow-orange-500/30 scale-105 animate-pulse'
                    : 'border-orange-100'
                }`}
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
                  
                  {quantityInCart > 0 && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg animate-bounce">
                      {quantityInCart}
                    </div>
                  )}
                  
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 shadow-sm flex items-center gap-1">
                      <span>{getCategoryEmoji(item.category)}</span>
                      <span>{getCategoryLabel(item.category)}</span>
                    </span>
                  </div>

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
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(item.price)}
                    </span>
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

export default RestaurantMenu;