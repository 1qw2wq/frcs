'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole, KeyConfig } from '@/types/frc';
import {
  DEFAULT_ADMIN_KEY,
  DEFAULT_MEMBER_KEY,
  getClientAdminKey,
  getClientMemberKey,
} from '@/lib/accessKeys';

interface AuthKeyContextType {
  role: UserRole;
  activeKey: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMember: boolean;
  keys: KeyConfig;
  sqlConnectionKey: string;
  isAuthModalOpen: boolean;
  isKeyManagementOpen: boolean;
  authReady: boolean;
  /** Keys come from env; true when FRC_* / NEXT_PUBLIC_FRC_* are set */
  keysFromEnv: boolean;
  envSource: { admin: string; member: string };
  loginWithKey: (key: string) => Promise<{ success: boolean; role?: UserRole; message: string }>;
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
            // Prefer public keys when server exposes them (NEXT_PUBLIC or defaults).
            // If only server-side FRC_* secrets are set, clear client copies so we
            // don't accidentally quick-login with the built-in defaults.
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

      // localStorage overrides only when env is NOT the source of truth
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

        if (savedRole && savedActiveKey) {
          // Re-validate session against current keys (env may have changed)
          const stillValid =
            (savedRole === 'admin' && savedActiveKey === adminK) ||
            (savedRole === 'member' && savedActiveKey === memberK);

          if (stillValid) {
            // Also confirm with server when possible
            try {
              const v = await fetch('/api/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: savedActiveKey }),
              });
              const body = await v.json();
              if (body.success && body.role === savedRole) {
                setRole(savedRole);
                setActiveKey(savedActiveKey);
                setIsAuthModalOpen(false);
                setAuthReady(true);
                return;
              }
            } catch {
              // Server unreachable — trust local match against env/public keys
              setRole(savedRole);
              setActiveKey(savedActiveKey);
              setIsAuthModalOpen(false);
              setAuthReady(true);
              return;
            }
          }
        }
      } catch {
        /* ignore */
      }

      // Stay logged out without forcing the login modal — landing page handles entry
      setRole('none');
      setActiveKey(null);
      setIsAuthModalOpen(false);
      setAuthReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const loginWithKey = useCallback(
    async (inputKey: string): Promise<{ success: boolean; role?: UserRole; message: string }> => {
      const trimmed = inputKey.trim();
      if (!trimmed) {
        return { success: false, message: 'Please enter a valid access key.' };
      }

      // Primary: server validates against FRC_ADMIN_KEY / FRC_MEMBER_KEY env
      try {
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: trimmed }),
        });
        const body = await res.json();
        if (body.success && (body.role === 'admin' || body.role === 'member')) {
          const nextRole = body.role as UserRole;
          setRole(nextRole);
          setActiveKey(trimmed);
          try {
            localStorage.setItem('frc_auth_role', nextRole);
            localStorage.setItem('frc_auth_key', trimmed);
          } catch {}
          setIsAuthModalOpen(false);
          return { success: true, role: nextRole, message: body.message };
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

      // Fallback: client-side match against NEXT_PUBLIC_ / known keys (only if non-empty)
      if (keys.adminKey && trimmed === keys.adminKey) {
        setRole('admin');
        setActiveKey(trimmed);
        try {
          localStorage.setItem('frc_auth_role', 'admin');
          localStorage.setItem('frc_auth_key', trimmed);
        } catch {}
        setIsAuthModalOpen(false);
        return {
          success: true,
          role: 'admin',
          message: 'Administrator Access Granted. Full control console unlocked.',
        };
      }
      if (keys.memberKey && trimmed === keys.memberKey) {
        setRole('member');
        setActiveKey(trimmed);
        try {
          localStorage.setItem('frc_auth_role', 'member');
          localStorage.setItem('frc_auth_key', trimmed);
        } catch {}
        setIsAuthModalOpen(false);
        return {
          success: true,
          role: 'member',
          message: 'Member Access Granted. Student portal & scouting unlocked.',
        };
      }

      return {
        success: false,
        message: 'Invalid Access Key. Set FRC_ADMIN_KEY / FRC_MEMBER_KEY in .env and restart.',
      };
    },
    [keys.adminKey, keys.memberKey]
  );

  const logout = () => {
    setRole('none');
    setActiveKey(null);
    try {
      localStorage.removeItem('frc_auth_role');
      localStorage.removeItem('frc_auth_key');
    } catch {}
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
        keys,
        sqlConnectionKey,
        isAuthModalOpen,
        isKeyManagementOpen,
        authReady,
        keysFromEnv,
        envSource,
        loginWithKey,
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
