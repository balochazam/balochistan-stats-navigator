import React, { createContext, useContext, useEffect, useState } from 'react';
import { simpleApiClient } from '@/lib/simpleApi';

interface User {
  id: string;
  email: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'department_user' | 'data_entry_user';
  department_id: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
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
      
      // Update state with session data
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
      
      // Update state with session data
      setUser(data.user);
      setProfile(data.profile);

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await simpleApiClient.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear client state regardless of API call success
      setUser(null);
      setProfile(null);
      setError(null);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setError(null);
      
      const updatedProfile = await simpleApiClient.patch('/api/profiles', updates);
      setProfile(updatedProfile);

      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Update failed';
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};