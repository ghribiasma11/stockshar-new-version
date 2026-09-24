import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('stockshare_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem('stockshare_token');
      })
      .finally(() => setLoading(false));
  }, []);

  function login(token, nextUser) {
    localStorage.setItem('stockshare_token', token);
    setUser(nextUser);
  }

  async function logout() {
    try {
      await api.post('/auth/logout', {});
    } catch (err) {
      // The local session is cleared even if the server call fails.
    }
    localStorage.removeItem('stockshare_token');
    setUser(null);
  }

  function updateUser(nextUser) {
    setUser((prev) => ({ ...prev, ...nextUser }));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
