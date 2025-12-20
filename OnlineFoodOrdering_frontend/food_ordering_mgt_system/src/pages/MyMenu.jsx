import { useState, useEffect } from 'react';
import {
  UtensilsCrossed, Plus, Edit2, Trash2, Loader2, Coins,
  Image, FileText, Tag, Save, X, Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { menuItemApi, restaurantApi } from '../services/api';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const CATEGORIES = [
  { value: 'APPETIZER', label: 'Appetizer' },
  { value: 'MAIN_COURSE', label: 'Main Course' },
  { value: 'DESSERT', label: 'Dessert' },
  { value: 'BEVERAGE', label: 'Beverage' },
  { value: 'SIDE_DISH', label: 'Side Dish' },
];

const MyMenu = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
    available: true,
  });

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Find owner's restaurant
      const restResponse = await restaurantApi.getAll();
      const restaurants = Array.isArray(restResponse.data) ? restResponse.data : [];
      const myRestaurant = restaurants.find(r => r.owner?.id === user?.id || r.ownerId === user?.id);

      if (myRestaurant) {
        setRestaurant(myRestaurant);

        // Load menu items for this restaurant
        const menuResponse = await menuItemApi.getByRestaurant(myRestaurant.id);
        setMenuItems(Array.isArray(menuResponse.data) ? menuResponse.data : []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    console.log('Opening add modal...');
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      imageUrl: '',
      available: true,
    });
    setIsModalOpen(true);
    console.log('Modal should be open now');
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      price: item.price?.toString() || '',
      category: item.category || '',
      imageUrl: item.imageUrl || '',
      available: item.available !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurant) {
      toast.error('Please create a restaurant first');
      return;
    }

    setSaving(true);
    try {
      const data = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        category: formData.category || null,
        imageUrl: formData.imageUrl || null,
        available: formData.available,
        restaurant: { id: restaurant.id },
      };

      if (editingItem) {
        await menuItemApi.update(editingItem.id, data);
        toast.success('Menu item updated!');
      } else {
        await menuItemApi.create(data);
        toast.success('Menu item added!');
      }

      setIsModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error(error.response?.data?.message || 'Failed to save menu item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (itemId) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    try {
      await menuItemApi.delete(itemId);
      toast.success('Menu item deleted');
      loadData();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('Failed to delete menu item');
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
    const matchesCategory = !filterCategory || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading your menu...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="text-center py-20">
        <div className="w-32 h-32 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <UtensilsCrossed className="w-16 h-16 text-orange-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Restaurant Found</h2>
        <p className="text-gray-500 mb-6">Please create your restaurant first before adding menu items.</p>
        <a
          href="/my-restaurant"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold"
        >
          Create Restaurant
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <UtensilsCrossed className="w-8 h-8 text-orange-500" />
            My Menu
          </h1>
          <p className="text-gray-500 mt-1">
            Manage menu items for <span className="font-semibold text-orange-600">{restaurant.name}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, category, price..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-orange-100 rounded-xl outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-3 bg-white border border-orange-100 rounded-xl outline-none focus:border-orange-400"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-orange-100">
          <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <UtensilsCrossed className="w-12 h-12 text-orange-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {searchTerm || filterCategory ? 'No items found' : 'No menu items yet'}
          </h2>
          <p className="text-gray-500 mb-6">
            {searchTerm || filterCategory
              ? 'Try adjusting your search or filter'
              : 'Add your first menu item to get started'}
          </p>
          {!searchTerm && !filterCategory && (
            <Button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold"
            >
              <Plus className="w-5 h-5" />
              Add First Item
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden hover:shadow-md transition-all"
            >
              {/* Image */}
              <div className="h-40 bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center relative">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`${item.imageUrl ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                  <span className="text-5xl">🍽️</span>
                </div>
                {/* Category Badge */}
                {item.category && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-semibold text-orange-600">
                    {CATEGORIES.find(c => c.value === item.category)?.label || item.category}
                  </span>
                )}
                {/* Availability Badge */}
                {!item.available && (
                  <span className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold">
                    Unavailable
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900">{item.name}</h3>
                  <span className="font-bold text-green-600">{formatCurrency(item.price)}</span>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                  {item.description || 'No description'}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium hover:bg-orange-100 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? '✏️ Edit Menu Item' : '➕ Add Menu Item'}
        showFooter={false}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Item Name *
            </label>
            <div className="relative">
              <UtensilsCrossed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400"
                placeholder="Delicious Burger"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Description
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 w-5 h-5 text-orange-400" />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full pl-12 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 resize-none"
                placeholder="Describe your dish..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Price *
              </label>
              <div className="relative">
                <Coins className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400"
                  placeholder="5000"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>
              <div className="relative">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 appearance-none"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Image URL
            </label>
            <div className="relative">
              <Image className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full pl-12 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="available"
              checked={formData.available}
              onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
              className="w-5 h-5 rounded border-orange-300 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="available" className="text-sm font-medium text-gray-700">
              Available for ordering
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => setIsModalOpen(false)}
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
              {editingItem ? 'Update Item' : 'Add Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MyMenu;
