import { apiRequest } from './api';

export const listSales = (params) => apiRequest('/api/sales', { params });
export const getSalesAnalytics = (params) => apiRequest('/api/sales/analytics', { params });
export const createSale = (payload) => apiRequest('/api/sales', { method: 'POST', body: payload });
export const updateSale = (id, payload) => apiRequest(`/api/sales/${id}`, { method: 'PUT', body: payload });
export const getSale = (id) => apiRequest(`/api/sales/${id}`);
export const getInvoice = (id) => apiRequest(`/api/sales/${id}/invoice`);
export const getSaleAudit = (id) => apiRequest(`/api/sales/${id}/audit`);
export const cancelSale = (id) => apiRequest(`/api/sales/${id}/cancel`, { method: 'PATCH' });
