import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'staff' | 'admin';

interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  shelterId: string | null;
  isLoading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    shelterId: null,
    isLoading: true,
  });

  const fetchUserRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }
      return data?.role as AppRole | null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  }, []);

  const fetchUserShelterId = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('shelter_id')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching shelter id:', error);
        return null;
      }
      return data?.shelter_id || null;
    } catch (error) {
      console.error('Error fetching shelter id:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        // Defer fetching additional data
        if (session?.user) {
          setTimeout(async () => {
            const [role, shelterId] = await Promise.all([
              fetchUserRole(session.user.id),
              fetchUserShelterId(session.user.id),
            ]);
            setAuthState(prev => ({
              ...prev,
              role,
              shelterId,
              isLoading: false,
            }));
          }, 0);
        } else {
          setAuthState(prev => ({
            ...prev,
            role: null,
            shelterId: null,
            isLoading: false,
          }));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const [role, shelterId] = await Promise.all([
          fetchUserRole(session.user.id),
          fetchUserShelterId(session.user.id),
        ]);
        setAuthState({
          session,
          user: session.user,
          role,
          shelterId,
          isLoading: false,
        });
      } else {
        setAuthState({
          session: null,
          user: null,
          role: null,
          shelterId: null,
          isLoading: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserRole, fetchUserShelterId]);

  const isAdmin = authState.role === 'admin';
  const isStaff = authState.role === 'staff';

  return {
    ...authState,
    isAdmin,
    isStaff,
  };
}
