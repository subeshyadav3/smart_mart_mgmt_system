import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: `${API_URL}/api`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Add token to requests
  client.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Handle errors
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Clear auth data and redirect to login
        Cookies.remove('token');
        Cookies.remove('user');
        window.location.href = '/auth/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();

// Auth Service
export const authService = {
  staffLogin: (email: string, password: string) =>
    apiClient.post('/auth/staff/login', { email, password }),

  memberLogin: (membershipId: string, password: string) =>
    apiClient.post('/auth/member/login', { membershipId, password }),

  memberRegister: (fullName: string, phoneNumber: string, password: string) =>
    apiClient.post('/auth/member/register', { fullName, phoneNumber, password }),

  logout: () => {
    Cookies.remove('token');
    Cookies.remove('user');
  },
};

// Product Service
export const productService = {
  getProducts: (page = 1, limit = 10, search = '', categoryId = '') =>
    apiClient.get('/products', {
      params: { page, limit, search, categoryId },
    }),

  getProductById: (id: string) =>
    apiClient.get(`/products/${id}`),

  createProduct: (data: any) =>
    apiClient.post('/products', data),

  updateProduct: (id: string, data: any) =>
    apiClient.put(`/products/${id}`, data),

  deleteProduct: (id: string) =>
    apiClient.delete(`/products/${id}`),

  adjustStock: (id: string, changeAmount: number, reason: string) =>
    apiClient.patch(`/products/${id}/stock`, { changeAmount, reason }),

  getCategories: () =>
    apiClient.get('/products/categories'),

  getInventoryLogs: (page = 1, limit = 10) =>
    apiClient.get('/products/inventory-logs', { params: { page, limit } }),
};

// Workforce Service
export const workforceService = {
  getStaff: (page = 1, limit = 10) =>
    apiClient.get('/workforce', { params: { page, limit } }),

  getStaffById: (id: string) =>
    apiClient.get(`/workforce/${id}`),

  createStaff: (data: any) =>
    apiClient.post('/workforce', data),

  updateStaff: (id: string, data: any) =>
    apiClient.put(`/workforce/${id}`, data),

  deleteStaff: (id: string) =>
    apiClient.delete(`/workforce/${id}`),

  getMembers: (page = 1, limit = 10) =>
    apiClient.get('/workforce/members', { params: { page, limit } }),

  getMemberById: (id: string) =>
    apiClient.get(`/workforce/members/${id}`),
};

// Sales Service
export const salesService = {
  createBill: (data: any) =>
    apiClient.post('/sales/bills', data),

  getBills: (page = 1, limit = 10) =>
    apiClient.get('/sales/bills', { params: { page, limit } }),

  getBillById: (id: string) =>
    apiClient.get(`/sales/bills/${id}`),

  updateBillStatus: (id: string, status: string) =>
    apiClient.patch(`/sales/bills/${id}/status`, { status }),

  getReports: (startDate: string, endDate: string) =>
    apiClient.get('/sales/reports', { params: { startDate, endDate } }),

  getSalesAnalytics: () =>
    apiClient.get('/sales/analytics'),
};
