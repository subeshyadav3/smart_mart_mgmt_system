import { apiRequest } from './api';

export const listStaffs = () => apiRequest('/api/workforce/staffs');
export const getStaff = (id) => apiRequest(`/api/workforce/staffs/${id}`);
export const createStaff = (payload) => apiRequest('/api/workforce/staff/create', { method: 'POST', body: payload });
export const updateStaff = (id, payload) => apiRequest(`/api/workforce/staffs/${id}`, { method: 'PUT', body: payload });
export const updateStaffRole = (id, role) => apiRequest(`/api/workforce/staffs/${id}/role`, { method: 'PATCH', body: { role } });
export const updateStaffStatus = (id, isActive) =>
  apiRequest(`/api/workforce/staffs/${id}/status`, { method: 'PATCH', body: { isActive } });
export const deleteStaff = (id) => apiRequest(`/api/workforce/staffs/${id}`, { method: 'DELETE' });
