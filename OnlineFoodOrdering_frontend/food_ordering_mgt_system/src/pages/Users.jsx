import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, Users as UsersIcon, UserPlus } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { DataTable } from '../components/tables/DataTable';
import { Pagination } from '../components/tables/Pagination';
import { userApi } from '../services/api';
import { USER_ROLE_OPTIONS } from '../utils/constants';
import { getFullName } from '../utils/helpers';
import toast from 'react-hot-toast';

const Users = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const highlightId = searchParams.get('highlight');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [highlightedUser, setHighlightedUser] = useState(null);
  const highlightRef = useRef(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'CUSTOMER',
    password: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [currentPage, roleFilter]);

  // Handle highlighting from global search
  useEffect(() => {
    if (highlightId && users.length > 0) {
      const userId = parseInt(highlightId);
      setHighlightedUser(userId);
      // Scroll to highlighted row after a short delay
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
        setHighlightedUser(null);
        navigate('/users', { replace: true });
      }, 3000);
    }
  }, [highlightId, users, navigate]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      let response;
      if (roleFilter) {
        response = await userApi.getByRole(roleFilter);
        setUsers(response.data);
        setTotalPages(1);
      } else {
        response = await userApi.getAllPaginated(currentPage, pageSize);
        setUsers(response.data.content || response.data);
        setTotalPages(response.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredUsers = users.filter((user) => {
    const term = searchTerm.toLowerCase();
    const fullName = getFullName(user.firstName, user.lastName).toLowerCase();
    const email = user.email?.toLowerCase() || '';
    const phone = user.phone?.toLowerCase() || '';
    const role = user.role?.toLowerCase().replace('_', ' ') || '';
    const id = user.id?.toString() || '';

    return fullName.includes(term) ||
           email.includes(term) ||
           phone.includes(term) ||
           role.includes(term) ||
           id.includes(term);
  });

  const openCreateModal = () => {
    setSelectedUser(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'CUSTOMER',
      password: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      role: user.role,
      password: '',
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async () => {
    setFormLoading(true);
    try {
      if (selectedUser) {
        await userApi.update(selectedUser.id, formData);
        toast.success('User updated successfully');
      } else {
        await userApi.create(formData);
        toast.success('User created successfully');
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await userApi.delete(selectedUser.id);
      toast.success('User deleted successfully');
      setIsDeleteModalOpen(false);
      loadUsers();
    } catch (error) {
      toast.error('Failed to delete user', error);
    } finally {
      setFormLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const styles = {
      ADMIN: 'bg-red-100 text-red-700 border-red-200',
      CUSTOMER: 'bg-blue-100 text-blue-700 border-blue-200',
      RESTAURANT_OWNER: 'bg-green-100 text-green-700 border-green-200',
      DELIVERY_PERSON: 'bg-purple-100 text-purple-700 border-purple-200',
    };
    const icons = {
      ADMIN: '👑',
      CUSTOMER: '🍽️',
      RESTAURANT_OWNER: '👨‍🍳',
      DELIVERY_PERSON: '🚴',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${styles[role] || 'bg-gray-100 text-gray-700'}`}>
        {icons[role]} {role?.replace('_', ' ')}
      </span>
    );
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'name', 
      label: 'Name',
      render: (_, user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
            {user.firstName?.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{getFullName(user.firstName, user.lastName)}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>
      )
    },
    { key: 'phone', label: 'Phone' },
    { 
      key: 'role', 
      label: 'Role',
      render: (role) => getRoleBadge(role)
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, user) => (
        <div className="flex gap-1">
          <button
            onClick={() => openEditModal(user)}
            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(user)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <UsersIcon className="w-8 h-8 text-orange-500" />
            Users
          </h1>
          <p className="text-gray-500 mt-1">Manage all system users</p>
        </div>
        <Button onClick={openCreateModal}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
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
                placeholder="Search by name, email, phone, role..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 md:w-48"
          >
            <option value="">All Roles</option>
            {USER_ROLE_OPTIONS.map((opt) => (
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
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <UsersIcon className="w-16 h-16 text-orange-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No users found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={filteredUsers}
              highlightedId={highlightedUser}
              highlightRef={highlightRef}
            />
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
        title={selectedUser ? '✏️ Edit User' : '➕ Create User'}
        onConfirm={handleSubmit}
        confirmText={selectedUser ? 'Update' : 'Create'}
        loading={formLoading}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
          <Input
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            required
          />
          <Select
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            options={USER_ROLE_OPTIONS}
          />
          {!selectedUser && (
            <Input
              type="password"
              label="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          )}
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="🗑️ Delete User"
        onConfirm={handleDelete}
        confirmText="Delete"
        confirmVariant="danger"
        loading={formLoading}
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-600">
            Are you sure you want to delete<br />
            <strong className="text-gray-900">{selectedUser && getFullName(selectedUser.firstName, selectedUser.lastName)}</strong>?
          </p>
          <p className="text-sm text-gray-400 mt-2">This action cannot be undone.</p>
        </div>
      </Modal>
    </div>
  );
};

export default Users;