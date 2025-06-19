import React, { createContext, useContext, useEffect, useState } from 'react';
import { simpleApiClient } from '@/lib/simpleApi';

interface User {
  id: string;
  email: string;
}

interface Session {
  access_token: string;
  user: User;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'data_entry_user';
  department_id: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('AuthProvider render - loading:', loading, 'user:', !!user);

  useEffect(() => {
    console.log('Initializing auth...');
    
    const initializeAuth = async () => {
      try {
        // Try to get current user session from server (session-based auth)
        const userData = await simpleApiClient.getCurrentUser();
        
        console.log('Auth state changed:', 'INITIAL_SESSION', !!userData);
        console.log('Got initial session:', !!userData);
        
        if (userData && userData.user) {
          setUser(userData.user);
          setProfile(userData.profile);
          setSession(userData.session);
        } else {
          console.log('No active session found');
        }
        
        console.log('Initial auth setup complete, setting loading to false');
        setLoading(false);
      } catch (err) {
        console.log('No stored token found');
        console.log('Initial auth setup complete, setting loading to false');
        setLoading(false);
      }
    };

    // Add timeout for auth initialization
    const timeout = setTimeout(() => {
      console.warn('Auth initialization timeout');
      setLoading(false);
    }, 5000);

    initializeAuth();

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const data = await simpleApiClient.register(email, password, fullName);
      
      // Set token and update state
      simpleApiClient.setToken(data.session.access_token);
      setSession(data.session);
      setUser(data.user);
      setProfile(data.profile);

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      
      const data = await simpleApiClient.login(email, password);
      
      // Set token and update state
      simpleApiClient.setToken(data.session.access_token);
      setSession(data.session);
      setUser(data.user);
      setProfile(data.profile);

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signin failed';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await simpleApiClient.logout();
      
      // Clear state and token
      simpleApiClient.setToken(null);
      setSession(null);
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Signout error:', err);
      setError(err instanceof Error ? err.message : 'Signout failed');
      
      // Clear state anyway
      simpleApiClient.setToken(null);
      setSession(null);
      setUser(null);
      setProfile(null);
      
      throw err;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setError(null);
      
      if (!user) {
        const error = { message: 'No user logged in' };
        setError(error.message);
        return { error };
      }

      const data = await simpleApiClient.patch(`/api/profiles/${user.id}`, updates);
      setProfile(data);
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};