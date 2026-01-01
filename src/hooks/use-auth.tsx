import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { auth } from '@/integrations/firebase/config';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updatePassword as firebaseUpdatePassword,
  updateProfile,
  sendEmailVerification,
  AuthError,
} from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>;
  sendVerificationEmail: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Sign in successful');
      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: error as AuthError };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Update the user's display name
      await updateProfile(user, { displayName: fullName });

      // Send email verification
      await sendEmailVerification(user);

      console.log('Sign up successful, verification email sent');
      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    localStorage.removeItem('nightnest_user');
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/reset-password`,
      });
      console.log('Password reset email sent successfully to:', email);
      return { error: null };
    } catch (error) {
      console.error('Reset password error:', error);
      return { error: error as AuthError };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user logged in');
      }
      await firebaseUpdatePassword(auth.currentUser, newPassword);
      console.log('Password updated successfully');
      return { error: null };
    } catch (error) {
      console.error('Update password error:', error);
      return { error: error as AuthError };
    }
  };

  const sendVerificationEmail = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user logged in');
      }
      await sendEmailVerification(auth.currentUser);
      console.log('Verification email sent');
      return { error: null };
    } catch (error) {
      console.error('Send verification email error:', error);
      return { error: error as AuthError };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      sendVerificationEmail,
    }}>
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
