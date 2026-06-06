const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const buildUrl = (path, params) => {
  const url = new URL(path, API_BASE_URL);

  if (params) {
    Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });
  }

  return url.toString();
};

export const getStoredToken = () => localStorage.getItem('smartmart_token');
export const setStoredToken = (token) => localStorage.setItem('smartmart_token', token);
export const clearStoredToken = () => localStorage.removeItem('smartmart_token');
export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('smartmart_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
export const setStoredUser = (user) => localStorage.setItem('smartmart_user', JSON.stringify(user));
export const clearStoredUser = () => localStorage.removeItem('smartmart_user');

export async function apiRequest(path, { method = 'GET', body, params, token } = {}) {
  const headers = {};
  const authToken = token || getStoredToken();

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  let payload;
  if (body !== undefined && body !== null) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  const response = await fetch(buildUrl(path, params), {
    method,
    headers,
    body: payload,
    credentials: 'include',
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const message = data?.message || data?.error || 'Request failed';
    throw new Error(message);
  }

  return data;
}
