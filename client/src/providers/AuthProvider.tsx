import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState } from '../types';
import { authApi } from '../api/auth';

interface AuthContextValue extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('nexus-token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('nexus-token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const userProfile = await authApi.getProfile();
        setUser(userProfile);
        setToken(storedToken);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        localStorage.removeItem('nexus-token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('nexus-token', newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('nexus-token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
