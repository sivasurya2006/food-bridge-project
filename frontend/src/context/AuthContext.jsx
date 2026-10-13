import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('foodbridge_token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          setUser(res.data);
        } catch (err) {
          console.error("Auth verify error:", err);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const login = async (username, password) => {
    setError(null);
    try {
      const res = await api.login({ username, password });
      const { token: authToken, user: userData } = res.data;
      localStorage.setItem('foodbridge_token', authToken);
      setToken(authToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.non_field_errors?.[0] || 
                  err.response?.data?.error || 
                  'Login failed. Please check credentials.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const register = async (userData) => {
    setError(null);
    try {
      const res = await api.register(userData);
      const { token: authToken, user: createdUser } = res.data;
      localStorage.setItem('foodbridge_token', authToken);
      setToken(authToken);
      setUser(createdUser);
      return { success: true, user: createdUser };
    } catch (err) {
      const errors = err.response?.data;
      let msg = 'Registration failed.';
      if (errors) {
        const firstKey = Object.keys(errors)[0];
        msg = `${firstKey}: ${Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey]}`;
      }
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const demoLogin = async (role) => {
    setError(null);
    try {
      const res = await api.demoLogin(role);
      const { token: authToken, user: userData } = res.data;
      localStorage.setItem('foodbridge_token', authToken);
      setToken(authToken);
      setUser(userData);
      return { success: true, user: userData };
    } catch (err) {
      const msg = err.response?.data?.error || 'Demo login failed.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.logout();
      }
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('foodbridge_token');
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await api.getMe();
        setUser(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    demoLogin,
    logout,
    refreshUser,
    isDonor: user?.role === 'DONOR',
    isNGO: user?.role === 'NGO',
    isVolunteer: user?.role === 'VOLUNTEER',
    isAdmin: user?.role === 'ADMIN',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
