'use client';

import React, { useState } from 'react';
import { useUser, CLIENT_SEEDED_USERS } from '@/lib/context/UserContext';
import { FileText, Eye, EyeOff, LogIn } from 'lucide-react';

export function LoginPage() {
  const { login, showToast } = useUser() as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // small UX delay
    const ok = login(email, password);
    setLoading(false);
    if (!ok) setError('Invalid email or password. Check the credentials below.');
  };

  const quickLogin = (userId: string) => {
    const creds: Record<string, { email: string; password: string }> = {
      usr_alex:   { email: 'alex@ajaia.io',   password: 'alex123'   },
      usr_sarah:  { email: 'sarah@ajaia.io',  password: 'sarah123'  },
      usr_marcus: { email: 'marcus@ajaia.io', password: 'marcus123' },
      usr_kavya:  { email: 'kavya@ajaia.io',  password: 'kavya123'  },
    };
    const c = creds[userId];
    if (c) {
      setEmail(c.email);
      setPassword(c.password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 shadow-lg mb-4">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Ajaia Docs</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your workspace</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-black/5 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@ajaia.io"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* Quick-login personas */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Quick login — demo accounts
            </p>
            <div className="space-y-2">
              {CLIENT_SEEDED_USERS.map((u) => {
                const pwMap: Record<string, string> = {
                  usr_alex: 'alex123', usr_sarah: 'sarah123',
                  usr_marcus: 'marcus123', usr_kavya: 'kavya123',
                };
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => quickLogin(u.id)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all text-left border border-gray-100"
                  >
                    <img
                      src={u.avatar}
                      alt={u.name}
                      style={{ width: '36px', height: '36px', minWidth: '36px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                    <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                      {pwMap[u.id]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

