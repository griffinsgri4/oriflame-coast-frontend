'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  address?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid
          try {
            const response = await api.auth.me();
            const meUser = (response as any)?.data ?? (response as any);
            setUser((meUser as any)?.data ?? null);
          } catch (error) {
            // Token is invalid, clear auth state
            console.error('Token validation failed:', error);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.auth.login({ email, password });
      const payload = (response as any)?.data ?? (response as any);
      const { token: authToken, user: userData } = (payload as any)?.data || {};
      
      // Store in localStorage
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setToken(authToken);
      setUser(userData);
      
      // Redirect based on user role or intended page
      const intendedPath = localStorage.getItem('intended_path');
      localStorage.removeItem('intended_path');
      
      if (intendedPath) {
        // If there was an intended path, go there
        router.push(intendedPath);
      } else {
        // Role-based redirection
        if (userData?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.auth.register(userData);
      const payload = (response as any)?.data ?? (response as any);
      const { token: authToken, user: newUser } = (payload as any)?.data || {};
      
      // Store in localStorage
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Update state
      setToken(authToken);
      setUser(newUser);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    try {
      // Call logout API if needed
      if (token) {
        api.auth.logout().catch(console.error);
      }
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('cart');
      
      // Clear state
      setToken(null);
      setUser(null);
      
      // Redirect to home
      router.push('/');
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      const response = await api.auth.updateProfile(userData);
      const updatedUser = response.data;
      
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user && !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Higher-order component for protected routes
export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  redirectTo: string = '/login'
) => {
  const AuthenticatedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !isAuthenticated) {
        // Store intended path for redirect after login
        localStorage.setItem('intended_path', window.location.pathname);
        if (typeof redirectTo === 'string' && redirectTo) {
          router.push(redirectTo);
        }
      }
    }, [isAuthenticated, loading, router, redirectTo]);

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return AuthenticatedComponent;
};

// Hook for guest-only routes (redirect authenticated users)
export const useGuestOnly = (redirectTo: string = '/dashboard') => {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      // If admin, prefer admin dashboard
      if (user?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, loading, router, redirectTo, user]);

  return { loading, isAuthenticated };
};