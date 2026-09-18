import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  isCheckingSession: boolean;
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
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    fetch('/api/auth/session')
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<{ success?: boolean; user?: string | null }>;
      })
      .then((data) => {
        if (!active) return;
        const authenticated = data?.success === true && typeof data.user === 'string';
        setIsAuthenticated(authenticated);
        setUser(authenticated ? data.user! : null);
        if (!authenticated) {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          localStorage.removeItem(`${AUTH_STORAGE_KEY}_user`);
        }
      })
      .catch(() => {
        if (active) {
          setIsAuthenticated(false);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setIsCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, []);

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

    void fetch('/api/auth/logout', { method: 'POST' }).catch((error) => {
      console.warn('Não foi possível encerrar a sessão no servidor:', error);
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isCheckingSession, user, login, logout }}>
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
