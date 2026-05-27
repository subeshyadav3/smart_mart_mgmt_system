'use client';

import React, { createContext, useEffect, useState, useCallback } from 'react';
import { Staff, Member, AuthContextType, LoginRequest } from '@/types';
import { authService } from '@/services/api';
import { storage } from '@/lib/storage';
import toast from 'react-hot-toast';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(Staff | Member) | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userType, setUserType] = useState<'staff' | 'member' | null>(null);

  // Initialize auth from storage
  useEffect(() => {
    const storedToken = storage.getToken();
    const storedUser = storage.getUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      setUserType('email' in storedUser ? 'staff' : 'member');
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (credentials: LoginRequest, type: 'staff' | 'member') => {
      setIsLoading(true);
      try {
        let response;
        if (type === 'staff' && credentials.email) {
          response = await authService.staffLogin(credentials.email, credentials.password);
        } else if (type === 'member' && credentials.membershipId) {
          response = await authService.memberLogin(credentials.membershipId, credentials.password);
        } else {
          throw new Error('Invalid credentials');
        }

        const { data } = response.data;
        storage.setToken(data.token);
        storage.setUser(data.user);

        setToken(data.token);
        setUser(data.user);
        setUserType(type);

        toast.success('Login successful!');
      } catch (error: any) {
        const message = error.response?.data?.message || 'Login failed';
        toast.error(message);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    authService.logout();
    storage.clear();
    setUser(null);
    setToken(null);
    setUserType(null);
    toast.success('Logged out successfully');
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    userType,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
