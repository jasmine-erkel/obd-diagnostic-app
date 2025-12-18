import React, {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import {User, Session} from '@supabase/supabase-js';
import {authService} from '../services/authService';
import {supabase} from '../config/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{success: boolean; error?: string}>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{success: boolean; error?: string}>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session on mount
    checkSession();

    // Listen for auth state changes
    const {
      data: {subscription},
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkSession = async () => {
    try {
      const currentSession = await authService.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    } catch (error) {
      console.error('Error checking session:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.login(email, password);

      if (result.success && result.user && result.session) {
        setUser(result.user);
        setSession(result.session);
        return {success: true};
      }

      return {success: false, error: result.error || 'Login failed'};
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  };

  const register = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const result = await authService.register(email, password, firstName, lastName);

      if (result.success && result.user && result.session) {
        setUser(result.user);
        setSession(result.session);
        return {success: true};
      }

      return {success: false, error: result.error || 'Registration failed'};
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshSession = async () => {
    try {
      const result = await authService.refreshSession();
      if (result.success && result.session) {
        setSession(result.session);
        setUser(result.user ?? null);
      }
    } catch (error) {
      console.error('Session refresh error:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated: !!user && !!session,
    login,
    register,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
