import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { DataTable } from '../components/tables/DataTable';
import { Badge } from '../components/common/Badge';
import { locationApi } from '../services/api';
import toast from 'react-hot-toast';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [cells, setCells] = useState([]);
  
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: '',
    parentId: '',
  });

  useEffect(() => {
    loadLocations();
    loadProvinces();
  }, []);

  const loadLocations = async () => {
    try {
      const response = await locationApi.getAll();
      setLocations(response.data);
    } catch (error) {
      toast.error('Failed to load locations');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadProvinces = async () => {
    try {
      const response = await locationApi.getProvinces();
      setProvinces(response.data);
    } catch (error) {
      console.error('Failed to load provinces', error);
    }
  };

  const handleTypeChange = async (type) => {
    setFormData({ ...formData, type, parentId: '' });
    
    // Load parent options based on type
    if (type === 'DISTRICT' && formData.parentId) {
      loadDistricts(formData.parentId);
    } else if (type === 'SECTOR' && formData.parentId) {
      loadSectors(formData.parentId);
    } else if (type === 'CELL' && formData.parentId) {
      loadCells(formData.parentId);
    }
  };

  const loadDistricts = async (provinceId) => {
    try {
      const response = await locationApi.getDistrictsByProvince(provinceId);
      setDistricts(response.data);
    } catch (error) {
      console.error('Failed to load districts', error);
    }
  };

  const loadSectors = async (districtId) => {
    try {
      const response = await locationApi.getSectorsByDistrict(districtId);
      setSectors(response.data);
    } catch (error) {
      console.error('Failed to load sectors', error);
    }
  };

  const loadCells = async (sectorId) => {
    try {
      const response = await locationApi.getCellsBySector(sectorId);
      setCells(response.data);
    } catch (error) {
      console.error('Failed to load cells', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const locationData = {
        code: formData.code,
        name: formData.name,
        type: formData.type,
        parent: formData.parentId ? { id: formData.parentId } : null,
      };

      if (editingLocation) {
        await locationApi.update(editingLocation.id, locationData);
        toast.success('Location updated successfully');
      } else {
        await locationApi.create(locationData);
        toast.success('Location created successfully');
      }

      setModalOpen(false);
      resetForm();
      loadLocations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (location) => {
    setEditingLocation(location);
    setFormData({
      code: location.code,
      name: location.name,
      type: location.type,
      parentId: location.parent?.id || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (location) => {
    if (!window.confirm(`Are you sure you want to delete ${location.name}?`)) {
      return;
    }

    try {
      await locationApi.delete(location.id);
      toast.success('Location deleted successfully');
      loadLocations();
    } catch (error) {
      toast.error(error.response?.data || 'Failed to delete location');
    }
  };

  const resetForm = () => {
    setFormData({ code: '', name: '', type: '', parentId: '' });
    setEditingLocation(null);
  };

  const locationTypeOptions = [
    { value: 'PROVINCE', label: 'Province' },
    { value: 'DISTRICT', label: 'District' },
    { value: 'SECTOR', label: 'Sector' },
    { value: 'CELL', label: 'Cell' },
    { value: 'VILLAGE', label: 'Village' },
  ];

  const getParentOptions = () => {
    if (formData.type === 'DISTRICT') {
      return provinces.map(p => ({ value: p.id, label: p.name }));
    } else if (formData.type === 'SECTOR') {
      return districts.map(d => ({ value: d.id, label: d.name }));
    } else if (formData.type === 'CELL') {
      return sectors.map(s => ({ value: s.id, label: s.name }));
    } else if (formData.type === 'VILLAGE') {
      return cells.map(c => ({ value: c.id, label: c.name }));
    }
    return [];
  };

  const columns = [
    { 
      key: 'code', 
      label: 'Code',
    },
    { 
      key: 'name', 
      label: 'Name',
    },
    { 
      key: 'type', 
      label: 'Type',
      render: (type) => {
        const colors = {
          PROVINCE: 'primary',
          DISTRICT: 'success',
          SECTOR: 'warning',
          CELL: 'info',
          VILLAGE: 'default',
        };
        return <Badge variant={colors[type]}>{type}</Badge>;
      },
    },
    { 
      key: 'parent', 
      label: 'Parent',
      render: (parent) => parent?.name || '-',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Locations</h1>
          <p className="text-gray-600 mt-1">Manage hierarchical location system</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setModalOpen(true);
          }}
        >
          <Plus className="w-5 h-5" />
          Add Location
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {['PROVINCE', 'DISTRICT', 'SECTOR', 'CELL', 'VILLAGE'].map((type) => {
          const count = locations.filter(l => l.type === type).length;
          return (
            <Card key={type}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{type}S</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card>
        <DataTable
          columns={columns}
          data={locations}
          searchable
          actions={(location) => (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleEdit(location)}
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(location)}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </>
          )}
        />
      </Card>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          resetForm();
        }}
        title={editingLocation ? 'Edit Location' : 'Add Location'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            required
            placeholder="e.g., KIG, RWA"
          />

          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="e.g., Kigali, Rwanda"
          />

          <Select
            label="Type"
            options={locationTypeOptions}
            value={formData.type}
            onChange={(e) => handleTypeChange(e.target.value)}
            required
          />

          {formData.type && formData.type !== 'PROVINCE' && (
            <Select
              label={`Parent ${formData.type === 'DISTRICT' ? 'Province' : 
                      formData.type === 'SECTOR' ? 'District' : 
                      formData.type === 'CELL' ? 'Sector' : 'Cell'}`}
              options={getParentOptions()}
              value={formData.parentId}
              onChange={(e) => {
                setFormData({ ...formData, parentId: e.target.value });
                // Load child options if needed
                if (formData.type === 'SECTOR') loadSectors(e.target.value);
                else if (formData.type === 'CELL') loadCells(e.target.value);
              }}
              required
            />
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="flex-1">
              {editingLocation ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Locations;