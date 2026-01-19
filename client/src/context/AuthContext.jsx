import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      console.log('[Auth] Checking authentication...');
      const response = await authAPI.getCurrentUser();
      setUser(response.user);
      console.log('[Auth] User authenticated:', response.user.role);
    } catch (error) {
      console.log('[Auth] No active session');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('[Auth] Login attempt:', credentials.email);
      const response = await authAPI.login(credentials);
      setUser(response.user);
      console.log('[Auth] Login successful:', response.user.role);
      return response;
    } catch (error) {
      console.error('[Auth] Login failed:', error.message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('[Auth] Register attempt:', userData.email, 'Role:', userData.role);
      const response = await authAPI.register(userData);
      setUser(response.user);
      console.log('[Auth] Registration successful:', response.user.role);
      return response;
    } catch (error) {
      console.error('[Auth] Registration failed:', error.message);
      throw error;
    }
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
