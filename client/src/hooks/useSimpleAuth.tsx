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
  role: 'admin' | 'data_entry_user';
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
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('bbos_auth_user') : null;
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('bbos_auth_profile') : null;
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => {
    // If we already have stored credentials, don't show full-page loading spinner
    return typeof window !== 'undefined' && !localStorage.getItem('bbos_auth_token');
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('bbos_auth_token');
        if (!token) {
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }

        // Validate session/token with server
        const userData = await simpleApiClient.getCurrentUser();
        
        if (userData && userData.user) {
          setUser(userData.user);
          setProfile(userData.profile);
          localStorage.setItem('bbos_auth_user', JSON.stringify(userData.user));
          if (userData.profile) {
            localStorage.setItem('bbos_auth_profile', JSON.stringify(userData.profile));
          }
        } else {
          // Token no longer valid
          localStorage.removeItem('bbos_auth_token');
          localStorage.removeItem('bbos_auth_user');
          localStorage.removeItem('bbos_auth_profile');
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        // If server returns 401, clear stored auth
        localStorage.removeItem('bbos_auth_token');
        localStorage.removeItem('bbos_auth_user');
        localStorage.removeItem('bbos_auth_profile');
        setUser(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
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
      localStorage.removeItem('bbos_auth_token');
      localStorage.removeItem('bbos_auth_user');
      localStorage.removeItem('bbos_auth_profile');
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