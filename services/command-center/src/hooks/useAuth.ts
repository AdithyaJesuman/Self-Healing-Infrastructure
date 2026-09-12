import { useState } from 'react';

interface AuthUser { username: string; token: string; }

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('aiops_user');
      return stored ? JSON.parse(stored) : { username: 'admin', token: 'demo-token' };
    } catch {
      return { username: 'admin', token: 'demo-token' };
    }
  });

  const login = (username: string) => {
    const token = btoa(username + ':' + Date.now());
    const u = { username, token };
    try {
      localStorage.setItem('aiops_user', JSON.stringify(u));
    } catch {}
    setUser(u);
  };

  const logout = () => {
    try {
      localStorage.removeItem('aiops_user');
    } catch {}
    setUser(null);
  };

  return { user, login, logout };
}

