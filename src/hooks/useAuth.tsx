
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
  if (!context) {
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

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error.message);
        if (error.code === 'PGRST116') {
          console.log('Profile not found, creating default profile');
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              email: user?.email || '',
              full_name: user?.user_metadata?.full_name || '',
              role: 'data_entry_user'
            })
            .select()
            .single();
          
          if (createError) {
            console.error('Error creating profile:', createError);
            return null;
          }
          
          console.log('Profile created successfully:', newProfile);
          return newProfile;
        }
        return null;
      }

      console.log('Profile fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;
    let profileFetchAborted = false;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        setError(null);
        
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            if (!mounted) return;
            
            console.log('Auth state changed:', event, !!session?.user);
            
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
              // Use setTimeout to prevent blocking the auth state change
              setTimeout(async () => {
                if (!mounted || profileFetchAborted) return;
                
                try {
                  const profileData = await fetchProfile(session.user.id);
                  if (mounted && !profileFetchAborted) {
                    setProfile(profileData);
                  }
                } catch (error) {
                  console.error('Error fetching profile in auth state change:', error);
                  if (mounted) {
                    setError('Failed to load user profile');
                  }
                }
              }, 0);
            } else if (!session?.user) {
              if (mounted) {
                setProfile(null);
              }
            }
          }
        );

        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          if (mounted) {
            setError('Failed to initialize authentication');
            setLoading(false);
          }
          return;
        }

        console.log('Got initial session:', !!initialSession);
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);

          if (initialSession?.user) {
            try {
              const profileData = await fetchProfile(initialSession.user.id);
              if (mounted && !profileFetchAborted) {
                setProfile(profileData);
              }
            } catch (error) {
              console.error('Error fetching initial profile:', error);
              if (mounted) {
                setError('Failed to load user profile');
              }
            }
          }
          
          console.log('Initial auth setup complete, setting loading to false');
          setLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted) {
          setError('Authentication initialization failed');
          setLoading(false);
        }
      }
    };

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Auth initialization timeout');
        setError('Authentication timeout - please refresh the page');
        setLoading(false);
      }
    }, 10000); // 10 second timeout

    initializeAuth();

    return () => {
      mounted = false;
      profileFetchAborted = true;
      clearTimeout(timeoutId);
    };
  }, []); // Empty dependency array is correct here

  const signUp = async (email: string, password: string, fullName: string) => {
    setError(null);
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    
    if (error) {
      setError(error.message);
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      setError(error.message);
    }
    
    return { error };
  };

  const signOut = async () => {
    setError(null);
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };

    setError(null);
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (!error && profile) {
      setProfile({ ...profile, ...updates });
    } else if (error) {
      setError(error.message);
    }

    return { error };
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      error,
      signUp,
      signIn,
      signOut,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
