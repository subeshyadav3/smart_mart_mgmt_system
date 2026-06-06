import { apiRequest } from './api';

export const loginStaff = (payload) => apiRequest('/api/auth/staff/login', { method: 'POST', body: payload });
export const loginMember = (payload) => apiRequest('/api/auth/member/login', { method: 'POST', body: payload });
export const registerMember = (payload) => apiRequest('/api/auth/member/register', { method: 'POST', body: payload });
export const getCurrentUser = () => apiRequest('/api/auth/me');
export const updateCurrentUser = (payload) => apiRequest('/api/auth/me', { method: 'PUT', body: payload });
export const logoutUser = () => apiRequest('/api/auth/logout', { method: 'POST' });

export const createMember = (payload) => apiRequest('/api/auth/member/create', { method: 'POST', body: payload });
export const listMembers = () => apiRequest('/api/auth/members');
export const getMember = (id) => apiRequest(`/api/auth/members/${id}`);
export const updateMember = (id, payload) => apiRequest(`/api/auth/members/${id}`, { method: 'PUT', body: payload });
export const updateMemberStatus = (id, isActive) =>
  apiRequest(`/api/auth/members/${id}/status`, { method: 'PATCH', body: { isActive } });
export const deleteMember = (id) => apiRequest(`/api/auth/members/${id}`, { method: 'DELETE' });
