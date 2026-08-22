import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Employee } from '../types';
import { api, getStoredToken } from '../lib/api';

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  demoLogin: (employeeId: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  toast: { message: string; type: 'success' | 'error' | 'info' | 'warning' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const refreshMe = async () => {
    try {
      if (getStoredToken()) {
        const res = await api.getMe();
        setUser(res.user);
        setEmployee(res.employee);
      } else {
        setUser(null);
        setEmployee(null);
      }
    } catch (err) {
      console.warn('Session check failed, clearing token');
      api.logout();
      setUser(null);
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.login({ email, password });
      setUser(res.user);
      setEmployee(res.employee || null);
      showToast(`Welcome back, ${res.user.name}!`, 'success');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.register(data);
      setUser(res.user);
      setEmployee(res.employee || null);
      showToast('Registration successful! Welcome to Dayflow.', 'success');
    } finally {
      setLoading(false);
    }
  };

  const demoLogin = async (employeeId: string) => {
    setLoading(true);
    try {
      const res = await api.demoLogin(employeeId);
      setUser(res.user);
      setEmployee(res.employee || null);
      showToast(`Switched account to ${res.user.name} (${res.user.role.toUpperCase()})`, 'info');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
      setUser(null);
      setEmployee(null);
      showToast('You have been signed out.', 'info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        loading,
        login,
        register,
        demoLogin,
        logout,
        refreshMe,
        toast,
        showToast
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
