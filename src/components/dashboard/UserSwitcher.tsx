'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '@/lib/context/UserContext';
import { ChevronDown, Check, UserCheck } from 'lucide-react';

export function UserSwitcher() {
  const { currentUser, users, switchUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-sm font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        title="Switch persona to test permissions & sharing"
      >
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          style={{ width: '24px', height: '24px', minWidth: '24px', borderRadius: '50%', objectFit: 'cover' }}
          className="ring-1 ring-blue-500 shrink-0"
        />
        <div className="flex flex-col items-start text-xs leading-none">
          <span className="font-semibold text-gray-900">{currentUser.name}</span>
          <span className="text-[10px] text-gray-500 mt-0.5">{currentUser.roleDescription}</span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 divide-y divide-gray-100 focus:outline-none z-50 animate-in fade-in-50 zoom-in-95">
          <div className="p-3 bg-gray-50/70 rounded-t-2xl">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Simulated Persona Switcher</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Switch users to instantly test multi-user sharing and role-based access.
            </p>
          </div>

          <div className="p-1.5 space-y-1">
            {users.map((user) => {
              const isSelected = user.id === currentUser.id;
              return (
                <button
                  key={user.id}
                  onClick={() => {
                    switchUser(user.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-sm transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 text-blue-900 font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      style={{ width: '32px', height: '32px', minWidth: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      className="border border-gray-200 shrink-0"
                    />
                    <div>
                      <div className="text-xs font-semibold text-gray-900">{user.name}</div>
                      <div className="text-[11px] text-gray-500">{user.email}</div>
                      <span className="inline-block mt-0.5 text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded font-normal">
                        {user.roleDescription}
                      </span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

