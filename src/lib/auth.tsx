import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  checkEmailExists: (email: string) => Promise<boolean>;
  autoLoginWithEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function mapSupabaseUser(user: SupabaseUser): Promise<AuthUser> {
  // Check if user is admin
  const { data: adminData } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', user.email!)
    .single();

  return {
    id: user.id,
    email: user.email!,
    username: user.user_metadata?.username || user.user_metadata?.full_name || user.email!.split('@')[0],
    avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
    isAdmin: !!adminData,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (mounted && session?.user) {
        const authUser = await mapSupabaseUser(session.user);
        setUser(authUser);
      }
      if (mounted) setLoading(false);
    });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          const authUser = await mapSupabaseUser(session.user);
          setUser(authUser);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          const authUser = await mapSupabaseUser(session.user);
          setUser(authUser);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = (authUser: AuthUser) => {
    setUser(authUser);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    const { data } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('email', email)
      .single();

    return !!data;
  };

  const autoLoginWithEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if user exists
      const userExists = await checkEmailExists(email);

      if (!userExists) {
        return { success: false, error: 'User not found' };
      }

      // Send magic link / OTP
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkEmailExists, autoLoginWithEmail }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
