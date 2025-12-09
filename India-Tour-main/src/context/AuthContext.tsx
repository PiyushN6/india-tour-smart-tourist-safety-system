import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { Database } from '../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  favoriteDestinations: string[];
  travel_preferences: any;
  phone: string | null;
  location: string | null;
  created_at: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  addToFavorites: (cityId: string) => Promise<void>;
  removeFromFavorites: (cityId: string) => Promise<void>;
  getLoginMethodForEmail: (email: string) => Promise<'google' | 'password' | null>;
  setLoginMethodForEmail: (email: string, method: 'google' | 'password', userId?: string) => Promise<void>;
  displayName?: string;
  phoneNumber?: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!session?.user;

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      setSession(session);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = row not found; for other errors, just log
        console.error('Error fetching profile:', error);
        return;
      }

      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name,
          avatar_url: profile.avatar_url,
          favoriteDestinations: profile.favorite_destinations || [],
          travel_preferences: profile.travel_preferences || {},
          phone: profile.phone,
          location: profile.location,
          created_at: profile.created_at,
          role: profile.role || 'user',
        });
        return;
      }

      // No profile row yet; fall back to the currently authenticated user
      const { data: authUserData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Error getting auth user for fallback profile:', authError);
        return;
      }

      const authUser = authUserData.user;
      if (authUser) {
        const meta: any = authUser.user_metadata || {};
        setUser({
          id: authUser.id,
          email: authUser.email || '',
          full_name: meta.full_name || authUser.email || null,
          avatar_url: (meta.picture as string | undefined) || (meta.avatar_url as string | undefined) || null,
          favoriteDestinations: [],
          travel_preferences: {},
          phone: meta.phone || null,
          location: null,
          created_at: authUser.created_at || new Date().toISOString(),
          role: 'user',
        });
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLoginMethodForEmail = async (email: string): Promise<'google' | 'password' | null> => {
    if (!email) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('travel_preferences')
        .eq('email', email)
        .single();

      if (error) {
        if ((error as any).code === 'PGRST116') {
          // No profile row yet for this email
          return null;
        }
        console.error('Error fetching login method for email:', error);
        return null;
      }

      const prefs: any = data?.travel_preferences || {};
      const method = prefs.login_method;
      if (method === 'google' || method === 'password') {
        return method;
      }
      return null;
    } catch (err) {
      console.error('Unexpected error in getLoginMethodForEmail:', err);
      return null;
    }
  };

  const setLoginMethodForEmail = async (email: string, method: 'google' | 'password', userId?: string) => {
    if (!email) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id,email,travel_preferences,created_at')
        .eq('email', email)
        .maybeSingle();

      const existingPrefs: any = (!error && data?.travel_preferences) || {};

      const now = new Date().toISOString();
      const existingCreatedAt = (data as any)?.created_at as string | undefined;

      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(
          {
            id: userId, // when provided, ensures alignment with auth user id
            email,
            travel_preferences: {
              ...existingPrefs,
              login_method: method,
            } as any,
            updated_at: now,
            created_at: existingCreatedAt || now,
          },
          { onConflict: 'id' }
        );

      if (upsertError) {
        console.error('Error setting login method for email:', upsertError);
      }
    } catch (err) {
      console.error('Unexpected error in setLoginMethodForEmail:', err);
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) {
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/profile`,
    });

    return { error };
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    // Always clear local auth state so the UI reflects logout
    setUser(null);
    setSession(null);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'No user logged in' };

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (!error) {
      setUser(prev => prev ? { ...prev, ...updates } : null);
    }

    return { error };
  };

  const addToFavorites = async (cityId: string) => {
    if (!user) return;

    const updatedFavorites = [...user.favoriteDestinations, cityId];
    await updateProfile({ favorite_destinations: updatedFavorites });
  };

  const removeFromFavorites = async (cityId: string) => {
    if (!user) return;

    const updatedFavorites = user.favoriteDestinations.filter(id => id !== cityId);
    await updateProfile({ favorite_destinations: updatedFavorites });
  };

  // Enforce a single login method per email when a session becomes active
  useEffect(() => {
    if (!session?.user) return;

    const email = session.user.email;
    const userId = session.user.id;
    if (!email || !userId) return;

    const provider = (session.user.app_metadata as any)?.provider as string | undefined;
    const currentMethod: 'google' | 'password' = provider === 'google' ? 'google' : 'password';

    const enforce = async () => {
      const stored = await getLoginMethodForEmail(email);

      if (!stored) {
        // First time we see this email: lock in the current method and create profile row if needed
        await setLoginMethodForEmail(email, currentMethod, userId);
        return;
      }

      if (stored !== currentMethod) {
        const message =
          stored === 'google'
            ? 'This India Tour account uses Google sign-in. Please use "Continue with Google" for this email.'
            : 'This India Tour account uses email & password. Log in with your email and password, not Google.';

        window.alert(message);
        await signOut();
      }
    };

    void enforce();
  }, [session]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        signOut,
        updateProfile,
        addToFavorites,
        removeFromFavorites,
        getLoginMethodForEmail,
        setLoginMethodForEmail,
        displayName:
          user?.full_name ||
          user?.email?.split('@')[0] ||
          session?.user?.email?.split('@')[0],
        phoneNumber: user?.phone,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};