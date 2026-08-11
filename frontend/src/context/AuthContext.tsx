import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { authService } from '../services/auth.service';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('erp_jwt_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial load: verify token via /api/auth/me
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('erp_jwt_token');
      if (storedToken) {
        try {
          const response = await authService.getMe();
          if (response.success && response.data?.user) {
            setUser(response.data.user);
            setToken(storedToken);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Failed to authenticate token:', error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.success && response.data) {
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('erp_jwt_token', newToken);
        setToken(newToken);
        setUser(userData);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('erp_jwt_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
