import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthAPI } from '../api/resources';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('syncspace_token');
    if (!token) {
      setLoading(false);
      return;
    }
    AuthAPI.me()
      .then(({ user }) => setUser(user))
      .catch(() => localStorage.removeItem('syncspace_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { user, token } = await AuthAPI.login({ email, password });
    localStorage.setItem('syncspace_token', token);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { user, token } = await AuthAPI.register({ name, email, password });
    localStorage.setItem('syncspace_token', token);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('syncspace_token');
    setUser(null);
    window.location.href = '/login';
  }, []);

  const updateUser = useCallback((patch) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
