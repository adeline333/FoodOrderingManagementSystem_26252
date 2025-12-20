import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, MapPin, Map } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { DataTable } from '../components/tables/DataTable';
import { Pagination } from '../components/tables/Pagination';
import { locationApi } from '../services/api';
import { LOCATION_TYPE_OPTIONS } from '../utils/constants';
import toast from 'react-hot-toast';

const Locations = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const highlightId = searchParams.get('highlight');
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [highlightedLocation, setHighlightedLocation] = useState(null);
  const highlightRef = useRef(null);
  
  const [parentLocations, setParentLocations] = useState([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'PROVINCE',
    parentId: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadLocations();
  }, [currentPage, typeFilter]);

  // Handle highlighting from global search
  useEffect(() => {
    if (highlightId && locations.length > 0) {
      const locationId = parseInt(highlightId);
      setHighlightedLocation(locationId);
      setTimeout(() => {
        if (highlightRef.current) {
          highlightRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }
      }, 500);
      setTimeout(() => {
        setHighlightedLocation(null);
        navigate('/locations', { replace: true });
      }, 3000);
    }
  }, [highlightId, locations, navigate]);

  const loadLocations = async () => {
    setLoading(true);
    try {
      let response;
      if (typeFilter) {
        response = await locationApi.getByType(typeFilter);
        setLocations(response.data);
        setTotalPages(1);
      } else {
        response = await locationApi.getAllPaginated(currentPage, pageSize);
        setLocations(response.data.content || response.data);
        setTotalPages(response.data.totalPages || 1);
      }
      
      const allLocations = await locationApi.getAll();
      setParentLocations(allLocations.data);
    } catch (error) {
      console.error('Error loading locations:', error);
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  const filteredLocations = locations.filter((location) => {
    const term = searchTerm.toLowerCase();
    const id = location.id?.toString() || '';
    const name = location.name?.toLowerCase() || '';
    const code = location.code?.toLowerCase() || '';
    const type = location.type?.toLowerCase().replace('_', ' ') || '';
    const parentName = location.parent?.name?.toLowerCase() || '';

    return id.includes(term) ||
           name.includes(term) ||
           code.includes(term) ||
           type.includes(term) ||
           parentName.includes(term);
  });

  const openCreateModal = () => {
    setSelectedLocation(null);
    setFormData({ code: '', name: '', type: 'PROVINCE', parentId: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (location) => {
    setSelectedLocation(location);
    setFormData({
      code: location.code,
      name: location.name,
      type: location.type,
      parentId: location.parent?.id || '',
    });
    setIsModalOpen(true);
  };

  const openDeleteModal = (location) => {
    setSelectedLocation(location);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async () => {
    setFormLoading(true);
    try {
      const payload = {
        code: formData.code,
        name: formData.name,
        type: formData.type,
        parent: formData.parentId ? { id: parseInt(formData.parentId) } : null,
      };
      
      if (selectedLocation) {
        await locationApi.update(selectedLocation.id, payload);
        toast.success('Location updated successfully');
      } else {
        await locationApi.create(payload);
        toast.success('Location created successfully');
      }
      setIsModalOpen(false);
      loadLocations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await locationApi.delete(selectedLocation.id);
      toast.success('Location deleted successfully');
      setIsDeleteModalOpen(false);
      loadLocations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete location');
    } finally {
      setFormLoading(false);
    }
  };

  const getTypeBadge = (type) => {
    const styles = {
      PROVINCE: 'bg-blue-100 text-blue-700 border-blue-200',
      DISTRICT: 'bg-green-100 text-green-700 border-green-200',
      SECTOR: 'bg-purple-100 text-purple-700 border-purple-200',
      CELL: 'bg-orange-100 text-orange-700 border-orange-200',
      VILLAGE: 'bg-pink-100 text-pink-700 border-pink-200',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${styles[type] || 'bg-gray-100 text-gray-700'}`}>
        {type}
      </span>
    );
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'code', label: 'Code', render: (code) => <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{code}</span> },
    { 
      key: 'name', 
      label: 'Name',
      render: (name) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span className="font-semibold text-gray-900">{name}</span>
        </div>
      )
    },
    { 
      key: 'type', 
      label: 'Type',
      render: (type) => getTypeBadge(type)
    },
    { 
      key: 'parent', 
      label: 'Parent',
      render: (parent) => parent ? (
        <span className="text-sm text-gray-600">{parent.name}</span>
      ) : <span className="text-gray-400">—</span>
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, location) => (
        <div className="flex gap-1">
          <button onClick={() => openEditModal(location)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
            <Edit className="w-4 h-4" />
          </button>
          <button onClick={() => openDeleteModal(location)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const getParentOptions = () => {
    const typeHierarchy = ['PROVINCE', 'DISTRICT', 'SECTOR', 'CELL', 'VILLAGE'];
    const currentTypeIndex = typeHierarchy.indexOf(formData.type);
    
    if (currentTypeIndex <= 0) return [{ value: '', label: 'No Parent (Top Level)' }];
    
    const parentType = typeHierarchy[currentTypeIndex - 1];
    const filtered = parentLocations.filter(loc => loc.type === parentType);
    
    return [
      { value: '', label: 'Select Parent' },
      ...filtered.map(loc => ({ value: loc.id.toString(), label: `${loc.name} (${loc.type})` }))
    ];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Map className="w-8 h-8 text-orange-500" />
            Locations
          </h1>
          <p className="text-gray-500 mt-1">Manage delivery areas and zones</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, code, type, parent..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              />
            </div>
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400 md:w-48"
          >
            <option value="">All Types</option>
            {LOCATION_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
          </div>
        ) : filteredLocations.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-16 h-16 text-orange-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No locations found</p>
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              data={filteredLocations}
              highlightedId={highlightedLocation}
              highlightRef={highlightRef}
            />
            <div className="p-4 border-t border-orange-100">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedLocation ? '✏️ Edit Location' : '📍 Add Location'}
        onConfirm={handleSubmit}
        confirmText={selectedLocation ? 'Update' : 'Create'}
        loading={formLoading}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400"
              placeholder="e.g., RW-01"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-orange-50 border-2 border-orange-100 rounded-xl outline-none transition-all focus:bg-white focus:border-orange-400"
              placeholder="e.g., Kigali"
            />
          </div>
          <Select
            label="Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value, parentId: '' })}
            options={LOCATION_TYPE_OPTIONS}
          />
          <Select
            label="Parent Location"
            value={formData.parentId}
            onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
            options={getParentOptions()}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="🗑️ Delete Location"
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
            Are you sure you want to delete <strong>{selectedLocation?.name}</strong>?
          </p>
          <p className="text-sm text-red-500 mt-2">This will also delete all child locations.</p>
        </div>
      </Modal>
    </div>
  );
};

export default Locations;