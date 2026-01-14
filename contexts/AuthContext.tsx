
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContextType, User } from '../types.ts';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('aura_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (pass.length < 6) {
          const err = "Password must be at least 6 characters";
          setError(err);
          setIsLoading(false);
          reject(err);
          return;
        }
        const fakeUser: User = { id: '1', email };
        setUser(fakeUser);
        localStorage.setItem('aura_user', JSON.stringify(fakeUser));
        setIsLoading(false);
        resolve();
      }, 1000);
    });
  };

  const register = async (email: string, pass: string) => {
    setIsLoading(true);
    setError(null);
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        if (!email.includes('@')) {
          const err = "Invalid email address";
          setError(err);
          setIsLoading(false);
          reject(err);
          return;
        }
        if (pass.length < 6) {
          const err = "Password must be at least 6 characters";
          setError(err);
          setIsLoading(false);
          reject(err);
          return;
        }
        const fakeUser: User = { id: '1', email };
        setUser(fakeUser);
        localStorage.setItem('aura_user', JSON.stringify(fakeUser));
        setIsLoading(false);
        resolve();
      }, 1200);
    });
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        const fakeUser: User = { id: 'google_user_123', email: 'user@gmail.com', name: 'Google User' };
        setUser(fakeUser);
        localStorage.setItem('aura_user', JSON.stringify(fakeUser));
        setIsLoading(false);
        resolve();
      }, 1500);
    });
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    setError(null);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsLoading(false);
        resolve();
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aura_user');
    localStorage.removeItem('aura_onboarding_complete');
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, loginWithGoogle, logout, resetPassword, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
