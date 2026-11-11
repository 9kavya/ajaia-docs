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
];

interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface UserContextType {
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(CLIENT_SEEDED_USERS[0]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const savedUserId = localStorage.getItem('ajaia_active_user_id');
    if (savedUserId) {
      const found = CLIENT_SEEDED_USERS.find((u) => u.id === savedUserId);
      if (found) setCurrentUser(found);
    }
  }, []);

  const switchUser = (userId: string) => {
    const found = CLIENT_SEEDED_USERS.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('ajaia_active_user_id', found.id);
      showToast(`Switched active persona to ${found.name} (${found.roleDescription})`, 'info');
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
        users: CLIENT_SEEDED_USERS,
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

