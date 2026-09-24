'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole, KeyConfig } from '@/types/frc';
import {
  DEFAULT_ADMIN_KEY,
  DEFAULT_MEMBER_KEY,
  getClientAdminKey,
  getClientMemberKey,
} from '@/lib/accessKeys';

export type MemberProfile = {
  id: string;
  name: string;
  displayName: string;
  createdAt?: string;
  lastLoginAt?: string | null;
};

interface AuthKeyContextType {
  role: UserRole;
  activeKey: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMember: boolean;
  /** Logged-in member profile (name from registration); null for admin or token-only */
  memberProfile: MemberProfile | null;
  keys: KeyConfig;
  sqlConnectionKey: string;
  isAuthModalOpen: boolean;
  isKeyManagementOpen: boolean;
  authReady: boolean;
  /** Keys come from env; true when FRC_* / NEXT_PUBLIC_FRC_* are set */
  keysFromEnv: boolean;
  envSource: { admin: string; member: string };
  loginWithKey: (key: string) => Promise<{ success: boolean; role?: UserRole; message: string }>;
  /** First-time member: name + password + shared member token */
  registerMember: (input: {
    name: string;
    password: string;
    memberToken: string;
  }) => Promise<{ success: boolean; role?: UserRole; message: string }>;
  /** Returning member: name + password only (token not required) */
  loginMember: (input: {
    name: string;
    password: string;
  }) => Promise<{ success: boolean; role?: UserRole; message: string }>;
  logout: () => void;
  updateKeys: (newAdmin: string, newMember: string) => { success: boolean; message: string };
  setSqlConnectionKey: (key: string) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openKeyManagement: () => void;
  closeKeyManagement: () => void;
  hasPermission: (
    action:
      | 'manage_keys'
      | 'manage_sql'
      | 'edit_matches'
      | 'edit_picklists'
      | 'submit_scouting'
      | 'view_analytics'
      | 'clear_data'
      | 'view_admin_console'
      | 'view_member_portal'
  ) => boolean;
}

const AuthKeyContext = createContext<AuthKeyContextType | undefined>(undefined);

function persistSession(role: UserRole, accessToken: string, profile: MemberProfile | null) {
  try {
    localStorage.setItem('frc_auth_role', role);
    localStorage.setItem('frc_auth_key', accessToken);
    if (profile) {
      localStorage.setItem('frc_member_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('frc_member_profile');
    }
  } catch {
    /* ignore */
  }
}

function clearSession() {
  try {
    localStorage.removeItem('frc_auth_role');
    localStorage.removeItem('frc_auth_key');
    localStorage.removeItem('frc_member_profile');
  } catch {
    /* ignore */
  }
}

export function AuthKeyProvider({ children }: { children: React.ReactNode }) {
  const [authReady, setAuthReady] = useState(false);
  const [keysFromEnv, setKeysFromEnv] = useState(false);
  const [envSource, setEnvSource] = useState<{ admin: string; member: string }>({
    admin: 'default',
    member: 'default',
  });

  // Start with NEXT_PUBLIC_ bake-time values; server /api/auth may refine
  const [keys, setKeys] = useState<KeyConfig>(() => ({
    adminKey: getClientAdminKey(),
    memberKey: getClientMemberKey(),
    lastUpdated: new Date().toISOString(),
  }));

  const [role, setRole] = useState<UserRole>('none');
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [memberProfile, setMemberProfile] = useState<MemberProfile | null>(null);
  const [sqlConnectionKey, setSqlConnectionKeyInternal] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isKeyManagementOpen, setIsKeyManagementOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let adminK = getClientAdminKey();
      let memberK = getClientMemberKey();
      let fromEnv = false;
      let source = { admin: 'default', member: 'default' };

      try {
        const res = await fetch('/api/auth', { cache: 'no-store' });
        if (res.ok) {
          const cfg = await res.json();
          if (!cancelled) {
            fromEnv = Boolean(cfg.adminFromEnv || cfg.memberFromEnv);
            source = cfg.source || source;
            if (cfg.publicAdminKey) adminK = cfg.publicAdminKey;
            else if (cfg.adminFromEnv) adminK = '';
            if (cfg.publicMemberKey) memberK = cfg.publicMemberKey;
            else if (cfg.memberFromEnv) memberK = '';
            setKeysFromEnv(fromEnv);
            setEnvSource(source);
          }
        }
      } catch {
        /* offline — use bake-time NEXT_PUBLIC_ / defaults */
      }

      if (cancelled) return;

      try {
        if (!fromEnv) {
          const savedAdmin = localStorage.getItem('frc_admin_key');
          const savedMember = localStorage.getItem('frc_member_key');
          if (savedAdmin) adminK = savedAdmin;
          if (savedMember) memberK = savedMember;
        }
        const savedSql = localStorage.getItem('frc_sql_connection_key');
        if (savedSql) setSqlConnectionKeyInternal(savedSql);
      } catch {
        /* ignore */
      }

      setKeys({
        adminKey: adminK,
        memberKey: memberK,
        lastUpdated: new Date().toISOString(),
      });

      try {
        const savedRole = localStorage.getItem('frc_auth_role') as UserRole | null;
        const savedActiveKey = localStorage.getItem('frc_auth_key');
        let savedProfile: MemberProfile | null = null;
        try {
          const raw = localStorage.getItem('frc_member_profile');
          if (raw) savedProfile = JSON.parse(raw);
        } catch {
          savedProfile = null;
        }

        if (savedRole && savedActiveKey) {
          // Admin: re-validate token. Member: accept session if we have a profile
          // (name/password login) OR the key still matches the shared member token.
          if (savedRole === 'admin') {
            const stillValid = savedActiveKey === adminK || (!adminK && true);
            try {
              const v = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: savedActiveKey }),
              });
              const body = await v.json();
              if (body.success && body.role === 'admin') {
                if (!cancelled) {
                  setRole('admin');
                  setActiveKey(savedActiveKey);
                  setMemberProfile(null);
                  setIsAuthModalOpen(false);
                  setAuthReady(true);
                }
                return;
              }
            } catch {
              if (stillValid && adminK && savedActiveKey === adminK) {
                if (!cancelled) {
                  setRole('admin');
                  setActiveKey(savedActiveKey);
                  setMemberProfile(null);
                  setIsAuthModalOpen(false);
                  setAuthReady(true);
                }
                return;
              }
            }
          } else if (savedRole === 'member') {
            // Prefer restoring named member sessions without re-entering password
            if (savedProfile?.name) {
              if (!cancelled) {
                setRole('member');
                setActiveKey(savedActiveKey);
                setMemberProfile(savedProfile);
                setIsAuthModalOpen(false);
                setAuthReady(true);
              }
              return;
            }
            // Legacy: plain member token session
            try {
              const v = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: savedActiveKey }),
              });
              const body = await v.json();
              if (body.success && body.role === 'member') {
                if (!cancelled) {
                  setRole('member');
                  setActiveKey(savedActiveKey);
                  setMemberProfile(null);
                  setIsAuthModalOpen(false);
                  setAuthReady(true);
                }
                return;
              }
            } catch {
              if (memberK && savedActiveKey === memberK) {
                if (!cancelled) {
                  setRole('member');
                  setActiveKey(savedActiveKey);
                  setMemberProfile(null);
                  setIsAuthModalOpen(false);
                  setAuthReady(true);
                }
                return;
              }
            }
          }
        }
      } catch {
        /* ignore */
      }

      if (cancelled) return;

      // Stay logged out without forcing the login modal — landing page handles entry
      setRole('none');
      setActiveKey(null);
      setMemberProfile(null);
      setIsAuthModalOpen(false);
      setAuthReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const applyAuthSuccess = useCallback(
    (nextRole: UserRole, accessToken: string, profile: MemberProfile | null, message: string) => {
      setRole(nextRole);
      setActiveKey(accessToken);
      setMemberProfile(profile);
      persistSession(nextRole, accessToken, profile);
      setIsAuthModalOpen(false);
      return { success: true as const, role: nextRole, message };
    },
    []
  );

  const loginWithKey = useCallback(
    async (inputKey: string): Promise<{ success: boolean; role?: UserRole; message: string }> => {
      const trimmed = inputKey.trim();
      if (!trimmed) {
        return { success: false, message: 'Please enter a valid access key.' };
      }

      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: trimmed }),
        });
        const body = await res.json();
        if (body.success && (body.role === 'admin' || body.role === 'member')) {
          const token = body.accessToken || trimmed;
          return applyAuthSuccess(
            body.role as UserRole,
            token,
            null,
            body.message ||
              (body.role === 'admin' ? 'Administrator Access Granted.' : 'Member Access Granted.')
          );
        }
        if (!body.success && res.status !== 0) {
          return {
            success: false,
            message: body.message || 'Invalid Access Key. Check env FRC_ADMIN_KEY / FRC_MEMBER_KEY.',
          };
        }
      } catch {
        /* fall through to local match */
      }

      if (keys.adminKey && trimmed === keys.adminKey) {
        return applyAuthSuccess(
          'admin',
          trimmed,
          null,
          'Administrator Access Granted. Full control console unlocked.'
        );
      }
      if (keys.memberKey && trimmed === keys.memberKey) {
        return applyAuthSuccess(
          'member',
          trimmed,
          null,
          'Member Access Granted. Register a personal name/password for easier next logins.'
        );
      }

      return {
        success: false,
        message: 'Invalid Access Key. Set FRC_ADMIN_KEY / FRC_MEMBER_KEY in .env and restart.',
      };
    },
    [keys.adminKey, keys.memberKey, applyAuthSuccess]
  );

  const registerMember = useCallback(
    async (input: {
      name: string;
      password: string;
      memberToken: string;
    }): Promise<{ success: boolean; role?: UserRole; message: string }> => {
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'register_member',
            name: input.name,
            password: input.password,
            memberToken: input.memberToken,
          }),
        });
        const body = await res.json();
        if (!body.success) {
          return { success: false, message: body.message || 'Registration failed.' };
        }
        const profile: MemberProfile = {
          id: body.account?.id || `mem-local`,
          name: body.account?.name || input.name.trim(),
          displayName: body.account?.displayName || body.account?.name || input.name.trim(),
          createdAt: body.account?.createdAt,
          lastLoginAt: body.account?.lastLoginAt ?? null,
        };
        return applyAuthSuccess(
          'member',
          body.accessToken || input.memberToken.trim(),
          profile,
          body.message || `Welcome, ${profile.name}.`
        );
      } catch (e: any) {
        return { success: false, message: e?.message || 'Could not reach auth server.' };
      }
    },
    [applyAuthSuccess]
  );

  const loginMember = useCallback(
    async (input: {
      name: string;
      password: string;
    }): Promise<{ success: boolean; role?: UserRole; message: string }> => {
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'login_member',
            name: input.name,
            password: input.password,
          }),
        });
        const body = await res.json();
        if (!body.success) {
          return { success: false, message: body.message || 'Login failed.' };
        }
        const profile: MemberProfile = {
          id: body.account?.id || `mem-local`,
          name: body.account?.name || input.name.trim(),
          displayName: body.account?.displayName || body.account?.name || input.name.trim(),
          createdAt: body.account?.createdAt,
          lastLoginAt: body.account?.lastLoginAt ?? null,
        };
        // Prefer server-issued access token (shared member key); fall back to client public key
        const token = body.accessToken || keys.memberKey || DEFAULT_MEMBER_KEY;
        return applyAuthSuccess('member', token, profile, body.message || `Welcome back, ${profile.name}.`);
      } catch (e: any) {
        return { success: false, message: e?.message || 'Could not reach auth server.' };
      }
    },
    [applyAuthSuccess, keys.memberKey]
  );

  const logout = () => {
    setRole('none');
    setActiveKey(null);
    setMemberProfile(null);
    clearSession();
    // Return to landing — do not auto-open login modal
    setIsAuthModalOpen(false);
  };

  const updateKeys = (newAdmin: string, newMember: string) => {
    if (role !== 'admin') {
      return { success: false, message: 'Permission denied. Only Administrator can modify access keys.' };
    }
    if (keysFromEnv) {
      return {
        success: false,
        message:
          'Keys are managed by environment variables (FRC_ADMIN_KEY / FRC_MEMBER_KEY). Update .env and restart the server.',
      };
    }
    const cleanAdmin = newAdmin.trim();
    const cleanMember = newMember.trim();

    if (!cleanAdmin || !cleanMember) {
      return { success: false, message: 'Both Administrator and Member keys must be non-empty.' };
    }
    if (cleanAdmin === cleanMember) {
      return { success: false, message: 'Administrator key and Member key must be distinct.' };
    }

    const updated: KeyConfig = {
      adminKey: cleanAdmin,
      memberKey: cleanMember,
      lastUpdated: new Date().toISOString(),
    };

    setKeys(updated);
    setActiveKey(cleanAdmin);
    try {
      localStorage.setItem('frc_admin_key', cleanAdmin);
      localStorage.setItem('frc_member_key', cleanMember);
      localStorage.setItem('frc_auth_key', cleanAdmin);
      localStorage.setItem('frc_auth_role', 'admin');
      localStorage.removeItem('frc_member_profile');
    } catch {}

    return { success: true, message: 'Access keys updated for this browser session.' };
  };

  const setSqlConnectionKey = (key: string) => {
    const trimmed = key.trim();
    setSqlConnectionKeyInternal(trimmed);
    try {
      localStorage.setItem('frc_sql_connection_key', trimmed);
    } catch {}
  };

  const hasPermission = (
    action:
      | 'manage_keys'
      | 'manage_sql'
      | 'edit_matches'
      | 'edit_picklists'
      | 'submit_scouting'
      | 'view_analytics'
      | 'clear_data'
      | 'view_admin_console'
      | 'view_member_portal'
  ) => {
    if (role === 'admin') return true;
    if (role === 'member') {
      return (
        action === 'submit_scouting' ||
        action === 'view_analytics' ||
        action === 'view_member_portal'
      );
    }
    return false;
  };

  return (
    <AuthKeyContext.Provider
      value={{
        role,
        activeKey,
        isAuthenticated: role === 'admin' || role === 'member',
        isAdmin: role === 'admin',
        isMember: role === 'member',
        memberProfile,
        keys,
        sqlConnectionKey,
        isAuthModalOpen,
        isKeyManagementOpen,
        authReady,
        keysFromEnv,
        envSource,
        loginWithKey,
        registerMember,
        loginMember,
        logout,
        updateKeys,
        setSqlConnectionKey,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => {
          if (role === 'admin' || role === 'member') setIsAuthModalOpen(false);
        },
        openKeyManagement: () => setIsKeyManagementOpen(true),
        closeKeyManagement: () => setIsKeyManagementOpen(false),
        hasPermission,
      }}
    >
      {children}
    </AuthKeyContext.Provider>
  );
}

export function useAuthKey() {
  const context = useContext(AuthKeyContext);
  if (!context) {
    throw new Error('useAuthKey must be used within an AuthKeyProvider');
  }
  return context;
}

// Re-export defaults for any legacy imports
export { DEFAULT_ADMIN_KEY, DEFAULT_MEMBER_KEY };
