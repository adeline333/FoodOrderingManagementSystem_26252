import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, User, ChefHat, MapPin, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { locationApi } from '../../services/api';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
    locationId: null,
  });

  // Location state
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [cells, setCells] = useState([]);
  const [villages, setVillages] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [selectedCell, setSelectedCell] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');

  // Load provinces on mount
  useEffect(() => {
    loadProvinces();
  }, []);

  const loadProvinces = async () => {
    try {
      const response = await locationApi.getProvinces();
      setProvinces(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading provinces:', error);
    }
  };

  const handleProvinceChange = async (provinceId) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict('');
    setSelectedSector('');
    setSelectedCell('');
    setSelectedVillage('');
    setDistricts([]);
    setSectors([]);
    setCells([]);
    setVillages([]);
    setFormData({ ...formData, locationId: provinceId || null });

    if (provinceId) {
      setLoadingLocations(true);
      try {
        const response = await locationApi.getDistrictsByProvince(provinceId);
        setDistricts(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error loading districts:', error);
      } finally {
        setLoadingLocations(false);
      }
    }
  };

  const handleDistrictChange = async (districtId) => {
    setSelectedDistrict(districtId);
    setSelectedSector('');
    setSelectedCell('');
    setSelectedVillage('');
    setSectors([]);
    setCells([]);
    setVillages([]);
    setFormData({ ...formData, locationId: districtId || selectedProvince });

    if (districtId) {
      setLoadingLocations(true);
      try {
        const response = await locationApi.getSectorsByDistrict(districtId);
        setSectors(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error loading sectors:', error);
      } finally {
        setLoadingLocations(false);
      }
    }
  };

  const handleSectorChange = async (sectorId) => {
    setSelectedSector(sectorId);
    setSelectedCell('');
    setSelectedVillage('');
    setCells([]);
    setVillages([]);
    setFormData({ ...formData, locationId: sectorId || selectedDistrict });

    if (sectorId) {
      setLoadingLocations(true);
      try {
        const response = await locationApi.getCellsBySector(sectorId);
        setCells(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error loading cells:', error);
      } finally {
        setLoadingLocations(false);
      }
    }
  };

  const handleCellChange = async (cellId) => {
    setSelectedCell(cellId);
    setSelectedVillage('');
    setVillages([]);
    setFormData({ ...formData, locationId: cellId || selectedSector });

    if (cellId) {
      setLoadingLocations(true);
      try {
        const response = await locationApi.getVillagesByCell(cellId);
        setVillages(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error loading villages:', error);
      } finally {
        setLoadingLocations(false);
      }
    }
  };

  const handleVillageChange = (villageId) => {
    setSelectedVillage(villageId);
    setFormData({ ...formData, locationId: villageId || selectedCell });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      role: formData.role,
      locationId: formData.locationId,
    });

    if (result.success) {
      toast.success('Registration successful! Please verify your email.');
      navigate('/verify-otp', { state: { email: formData.email } });
    } else {
      toast.error(result.error || 'Registration failed');
    }

    setLoading(false);
  };

  const roleOptions = [
    { value: 'CUSTOMER', label: 'Customer' },
    { value: 'RESTAURANT_OWNER', label: 'Restaurant Owner' },
    { value: 'DELIVERY_PERSON', label: 'Delivery Person' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  return (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Join FoodOrder! 🎉</h2>
        <p className="text-gray-500 mt-1">Create your account to start ordering</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 bg-orange-50 border-2 border-orange-100 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                placeholder="Your first name"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full pl-10 pr-3 py-2.5 bg-orange-50 border-2 border-orange-100 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
                placeholder="Your last name"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-11 pr-4 py-2.5 bg-orange-50 border-2 border-orange-100 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-11 pr-4 py-2.5 bg-orange-50 border-2 border-orange-100 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              placeholder="+250 XXX XXX XXX"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">I am a...</label>
          <div className="relative">
            <ChefHat className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400 z-10" />
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full pl-11 pr-4 py-2.5 bg-orange-50 border-2 border-orange-100 rounded-xl text-gray-900 outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 appearance-none cursor-pointer"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location Selection */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-orange-400" />
            Your Location
            {loadingLocations && <Loader2 className="w-4 h-4 animate-spin text-orange-500" />}
          </label>

          {/* Province */}
          <select
            value={selectedProvince}
            onChange={(e) => handleProvinceChange(e.target.value)}
            className="w-full px-4 py-2.5 bg-orange-50 border-2 border-orange-100 rounded-xl text-gray-900 outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 appearance-none cursor-pointer"
          >
            <option value="">Select Province</option>
            {provinces.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* District */}
          {districts.length > 0 && (
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-orange-50 border-2 border-orange-100 rounded-xl text-gray-900 outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 appearance-none cursor-pointer"
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          )}

          {/* Sector */}
          {sectors.length > 0 && (
            <select
              value={selectedSector}
              onChange={(e) => handleSectorChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-orange-50 border-2 border-orange-100 rounded-xl text-gray-900 outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 appearance-none cursor-pointer"
            >
              <option value="">Select Sector</option>
              {sectors.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}

          {/* Cell */}
          {cells.length > 0 && (
            <select
              value={selectedCell}
              onChange={(e) => handleCellChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-orange-50 border-2 border-orange-100 rounded-xl text-gray-900 outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 appearance-none cursor-pointer"
            >
              <option value="">Select Cell</option>
              {cells.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {/* Village */}
          {villages.length > 0 && (
            <select
              value={selectedVillage}
              onChange={(e) => handleVillageChange(e.target.value)}
              className="w-full px-4 py-2.5 bg-orange-50 border-2 border-orange-100 rounded-xl text-gray-900 outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 appearance-none cursor-pointer"
            >
              <option value="">Select Village</option>
              {villages.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-11 pr-4 py-2.5 bg-orange-50 border-2 border-orange-100 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-400" />
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full pl-11 pr-4 py-2.5 bg-orange-50 border-2 border-orange-100 rounded-xl text-gray-900 placeholder-gray-400 outline-none transition-all focus:bg-white focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10"
              placeholder="••••••••"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:shadow-xl hover:-translate-y-0.5"
          loading={loading}
        >
          Create Account
        </Button>
      </form>

      <p className="text-center text-gray-600 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-orange-600 hover:text-orange-700 transition-colors">
          Sign in
        </Link>
      </p>
    </>
  );
};

export default Register;