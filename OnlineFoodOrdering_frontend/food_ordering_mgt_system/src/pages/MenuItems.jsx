import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, UtensilsCrossed, Coins, Pizza } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { DataTable } from '../components/tables/DataTable';
import { Pagination } from '../components/tables/Pagination';
import { menuItemApi, restaurantApi } from '../services/api';
import { FOOD_CATEGORY_OPTIONS } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const MenuItems = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(5);  // 5 items per page for easier testing
  const [totalPages, setTotalPages] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'MAIN_COURSE',
    restaurantId: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadMenuItems();
    loadRestaurants();
  }, [currentPage, categoryFilter]);

  const loadMenuItems = async () => {
    setLoading(true);
    try {
      let response;
      if (categoryFilter) {
        response = await menuItemApi.getByCategory(categoryFilter);
        setMenuItems(response.data);
        setTotalPages(1);
      } else {
        response = await menuItemApi.getAllPaginated(currentPage, pageSize);
        setMenuItems(response.data.content || response.data);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const loadRestaurants = async () => {
    try {
      const response = await restaurantApi.getAll();
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error loading restaurants:', error);
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

  const openCreateModal = () => {
    setSelectedItem(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'MAIN_COURSE',
      restaurantId: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price?.toString() || '',
      category: item.category || 'MAIN_COURSE',
      restaurantId: item.restaurant?.id || '',
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async () => {
    setFormLoading(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        restaurant: formData.restaurantId ? { id: formData.restaurantId } : null,
      };
      
      if (selectedItem) {
        await menuItemApi.update(selectedItem.id, payload);
        toast.success('Menu item updated successfully');
      } else {
        await menuItemApi.create(payload);
        toast.success('Menu item created successfully');
      }
      setIsModalOpen(false);
      loadMenuItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await menuItemApi.delete(selectedItem.id);
      toast.success('Menu item deleted successfully');
      setIsDeleteModalOpen(false);
      loadMenuItems();
    } catch (error) {
      toast.error(`Failed to delete menu item ${error}`);
    } finally {
      setFormLoading(false);
    }
  };

  const getCategoryBadge = (category) => {
    const styles = {
      APPETIZER: { bg: 'bg-blue-100 text-blue-700', icon: '🥗' },
      MAIN_COURSE: { bg: 'bg-green-100 text-green-700', icon: '🍽️' },
      DESSERT: { bg: 'bg-pink-100 text-pink-700', icon: '🍰' },
      BEVERAGE: { bg: 'bg-purple-100 text-purple-700', icon: '🥤' },
      SIDE_DISH: { bg: 'bg-orange-100 text-orange-700', icon: '🍟' },
    };
    const style = styles[category] || { bg: 'bg-gray-100 text-gray-700', icon: '🍴' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${style.bg}`}>
        {style.icon} {category?.replace('_', ' ')}
      </span>
    );
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'name', 
      label: 'Item',
      render: (name, item) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-md">
            <UtensilsCrossed className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{name}</p>
            <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.description || 'No description'}</p>
          </div>
        </div>
      )
    },
    { 
      key: 'category', 
      label: 'Category',
      render: (category) => getCategoryBadge(category)
    },
    { 
      key: 'price', 
      label: 'Price',
      render: (price) => (
        <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 rounded-xl font-bold">
          <Coins className="w-4 h-4" />
          {formatCurrency(price)}
        </span>
      )
    },
    { 
      key: 'restaurant', 
      label: 'Restaurant',
      render: (restaurant) => restaurant?.name ? (
        <span className="text-sm text-gray-600">{restaurant.name}</span>
      ) : <span className="text-gray-400">—</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, item) => (
        <div className="flex gap-1">
          <button
            onClick={() => openEditModal(item)}
            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(item)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const restaurantOptions = restaurants.map((r) => ({
    value: r.id,
    label: r.name,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Pizza className="w-8 h-8 text-orange-500" />
            Menu Items
          </h1>
          <p className="text-gray-500 mt-1">Manage delicious food items</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, category, price, restaurant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 md:w-48"
          >
            <option value="">All Categories</option>
            {FOOD_CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <UtensilsCrossed className="w-16 h-16 text-orange-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No menu items found</p>
            <p className="text-gray-400 text-sm mt-1">Add some delicious items!</p>
          </div>
        ) : (
          <>
            <DataTable columns={columns} data={filteredItems} />
            <div className="p-4 border-t border-orange-100">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedItem ? '✏️ Edit Menu Item' : '🍕 Add Menu Item'}
        onConfirm={handleSubmit}
        confirmText={selectedItem ? 'Update' : 'Create'}
        loading={formLoading}
      >
        <div className="space-y-4">
          <Input
            label="Item Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Margherita Pizza"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Price (RWF)</label>
              <div className="relative">
                <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400"
                  placeholder="5000"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              options={FOOD_CATEGORY_OPTIONS}
            />
          </div>
          <Select
            label="Restaurant"
            value={formData.restaurantId}
            onChange={(e) => setFormData({ ...formData, restaurantId: e.target.value })}
            options={[{ value: '', label: 'Select Restaurant' }, ...restaurantOptions]}
          />
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 resize-none"
              placeholder="Describe this delicious item..."
            />
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="🗑️ Delete Menu Item"
        onConfirm={handleDelete}
        confirmText="Delete"
        confirmVariant="danger"
        loading={formLoading}
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UtensilsCrossed className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-600">
            Are you sure you want to delete<br />
            <strong className="text-gray-900">{selectedItem?.name}</strong>?
          </p>
          <p className="text-sm text-gray-400 mt-2">This action cannot be undone.</p>
        </div>
      </Modal>
    </div>
  );
};

export default MenuItems;