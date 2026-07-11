import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithPhone: (phone: string, password: string) => Promise<void>;
  register: (data: { email?: string; phone?: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        await api.init();
        const response = await api.getProfile();
        if (response.success && response.data) {
          setUser(response.data);
        } else {
          // Try to refresh token
          try {
            await api.refreshToken();
            const retryResponse = await api.getProfile();
            if (retryResponse.success && retryResponse.data) {
              setUser(retryResponse.data);
            }
          } catch {
            // Refresh failed, user needs to login
            await api.logout();
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.login({ email, password });
    if (response.success && response.data) {
      setUser(response.data.user);
    } else {
      throw new Error(response.error?.message || 'Login failed');
    }
  };

  const loginWithPhone = async (phone: string, password: string) => {
    const response = await api.login({ phone, password });
    if (response.success && response.data) {
      setUser(response.data.user);
    } else {
      throw new Error(response.error?.message || 'Login failed');
    }
  };

  const register = async (data: { email?: string; phone?: string; password: string; firstName: string; lastName: string }) => {
    const response = await api.register(data);
    if (response.success && response.data) {
      setUser(response.data.user);
    } else {
      throw new Error(response.error?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        loginWithPhone,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
