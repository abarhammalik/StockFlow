import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const customError = {
      message: error.response?.data?.message || error.message || 'An unexpected server error occurred',
      status: error.response?.status || 500,
      details: error.response?.data?.errors || null,
    };
    return Promise.reject(customError);
  }
);

// Health
export const checkHealth = () => api.get('/health');

// Products API
export const getProducts = (params) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// Categories API
export const getCategories = () => api.get('/categories');
export const getCategoryById = (id) => api.get(`/categories/${id}`);
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Suppliers API
export const getSuppliers = () => api.get('/suppliers');
export const getSupplierById = (id) => api.get(`/suppliers/${id}`);
export const createSupplier = (data) => api.post('/suppliers', data);
export const updateSupplier = (id, data) => api.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id) => api.delete(`/suppliers/${id}`);

// Stock Movements API
export const getStockMovements = (params) => api.get('/stock-movements', { params });
export const recordStockMovement = (data) => api.post('/stock-movements', data);
export const getProductMovements = (productId) => api.get(`/stock-movements/product/${productId}`);

// Customers API
export const getCustomers = (params) => api.get('/customers', { params });
export const getCustomerByPhone = (phone) => api.get(`/customers/phone/${phone}`);
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);

// Sales & POS Billing API
export const getSales = (params) => api.get('/sales', { params });
export const getSaleById = (id) => api.get(`/sales/${id}`);
export const createSale = (data) => api.post('/sales', data);

// Analytics Pipelines API
export const getDashboardSummary = () => api.get('/analytics/dashboard');
export const getCategoryAnalytics = () => api.get('/analytics/categories');
export const getSupplierAnalytics = () => api.get('/analytics/suppliers');
export const getTopMovingProducts = () => api.get('/analytics/top-products');
export const getLowStockAnalytics = () => api.get('/analytics/low-stock');
export const getMovementAnalytics = () => api.get('/analytics/movements');

// Demo Tools
export const resetDemoDataset = () => api.post('/demo/reset');

export default api;
