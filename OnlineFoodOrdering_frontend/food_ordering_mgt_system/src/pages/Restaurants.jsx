import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Search, MapPin, Phone, Star, Loader2, Store, RefreshCw } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const Restaurants = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const highlightId = searchParams.get('highlight');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedRestaurant, setHighlightedRestaurant] = useState(null);
  const highlightRef = useRef(null);

  useEffect(() => {
    loadRestaurants();
  }, []);

  // Handle highlighting from global search
  useEffect(() => {
    if (highlightId && restaurants.length > 0) {
      const restaurantId = parseInt(highlightId);
      setHighlightedRestaurant(restaurantId);
      // Scroll to highlighted restaurant after a short delay
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
        setHighlightedRestaurant(null);
        // Clear URL params
        navigate('/restaurants', { replace: true });
      }, 3000);
    }
  }, [highlightId, restaurants, navigate]);

  const loadRestaurants = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/restaurants');
      const data = Array.isArray(response.data) ? response.data : response.data?.content || [];
      setRestaurants(data);
    } catch (err) {
      setError({
        message: err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to load restaurants',
        status: err.response?.status,
        details: err.response?.data
      });
      toast.error('Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const term = searchTerm.toLowerCase();
    const id = restaurant.id?.toString() || '';
    const name = restaurant.name?.toLowerCase() || '';
    const description = restaurant.description?.toLowerCase() || '';
    const address = restaurant.address?.toLowerCase() || '';
    const phone = restaurant.phone?.toLowerCase() || '';
    const ownerName = restaurant.ownerName?.toLowerCase() || '';

    return id.includes(term) ||
           name.includes(term) ||
           description.includes(term) ||
           address.includes(term) ||
           phone.includes(term) ||
           ownerName.includes(term);
  });

  const getRestaurantImage = (restaurant) => {
    // Use image_url from backend if available, otherwise use default
    return restaurant.imageUrl || 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&h=300&fit=crop';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading restaurants...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Store className="w-8 h-8 text-orange-500" />
          Restaurants
        </h1>
        <p className="text-gray-500 mt-1">Choose a restaurant to start ordering</p>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-red-800 mb-2">❌ Error Loading Restaurants</h3>
          <p className="text-red-600 mb-2">{error.message}</p>
          <p className="text-red-500 text-sm mb-4">Status: {error.status}</p>
          
          {error.status === 401 && (
            <div className="bg-yellow-100 rounded-xl p-3 mb-4">
              <p className="text-yellow-800 font-semibold">🔐 Authentication Issue</p>
              <p className="text-yellow-700 text-sm">Your session may have expired. Try logging out and back in.</p>
            </div>
          )}
          
          {error.status === 403 && (
            <div className="bg-yellow-100 rounded-xl p-3 mb-4">
              <p className="text-yellow-800 font-semibold">🚫 Access Denied</p>
              <p className="text-yellow-700 text-sm">You don't have permission to access this resource.</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={loadRestaurants}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors"
            >
              Re-Login
            </Link>
          </div>
        </div>
      )}

      {/* Search */}
      {!error && (
        <>
          <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, address, phone, owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>

          {/* Results Count */}
          <p className="text-gray-500">
            Showing <span className="font-semibold text-gray-900">{filteredRestaurants.length}</span> restaurants
          </p>

          {/* Restaurants Grid */}
          {filteredRestaurants.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="w-12 h-12 text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No restaurants found</h3>
              <p className="text-gray-500">
                {restaurants.length === 0 
                  ? 'No restaurants available at the moment.' 
                  : 'Try a different search term.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant, index) => {
                const isHighlighted = highlightedRestaurant === restaurant.id;
                return (
                <Link
                  key={restaurant.id}
                  ref={isHighlighted ? highlightRef : null}
                  to={`/restaurants/${restaurant.id}/menu`}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group ${
                    isHighlighted
                      ? 'border-orange-500 ring-4 ring-orange-500/50 shadow-2xl shadow-orange-500/30 scale-105 animate-pulse'
                      : 'border-orange-100'
                  }`}
                >
                  {/* Restaurant Image/Banner */}
                  <div className="relative h-40 bg-gray-200 overflow-hidden">
                    <img
                      src={getRestaurantImage(restaurant)}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Rating Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur rounded-lg shadow-sm">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-semibold text-gray-700">4.5</span>
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    
                    {/* Restaurant Name on Image */}
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-xl font-bold text-white drop-shadow-lg">
                        {restaurant.name}
                      </h3>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                      {restaurant.description || 'Delicious food awaits you!'}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      {restaurant.address && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0" />
                          <span className="line-clamp-1">{restaurant.address}</span>
                        </div>
                      )}
                      {restaurant.phone && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4 text-orange-500 flex-shrink-0" />
                          <span>{restaurant.phone}</span>
                        </div>
                      )}
                    </div>

                    {/* View Menu Button */}
                    <div className="mt-4 pt-4 border-t border-orange-100">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          🍽️ View Menu
                        </span>
                        <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-xl group-hover:from-orange-600 group-hover:to-red-600 transition-all">
                          Order Now →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Restaurants;