import { apiRequest } from './api';

export const listProducts = (params) => apiRequest('/api/products', { params });
export const getProduct = (id) => apiRequest(`/api/products/${id}`);
export const createProduct = (payload) => apiRequest('/api/products', { method: 'POST', body: payload });
export const updateProduct = (id, payload) => apiRequest(`/api/products/${id}`, { method: 'PUT', body: payload });
export const adjustStock = (id, payload) =>
  apiRequest(`/api/products/${id}/stock`, { method: 'PATCH', body: payload });
export const removeProduct = (id) => apiRequest(`/api/products/${id}`, { method: 'DELETE' });
