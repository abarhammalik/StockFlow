import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  signupUser,
  loginUser,
  getMe,
  updateProfile as updateProfileApi,
} from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('stockflow_token'));
  const [loading, setLoading] = useState(true);

  // Load profile on initial mount if token exists
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('[AuthContext] Failed to load user:', err);
          logout();
        }
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  const saveAuthData = (newToken, newUser) => {
    localStorage.setItem('stockflow_token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const signup = async (name, email, password) => {
    const res = await signupUser({ name, email, password });
    // No token is issued on signup — user must verify email first
    return res;
  };

  const login = async (email, password) => {
    const res = await loginUser({ email, password });
    if (res.success && res.token) {
      saveAuthData(res.token, res.user);
    }
    return res;
  };

  const updateUser = async (profileData) => {
    const res = await updateProfileApi(profileData);
    if (res.success && res.user) {
      setUser((prev) => ({ ...prev, ...res.user }));
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('stockflow_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    signup,
    login,
    updateUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
