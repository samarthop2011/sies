import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sies-token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('sies-token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const signup = async (data) => {
    const res = await api.post('/auth/signup', data);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('sies-token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('sies-token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}
