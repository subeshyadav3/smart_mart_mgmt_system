import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  clearStoredToken,
  clearStoredUser,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from '../services/api';
import { getCurrentUser, loginMember, loginStaff, logoutUser, registerMember } from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const savedToken = getStoredToken();
      if (!savedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        const currentUser = response?.data;
        if (currentUser) {
          setUser(currentUser);
          setStoredUser(currentUser);
        }
      } catch {
        clearStoredToken();
        clearStoredUser();
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const commitSession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    setStoredToken(nextToken);
    setStoredUser(nextUser);
  };

  const login = async ({ mode, values }) => {
    const response = mode === 'member' ? await loginMember(values) : await loginStaff(values);
    const nextToken = response?.data?.token;
    const nextUser = response?.data?.user;

    if (!nextToken || !nextUser) {
      throw new Error('Login response is incomplete');
    }

    commitSession(nextToken, nextUser);
    return nextUser;
  };

  const register = async (values) => {
    const response = await registerMember(values);
    return response?.data;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore network errors on logout
    }

    clearStoredToken();
    clearStoredUser();
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!getStoredToken()) return null;

    const response = await getCurrentUser();
    const currentUser = response?.data;
    if (currentUser) {
      setUser(currentUser);
      setStoredUser(currentUser);
    }
    return currentUser;
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
