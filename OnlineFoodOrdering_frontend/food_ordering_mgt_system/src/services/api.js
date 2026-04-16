import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ========== Auth API ==========
export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (data) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  forgotPasswordOTP: (email) =>
    api.post("/auth/forgot-password-otp", { email }),
  resetPassword: (token, newPassword) =>
    api.post("/auth/reset-password", { token, newPassword }),
  resetPasswordOTP: (email, newPassword) =>
    api.post("/auth/reset-password-otp", { email, newPassword }),
  verifyPasswordResetOTP: (email, otp) =>
    api.post("/auth/verify-password-reset-otp", { email, otp }),
  verifyOTP: (email, otp) => api.post("/auth/verify-otp", { email, otp }),
  verifyLoginOTP: (email, otp) =>
    api.post("/auth/verify-login-otp", { email, otp }),
  resendOTP: (email) => api.post("/auth/resend-otp", { email }),
  getCurrentUser: () => api.get("/auth/me"),
  googleAuth: (accessToken) => api.post("/auth/google", { accessToken }),
};

// ========== Location API ==========
export const locationApi = {
  getAll: () => api.get("/locations"),
  getAllPaginated: (page = 0, size = 10) =>
    api.get(`/locations/paginated?page=${page}&size=${size}`),
  getById: (id) => api.get(`/locations/${id}`),
  getByCode: (code) => api.get(`/locations/code/${code}`),
  search: (term) => api.get(`/locations/search?term=${term}`),
  create: (data) => api.post("/locations", data),
  update: (id, data) => api.put(`/locations/${id}`, data),
  delete: (id) => api.delete(`/locations/${id}`),
  getProvinces: () => api.get("/locations/provinces"),
  getDistrictsByProvince: (provinceId) =>
    api.get(`/locations/provinces/${provinceId}/districts`),
  getSectorsByDistrict: (districtId) =>
    api.get(`/locations/districts/${districtId}/sectors`),
  getCellsBySector: (sectorId) =>
    api.get(`/locations/sectors/${sectorId}/cells`),
  getVillagesByCell: (cellId) => api.get(`/locations/cells/${cellId}/villages`),
  getByType: (type) => api.get(`/locations/type/${type}`),
};

// ========== User API ==========
export const userApi = {
  getAll: () => api.get("/users"),
  getAllPaginated: (
    page = 0,
    size = 10,
    sortBy = "id",
    sortDirection = "asc",
  ) =>
    api.get(
      `/users/paginated?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`,
    ),
  getById: (id) => api.get(`/users/${id}`),
  getByEmail: (email) => api.get(`/users/email/${email}`),
  create: (data) => api.post("/users", data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  getByRole: (role) => api.get(`/users/role/${role}`),
  getByLocation: (locationId) => api.get(`/users/location/${locationId}`),
  searchByName: (name) => api.get(`/users/search/${name}`),
  checkEmailExists: (email) => api.get(`/users/exists/email/${email}`),
};

// ========== Restaurant API ==========

// ========== Order API ==========
export const orderApi = {
  getAll: () => api.get("/orders"),
  getAllPaginated: (page = 0, size = 10) =>
    api.get(`/orders/paginated?page=${page}&size=${size}`),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post("/orders", data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  updateStatus: (id, status) =>
    api.patch(`/orders/${id}/status`, null, { params: { status } }),
  delete: (id) => api.delete(`/orders/${id}`),
  getByCustomer: (customerId) => api.get(`/orders/customer/${customerId}`),
  getByStatus: (status) => api.get(`/orders/status/${status}`),
  getByDateRange: (start, end) =>
    api.get(`/orders/date-range?start=${start}&end=${end}`),
  // Restaurant-specific endpoints
  getByRestaurant: (restaurantId) =>
    api.get(`/orders/restaurant/${restaurantId}`),
  getPendingByRestaurant: (restaurantId) =>
    api.get(`/orders/restaurant/${restaurantId}/pending`),
  getRestaurantStats: (restaurantId) =>
    api.get(`/orders/restaurant/${restaurantId}/stats`),
};

// Menu Items API
export const menuItemApi = {
  getAll: () => api.get("/menu-items"),
  getAllPaginated: (page = 0, size = 5) =>
    api.get(`/menu-items/paginated?page=${page}&size=${size}`),
  getById: (id) => api.get(`/menu-items/${id}`),
  getByCategory: (category) => api.get(`/menu-items/category/${category}`),
  getByRestaurant: (restaurantId) =>
    api.get(`/menu-items/restaurant/${restaurantId}`),
  create: (data) => api.post("/menu-items", data),
  update: (id, data) => api.put(`/menu-items/${id}`, data),
  delete: (id) => api.delete(`/menu-items/${id}`),
};

// Restaurant API
export const restaurantApi = {
  getAll: () => api.get("/restaurants"),
  getById: (id) => api.get(`/restaurants/${id}`),
  getByOwner: (ownerId) => api.get(`/restaurants/owner/${ownerId}`),
  create: (data) => api.post("/restaurants", data),
  update: (id, data) => api.put(`/restaurants/${id}`, data),
  delete: (id) => api.delete(`/restaurants/${id}`),
};

// ========== Payment API ==========
export const paymentApi = {
  getAll: () => api.get("/payments"),
  getById: (id) => api.get(`/payments/${id}`),
  getByOrder: (orderId) => api.get(`/payments/order/${orderId}`),
  create: (data) => api.post("/payments", data),
  update: (id, data) => api.put(`/payments/${id}`, data),
  delete: (id) => api.delete(`/payments/${id}`),
  getByStatus: (status) => api.get(`/payments/status/${status}`),
  checkTransactionExists: (transactionId) =>
    api.get(`/payments/exists-by-tx?tx=${transactionId}`),
};

// ========== Global Search API ==========
export const searchApi = {
  globalSearch: (query) => api.get(`/search?q=${encodeURIComponent(query)}`),
};

export default api;
