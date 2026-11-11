'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../db/types';

export const CLIENT_SEEDED_USERS: User[] = [
  {
    id: 'usr_alex',
    name: 'Alex Rivera',
    email: 'alex@ajaia.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    roleDescription: 'Product Lead',
  },
  {
    id: 'usr_sarah',
    name: 'Sarah Chen',
    email: 'sarah@ajaia.io',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    roleDescription: 'Engineering Lead',
  },
  {
    id: 'usr_marcus',
    name: 'Marcus Vance',
    email: 'marcus@ajaia.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    roleDescription: 'Design Lead',
  },
  {
    id: 'usr_kavya',
    name: 'Kavya Reddy',
    email: 'kavya@ajaia.io',
    avatar: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&auto=format&fit=crop&q=80',
    roleDescription: 'Content Strategist',
  },
];

// Simulated credentials stored in localStorage key: ajaia_credentials
// Format: { [userId]: { email, password } }
const DEFAULT_CREDENTIALS: Record<string, { email: string; password: string }> = {
  usr_alex:   { email: 'alex@ajaia.io',   password: 'alex123'   },
  usr_sarah:  { email: 'sarah@ajaia.io',  password: 'sarah123'  },
  usr_marcus: { email: 'marcus@ajaia.io', password: 'marcus123' },
  usr_kavya:  { email: 'kavya@ajaia.io',  password: 'kavya123'  },
};

function getStoredCredentials(): Record<string, { email: string; password: string }> {
  if (typeof window === 'undefined') return DEFAULT_CREDENTIALS;
  try {
    const raw = localStorage.getItem('ajaia_credentials');
    if (raw) return { ...DEFAULT_CREDENTIALS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_CREDENTIALS;
}

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UserContextType {
  currentUser: User | null;
  isLoggedIn: boolean;
  users: User[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('ajaia_active_user_id');
    const savedSession = localStorage.getItem('ajaia_session_active');
    if (savedUserId && savedSession === 'true') {
      const found = CLIENT_SEEDED_USERS.find((u) => u.id === savedUserId);
      if (found) {
        setCurrentUser(found);
        setIsLoggedIn(true);
      }
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const creds = getStoredCredentials();
    const matched = CLIENT_SEEDED_USERS.find((u) => {
      const c = creds[u.id];
      return c && c.email === email.trim().toLowerCase() && c.password === password;
    });
    if (matched) {
      setCurrentUser(matched);
      setIsLoggedIn(true);
      localStorage.setItem('ajaia_active_user_id', matched.id);
      localStorage.setItem('ajaia_session_active', 'true');
      showToast(`Welcome back, ${matched.name}!`, 'success');
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('ajaia_active_user_id');
    localStorage.setItem('ajaia_session_active', 'false');
    showToast('Logged out successfully.', 'info');
  };

  const switchUser = (userId: string) => {
    const found = CLIENT_SEEDED_USERS.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('ajaia_active_user_id', found.id);
      localStorage.setItem('ajaia_session_active', 'true');
      showToast(`Switched to ${found.name} (${found.roleDescription})`, 'info');
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <UserContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        users: CLIENT_SEEDED_USERS,
        login,
        logout,
        switchUser,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

