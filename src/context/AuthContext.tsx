import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: string | null;
  login: (username: string, pass: string) => boolean;
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

  const login = (username: string, pass: string): boolean => {
    const expectedUser = (import.meta as any).env?.VITE_ADMIN_USER || 'admin';
    const expectedPass = (import.meta as any).env?.VITE_ADMIN_PASS || 'admin';

    // Aceita admin/admin configurado no .env
    if (username.trim() === expectedUser && pass === expectedPass) {
      setIsAuthenticated(true);
      setUser(username.trim());
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      localStorage.setItem(`${AUTH_STORAGE_KEY}_user`, username.trim());
      return true;
    }
    return false;
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
