'use client';

import React from 'react';
import { useUser } from '@/lib/context/UserContext';
import { LoginPage } from '@/components/auth/LoginPage';

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoggedIn } = useUser() as any;
  if (!isLoggedIn) return <LoginPage />;
  return <>{children}</>;
}

