import React, { createContext, useContext, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const AUTH_STORAGE_KEY = 'desafio_saber_auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });

  const [user, setUser] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(`${AUTH_STORAGE_KEY}_user`);
  });

  const login = async (username: string, pass: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password: pass }),
      });

      if (!response.ok) return false;

      const data = await response.json();
      if (data.success !== true || typeof data.user !== 'string') return false;

      setIsAuthenticated(true);
      setUser(data.user);
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      localStorage.setItem(`${AUTH_STORAGE_KEY}_user`, data.user);
      return true;
    } catch (error) {
      console.error('Não foi possível validar o login:', error);
      return false;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(`${AUTH_STORAGE_KEY}_user`);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return ctx;
}
