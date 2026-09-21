import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole, StreamType } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Language } from '../i18n/types';

// Seeded initial users for instant local testing and role management
const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-admin-1',
    full_name: 'Yahia Hemaidia',
    email: 'admin@bacnext.dz',
    role: 'admin',
    stream: 'sciences_experimentales',
    language: 'fr',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
    created_at: '2026-09-01T10:00:00Z',
    password: 'password123',
  },
  {
    id: 'usr-student-1',
    full_name: 'Yaya Etudiant',
    email: 'etudiant@bacnext.dz',
    role: 'student',
    stream: 'sciences_experimentales',
    language: 'fr',
    avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80',
    created_at: '2026-09-10T14:30:00Z',
    password: 'password123',
  },
];

interface AuthContextType {
  currentUser: UserAccount | null;
  role: UserRole;
  isAdmin: boolean;
  isStudent: boolean;
  users: UserAccount[];
  showStreamOnboarding: boolean;
  setShowStreamOnboarding: (show: boolean) => void;
  completeStreamOnboarding: (stream: StreamType) => Promise<void>;
  login: (email: string, password?: string) => Promise<{ success: boolean; user?: UserAccount; error?: string }>;
  signup: (data: {
    fullName: string;
    email: string;
    password?: string;
    stream: StreamType;
    language?: Language;
  }) => Promise<{ success: boolean; user?: UserAccount; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  promoteUserToAdmin: (targetUserId: string) => Promise<{ success: boolean; error?: string }>;
  demoteAdminToStudent: (targetUserId: string) => Promise<{ success: boolean; error?: string }>;
  updateCurrentUserProfile: (data: {
    fullName?: string;
    stream?: StreamType;
    language?: Language;
    avatarUrl?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  switchAccountForTesting: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load users list from local storage or use initial seed
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('bacnext_users');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  // Load current session
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    // Check if user was explicitly logged out
    const wasLoggedOut = localStorage.getItem('bacnext_logged_out') === 'true';
    if (wasLoggedOut) {
      return null;
    }
    const saved = localStorage.getItem('bacnext_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id) return parsed;
      } catch {
        return null;
      }
    }
    // Default to the first seed student on fresh start if never logged out
    return INITIAL_USERS[0];
  });

  // State to trigger the stream onboarding modal for new Google users
  const [showStreamOnboarding, setShowStreamOnboarding] = useState<boolean>(() => {
    const pending = localStorage.getItem('bacnext_pending_stream_onboarding');
    return pending === 'true';
  });

  useEffect(() => {
    if (showStreamOnboarding) {
      localStorage.setItem('bacnext_pending_stream_onboarding', 'true');
    } else {
      localStorage.removeItem('bacnext_pending_stream_onboarding');
    }
  }, [showStreamOnboarding]);

  // Save users list to localStorage whenever updated
  useEffect(() => {
    localStorage.setItem('bacnext_users', JSON.stringify(users));
  }, [users]);

  // Save current user to localStorage whenever updated
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bacnext_current_user', JSON.stringify(currentUser));
      localStorage.setItem('bacnext_role', currentUser.role);
    } else {
      localStorage.removeItem('bacnext_current_user');
      localStorage.setItem('bacnext_role', 'student');
    }
  }, [currentUser]);

  // Synchronize authenticated Supabase user profile with DB profiles table
  const syncSupabaseUserProfile = async (authUser: any): Promise<UserAccount | null> => {
    if (!supabase) return null;

    try {
      // 1. Detect the authenticated Supabase user (authUser)
      // 2. Check whether a profile already exists
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      let userProfile = profile;

      // Also check by email to prevent creating duplicate profiles if user previously registered with email
      if (!userProfile && authUser.email) {
        const { data: profileByEmail } = await supabase
          .from('profiles')
          .select('*')
          .ilike('email', authUser.email)
          .maybeSingle();
        if (profileByEmail) {
          userProfile = profileByEmail;
        }
      }

      const googleName =
        authUser.user_metadata?.full_name ||
        authUser.user_metadata?.name ||
        authUser.email?.split('@')[0] ||
        'Élève BacNext';

      const googleAvatar =
        authUser.user_metadata?.avatar_url ||
        authUser.user_metadata?.picture ||
        null;

      // 3. If the profile does not exist:
      //    - create the profile
      //    - use the Google user's name
      //    - use the Google user's email
      //    - use the Google avatar if available
      //    - set role = "student"
      // 4. Never allow Google users to choose "admin"
      if (!userProfile) {
        const newProfileData = {
          id: authUser.id,
          full_name: googleName,
          email: authUser.email || '',
          role: 'student', // ALWAYS student! Never allow admin for Google users!
          stream: null, // No stream chosen yet -> triggers stream onboarding
          language: 'fr',
          avatar_url: googleAvatar,
          created_at: new Date().toISOString(),
        };

        const { data: inserted, error: insertErr } = await supabase
          .from('profiles')
          .insert([newProfileData])
          .select()
          .maybeSingle();

        if (insertErr) {
          // In case DB trigger handle_new_user() created it concurrently:
          const { data: refetched } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle();
          userProfile = refetched || newProfileData;
        } else {
          userProfile = inserted || newProfileData;
        }
      }

      // 5. If profile already exists, do not create a duplicate.
      // 6. Load the existing role, stream, language and progress.
      const resolvedRole: UserRole = userProfile.role === 'admin' ? 'admin' : 'student';
      const loadedAccount: UserAccount = {
        id: authUser.id,
        full_name: userProfile.full_name || googleName,
        email: authUser.email || userProfile.email,
        role: resolvedRole,
        stream: (userProfile.stream as StreamType) || (null as any),
        language: (userProfile.language as Language) || 'fr',
        avatar_url: userProfile.avatar_url || googleAvatar,
        created_at: userProfile.created_at || new Date().toISOString(),
      };

      setCurrentUser(loadedAccount);
      setUsers((prev) => {
        const idx = prev.findIndex(
          (u) =>
            u.id === loadedAccount.id ||
            (u.email && loadedAccount.email && u.email.toLowerCase() === loadedAccount.email.toLowerCase())
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = loadedAccount;
          return next;
        }
        return [...prev, loadedAccount];
      });

      // 9. If a new student has no BAC stream, show the stream selection onboarding:
      //    - Sciences Expérimentales
      //    - Mathématiques
      if (resolvedRole === 'student' && (!userProfile.stream || userProfile.stream === '')) {
        setShowStreamOnboarding(true);
      } else {
        setShowStreamOnboarding(false);
      }

      return loadedAccount;
    } catch (err) {
      console.error('Error synchronizing Supabase profile:', err);
      return null;
    }
  };

  // Handle Supabase OAuth session and Auth State Listener
  useEffect(() => {
    const client = supabase;
    if (!isSupabaseConfigured || !client) return;

    // 1. Initial fetch of existing profiles
    client
      .from('profiles')
      .select('*')
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mappedUsers: UserAccount[] = data.map((p) => ({
            id: p.id,
            full_name: p.full_name,
            email: p.email,
            role: (p.role === 'admin' ? 'admin' : 'student') as UserRole,
            stream: (p.stream as StreamType) || 'sciences_experimentales',
            language: (p.language as Language) || 'fr',
            avatar_url: p.avatar_url,
            created_at: p.created_at,
          }));
          setUsers((prev) => {
            const merged = [...prev];
            mappedUsers.forEach((mu) => {
              const idx = merged.findIndex((u) => u.id === mu.id || u.email.toLowerCase() === mu.email.toLowerCase());
              if (idx >= 0) merged[idx] = mu;
              else merged.push(mu);
            });
            return merged;
          });
        }
      });

    // 2. Check active session immediately on mount (handles Google OAuth callback redirects)
    client.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncSupabaseUserProfile(session.user);
      }
    });

    // 3. Real-time auth state listener (OAuth callbacks, login, logout, token refresh)
    const { data: { subscription } } = client.auth.onAuthStateChange(async (event, session) => {
      if (
        session?.user &&
        (event === 'SIGNED_IN' ||
          event === 'INITIAL_SESSION' ||
          event === 'USER_UPDATED' ||
          event === 'TOKEN_REFRESHED')
      ) {
        await syncSupabaseUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
        setShowStreamOnboarding(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const role: UserRole = currentUser ? currentUser.role : 'student';
  const isAdmin = role === 'admin';
  const isStudent = role === 'student';

  // LOGIN
  const login = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; user?: UserAccount; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();

    // Check in local database
    const matchedUser = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (matchedUser) {
      localStorage.removeItem('bacnext_logged_out');
      localStorage.setItem('bacnext_current_user', JSON.stringify(matchedUser));
      setCurrentUser(matchedUser);
      return { success: true, user: matchedUser };
    }

    // If Supabase is active, check auth
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password || 'password123',
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const loadedUser: UserAccount = {
            id: data.user.id,
            full_name: profile?.full_name || data.user.email?.split('@')[0] || 'Utilisateur',
            email: data.user.email || cleanEmail,
            role: (profile?.role === 'admin' ? 'admin' : 'student') as UserRole,
            stream: (profile?.stream as StreamType) || 'sciences_experimentales',
            language: (profile?.language as Language) || 'fr',
            created_at: profile?.created_at || new Date().toISOString(),
          };
          localStorage.removeItem('bacnext_logged_out');
          localStorage.setItem('bacnext_current_user', JSON.stringify(loadedUser));
          setCurrentUser(loadedUser);
          return { success: true, user: loadedUser };
        }
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    return { success: false, error: 'Compte introuvable. Veuillez vérifier vos identifiants.' };
  };

  // SIGNUP
  // MANDATORY SECURITY RULE: Public signup ONLY creates accounts with role = 'student'.
  // No public user can ever self-assign the admin role.
  const signup = async ({
    fullName,
    email,
    password,
    stream,
    language = 'fr',
  }: {
    fullName: string;
    email: string;
    password?: string;
    stream: StreamType;
    language?: Language;
  }): Promise<{ success: boolean; user?: UserAccount; error?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanEmail || !cleanName) {
      return { success: false, error: 'Veuillez renseigner tous les champs obligatoires.' };
    }

    const existingUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existingUser) {
      return { success: false, error: 'Un compte avec cette adresse email existe déjà.' };
    }

    // Default role is strictly 'student'
    const newStudentUser: UserAccount = {
      id: `usr-${Date.now()}`,
      full_name: cleanName,
      email: cleanEmail,
      role: 'student', // ALWAYS student!
      stream,
      language,
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`,
      created_at: new Date().toISOString(),
      password: password || 'password123',
    };

    localStorage.removeItem('bacnext_logged_out');
    localStorage.setItem('bacnext_current_user', JSON.stringify(newStudentUser));
    setUsers((prev) => [...prev, newStudentUser]);
    setCurrentUser(newStudentUser);

    // If Supabase is active, create in auth and public.profiles
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signUp({
          email: cleanEmail,
          password: password || 'password123',
        });
      } catch (err) {
        console.warn('Supabase signup sync failed, kept in local state', err);
      }
    }

    return { success: true, user: newStudentUser };
  };

  // LOGOUT - Complete Session Destruction
  const logout = async (): Promise<void> => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Supabase signOut error:', err);
    } finally {
      // Clear React auth state
      setCurrentUser(null);
      setShowStreamOnboarding(false);

      // Wipe local storage keys
      try {
        localStorage.removeItem('bacnext_current_user');
        localStorage.setItem('bacnext_logged_out', 'true');
        localStorage.removeItem('bacnext_pending_stream_onboarding');
        localStorage.removeItem('bacnext_role');
        // Clean any cached tokens
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('sb-') || key.includes('supabase.auth.token')) {
            localStorage.removeItem(key);
          }
        });
      } catch {}
    }
  };

  // PROMOTE USER TO ADMIN
  // Guarded: Only existing admins can call this!
  const promoteUserToAdmin = async (targetUserId: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Accès refusé. Seul un administrateur peut promouvoir des utilisateurs.' };
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === targetUserId ? { ...u, role: 'admin' } : u))
    );

    if (currentUser && currentUser.id === targetUserId) {
      setCurrentUser((prev) => (prev ? { ...prev, role: 'admin' } : null));
    }

    // If Supabase is active, execute RPC or update profile
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.rpc('promote_user_to_admin', { target_user_id: targetUserId });
      } catch (err: any) {
        // Fallback update
        await supabase.from('profiles').update({ role: 'admin' }).eq('id', targetUserId);
      }
    }

    return { success: true };
  };

  // DEMOTE ADMIN TO STUDENT
  // Guarded: Only admins can call this, and an admin CANNOT demote themselves!
  const demoteAdminToStudent = async (targetUserId: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Accès refusé. Seul un administrateur peut modifier les rôles.' };
    }

    if (currentUser && currentUser.id === targetUserId) {
      return {
        success: false,
        error: 'Action interdite : vous ne pouvez pas rétrograder votre propre compte administrateur.',
      };
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === targetUserId ? { ...u, role: 'student' } : u))
    );

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.rpc('demote_admin_to_student', { target_user_id: targetUserId });
      } catch (err: any) {
        await supabase.from('profiles').update({ role: 'student' }).eq('id', targetUserId);
      }
    }

    return { success: true };
  };

  // Update current user's personal profile (student cannot change their own role)
  const updateCurrentUserProfile = async (data: {
    fullName?: string;
    stream?: StreamType;
    language?: Language;
    avatarUrl?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Utilisateur non authentifié' };
    }

    const updatedUser: UserAccount = {
      ...currentUser,
      ...(data.fullName !== undefined ? { full_name: data.fullName.trim() } : {}),
      ...(data.stream !== undefined ? { stream: data.stream } : {}),
      ...(data.language !== undefined ? { language: data.language } : {}),
      ...(data.avatarUrl !== undefined ? { avatar_url: data.avatarUrl.trim() } : {}),
      // role and id are strictly immutable for students!
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const payload: Record<string, any> = {};
        if (data.fullName !== undefined) payload.full_name = data.fullName.trim();
        if (data.stream !== undefined) payload.stream = data.stream;
        if (data.language !== undefined) payload.language = data.language;
        if (data.avatarUrl !== undefined) payload.avatar_url = data.avatarUrl.trim();

        const { error } = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', currentUser.id);

        if (error) {
          console.error('Supabase profile update error:', error);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        console.error('Supabase profile update failed:', err);
        return { success: false, error: err.message || 'Erreur de mise à jour' };
      }
    }

    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    try {
      localStorage.setItem('bacnext_current_user', JSON.stringify(updatedUser));
    } catch {}

    return { success: true };
  };

  // GOOGLE AUTHENTICATION
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        success: false,
        error:
          'Supabase n\'est pas encore configuré. Renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans vos variables d\'environnement pour activer l\'authentification Google.',
      };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        return {
          success: false,
          error: `Erreur Supabase OAuth : ${error.message}`,
        };
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Erreur inattendue lors de la connexion Google.',
      };
    }
  };

  // COMPLETE STREAM ONBOARDING
  const completeStreamOnboarding = async (stream: StreamType) => {
    if (!currentUser) return;

    const updated: UserAccount = {
      ...currentUser,
      stream,
    };

    setCurrentUser(updated);
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updated : u)));
    setShowStreamOnboarding(false);

    // 10. Save the selected stream to the existing profile in Supabase
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ stream })
          .eq('id', currentUser.id);

        if (error) {
          console.error('Error saving stream to Supabase profile:', error);
        }
      } catch (err) {
        console.error('Failed to update stream in Supabase:', err);
      }
    }
  };

  // Quick switch between accounts (helpful for testing admin vs student in the preview)
  const switchAccountForTesting = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        isAdmin,
        isStudent,
        users,
        showStreamOnboarding,
        setShowStreamOnboarding,
        completeStreamOnboarding,
        login,
        signup,
        loginWithGoogle,
        logout,
        promoteUserToAdmin,
        demoteAdminToStudent,
        updateCurrentUserProfile,
        switchAccountForTesting,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
