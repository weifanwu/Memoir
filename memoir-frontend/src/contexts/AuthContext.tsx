'use client';
import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  authenticated: boolean;
  username: string | null;
  loading: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  authenticated: false,
  username: null,
  loading: true,
  refreshAuth: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refreshAuth() {
    try {
      const res = await fetch('http://localhost:8080/api/auth/check', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setAuthenticated(data.authenticated);
        setUsername(data.username);
      } else {
        setAuthenticated(false);
        setUsername(null);
      }
    } catch {
      setAuthenticated(false);
      setUsername(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ authenticated, username, loading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);