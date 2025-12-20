import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Store, MapPin, Phone, FileText, Save, Loader2, Edit2, Plus, UtensilsCrossed
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { restaurantApi, locationApi } from '../services/api';
import { Button } from '../components/common/Button';
import toast from 'react-hot-toast';

const MyRestaurant = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [locations, setLocations] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    locationId: '',
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load locations for dropdown
      const locResponse = await locationApi.getAll();
      setLocations(Array.isArray(locResponse.data) ? locResponse.data : []);

      // Load all restaurants and find owner's restaurant
      const restResponse = await restaurantApi.getAll();
      const restaurants = Array.isArray(restResponse.data) ? restResponse.data : [];
      const myRestaurant = restaurants.find(r => r.owner?.id === user?.id || r.ownerId === user?.id);

      if (myRestaurant) {
        setRestaurant(myRestaurant);
        setFormData({
          name: myRestaurant.name || '',
          description: myRestaurant.description || '',
          address: myRestaurant.address || '',
          phone: myRestaurant.phone || '',
          locationId: myRestaurant.location?.id || '',
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load restaurant data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        phone: formData.phone,
        owner: { id: user.id },
        location: formData.locationId ? { id: parseInt(formData.locationId) } : null,
      };

      if (restaurant) {
        // Update existing restaurant
        await restaurantApi.update(restaurant.id, data);
        toast.success('Restaurant updated successfully!');
      } else {
        // Create new restaurant
        await restaurantApi.create(data);
        toast.success('Restaurant created successfully!');
      }

      setIsEditing(false);
      loadData();
    } catch (error) {
      console.error('Error saving restaurant:', error);
      toast.error(error.response?.data?.message || 'Failed to save restaurant');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading your restaurant...</p>
      </div>
    );
  }

  // No restaurant yet - show create form
  if (!restaurant && !isEditing) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-16">
          <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Store className="w-16 h-16 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Restaurant Yet</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            You haven't set up your restaurant yet. Create one to start adding menu items and receiving orders.
          </p>
          <Button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create My Restaurant
          </Button>
        </div>
      </div>
    );
  }

  // Edit/Create Form
  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-8 h-8 text-orange-500" />
            {restaurant ? 'Edit Restaurant' : 'Create Restaurant'}
          </h1>
          <p className="text-gray-500 mt-1">
            {restaurant ? 'Update your restaurant details' : 'Set up your restaurant profile'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-orange-100 shadow-sm p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Restaurant Name *
            </label>
            <div className="relative">
              <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                placeholder="My Awesome Restaurant"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description *
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-orange-400" />
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full pl-12 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 resize-none"
                placeholder="Describe your restaurant and cuisine..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Address *
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                placeholder="123 Main Street, City"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                placeholder="+250 7XX XXX XXX"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Location
            </label>
            <select
              value={formData.locationId}
              onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
              className="w-full px-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
            >
              <option value="">Select a location</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => {
                setIsEditing(false);
                if (restaurant) {
                  setFormData({
                    name: restaurant.name || '',
                    description: restaurant.description || '',
                    address: restaurant.address || '',
                    phone: restaurant.phone || '',
                    locationId: restaurant.location?.id || '',
                  });
                }
              }}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={saving}
              className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold"
            >
              <Save className="w-5 h-5 mr-2" />
              {restaurant ? 'Save Changes' : 'Create Restaurant'}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Display restaurant details
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-8 h-8 text-orange-500" />
            My Restaurant
          </h1>
          <p className="text-gray-500 mt-1">Manage your restaurant profile</p>
        </div>
        <Button
          onClick={() => setIsEditing(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-600 rounded-xl font-medium hover:bg-orange-200"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
          <h2 className="text-2xl font-bold">{restaurant.name}</h2>
          <p className="text-orange-100 mt-1">{restaurant.description}</p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium text-gray-900">{restaurant.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium text-gray-900">{restaurant.phone}</p>
            </div>
          </div>

          {restaurant.location && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{restaurant.location.name}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          to="/my-menu"
          className="bg-white rounded-2xl border border-orange-100 p-5 text-center hover:shadow-md hover:border-orange-300 transition-all cursor-pointer group"
        >
          <p className="text-3xl font-bold text-orange-500">🍽️</p>
          <p className="text-sm text-gray-500 mt-2">Menu Items</p>
          <p className="text-xl font-bold text-gray-900">
            {restaurant.menuItems?.length || 0}
          </p>
          <p className="text-xs text-orange-500 mt-2 group-hover:underline">Click to manage menu →</p>
        </Link>
        <div className="bg-white rounded-2xl border border-orange-100 p-5 text-center">
          <p className="text-3xl font-bold text-orange-500">📦</p>
          <p className="text-sm text-gray-500 mt-2">Total Orders</p>
          <p className="text-xl font-bold text-gray-900">-</p>
        </div>
      </div>

      {/* Manage Menu Button */}
      <Link
        to="/my-menu"
        className="block w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-center font-bold rounded-xl shadow-lg shadow-orange-500/30 hover:from-orange-600 hover:to-red-600 transition-all"
      >
        <span className="inline-flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5" />
          Manage Menu Items
        </span>
      </Link>
    </div>
  );
};

export default MyRestaurant;
