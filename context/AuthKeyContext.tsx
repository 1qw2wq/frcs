'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole, KeyConfig } from '@/types/frc';

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
  loginWithKey: (key: string) => { success: boolean; role?: UserRole; message: string };
  logout: () => void;
  updateKeys: (newAdmin: string, newMember: string) => { success: boolean; message: string };
  setSqlConnectionKey: (key: string) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openKeyManagement: () => void;
  closeKeyManagement: () => void;
  hasPermission: (action: 'manage_keys' | 'manage_sql' | 'edit_matches' | 'edit_picklists' | 'submit_scouting' | 'view_analytics') => boolean;
}

const DEFAULT_ADMIN_KEY = 'FRC-ADMIN-2025';
const DEFAULT_MEMBER_KEY = 'FRC-MEMBER-TEAM';

const AuthKeyContext = createContext<AuthKeyContextType | undefined>(undefined);

export function AuthKeyProvider({ children }: { children: React.ReactNode }) {
  const [keys, setKeys] = useState<KeyConfig>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedAdminKey = localStorage.getItem('frc_admin_key');
        const savedMemberKey = localStorage.getItem('frc_member_key');
        return {
          adminKey: savedAdminKey || DEFAULT_ADMIN_KEY,
          memberKey: savedMemberKey || DEFAULT_MEMBER_KEY,
          lastUpdated: new Date().toISOString(),
        };
      } catch {}
    }
    return {
      adminKey: DEFAULT_ADMIN_KEY,
      memberKey: DEFAULT_MEMBER_KEY,
      lastUpdated: new Date().toISOString(),
    };
  });

  const [role, setRole] = useState<UserRole>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedRole = localStorage.getItem('frc_auth_role') as UserRole;
        if (savedRole === 'admin' || savedRole === 'member') return savedRole;
      } catch {}
    }
    return 'admin';
  });

  const [activeKey, setActiveKey] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedActiveKey = localStorage.getItem('frc_auth_key');
        if (savedActiveKey) return savedActiveKey;
      } catch {}
    }
    return DEFAULT_ADMIN_KEY;
  });

  const [sqlConnectionKey, setSqlConnectionKeyInternal] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedSqlKey = localStorage.getItem('frc_sql_connection_key');
        if (savedSqlKey) return savedSqlKey;
      } catch {}
    }
    return 'Server=tcp:frc-db.database.windows.net,1433;Database=frc_tournament;User Id=frc_admin;';
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isKeyManagementOpen, setIsKeyManagementOpen] = useState(false);

  const loginWithKey = (inputKey: string): { success: boolean; role?: UserRole; message: string } => {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      return { success: false, message: 'Please enter a valid access key.' };
    }

    if (trimmed === keys.adminKey) {
      setRole('admin');
      setActiveKey(trimmed);
      try {
        localStorage.setItem('frc_auth_role', 'admin');
        localStorage.setItem('frc_auth_key', trimmed);
      } catch {}
      setIsAuthModalOpen(false);
      return { success: true, role: 'admin' as UserRole, message: 'Administrator Access Granted. Full permissions unlocked.' };
    }

    if (trimmed === keys.memberKey) {
      setRole('member');
      setActiveKey(trimmed);
      try {
        localStorage.setItem('frc_auth_role', 'member');
        localStorage.setItem('frc_auth_key', trimmed);
      } catch {}
      setIsAuthModalOpen(false);
      return { success: true, role: 'member' as UserRole, message: 'Member Access Granted. Scouting & Telemetry view active.' };
    }

    return { success: false, message: 'Invalid Access Key. Please check with your team lead or administrator.' };
  };

  const logout = () => {
    setRole('none');
    setActiveKey(null);
    try {
      localStorage.removeItem('frc_auth_role');
      localStorage.removeItem('frc_auth_key');
    } catch {}
    setIsAuthModalOpen(true);
  };

  const updateKeys = (newAdmin: string, newMember: string) => {
    if (role !== 'admin') {
      return { success: false, message: 'Permission denied. Only Administrator can modify access keys.' };
    }
    const cleanAdmin = newAdmin.trim();
    const cleanMember = newMember.trim();

    if (!cleanAdmin || !cleanMember) {
      return { success: false, message: 'Both Administrator and Member keys must be non-empty.' };
    }
    if (cleanAdmin === cleanMember) {
      return { success: false, message: 'Administrator key and Member key must be distinct for security.' };
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
    } catch {}

    return { success: true, message: 'Access keys updated successfully across all pages.' };
  };

  const setSqlConnectionKey = (key: string) => {
    const trimmed = key.trim();
    setSqlConnectionKeyInternal(trimmed);
    try {
      localStorage.setItem('frc_sql_connection_key', trimmed);
    } catch {}
  };

  const hasPermission = (action: 'manage_keys' | 'manage_sql' | 'edit_matches' | 'edit_picklists' | 'submit_scouting' | 'view_analytics') => {
    if (role === 'admin') return true;
    if (role === 'member') {
      return action === 'submit_scouting' || action === 'view_analytics';
    }
    return false;
  };

  return (
    <AuthKeyContext.Provider
      value={{
        role,
        activeKey,
        isAuthenticated: role !== 'none',
        isAdmin: role === 'admin',
        isMember: role === 'member',
        keys,
        sqlConnectionKey,
        isAuthModalOpen,
        isKeyManagementOpen,
        loginWithKey,
        logout,
        updateKeys,
        setSqlConnectionKey,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
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
