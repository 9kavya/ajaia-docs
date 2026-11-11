'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Document, Role } from '@/lib/db/types';
import { useUser } from '@/lib/context/UserContext';
import { UserSwitcher } from '../dashboard/UserSwitcher';
import {
  FileText,
  ArrowLeft,
  Cloud,
  Check,
  Loader2,
  Share2,
  Paperclip,
  Lock,
  Users,
} from 'lucide-react';

interface DocumentHeaderProps {
  document: Document;
  saveStatus: 'saved' | 'saving' | 'unsaved';
  userRole: Role | 'none';
  onTitleChange: (newTitle: string) => void;
  onOpenShare: () => void;
  onOpenAttachments: () => void;
}

export function DocumentHeader({
  document,
  saveStatus,
  userRole,
  onTitleChange,
  onOpenShare,
  onOpenAttachments,
}: DocumentHeaderProps) {
  const { currentUser } = useUser();
  const [title, setTitle] = useState(document.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    setTitle(document.title);
  }, [document.title]);

  const canEdit = userRole === 'owner' || userRole === 'editor';

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (title.trim() && title !== document.title) {
      onTitleChange(title.trim());
    } else {
      setTitle(document.title);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const attachmentCount = document.attachments?.length || 0;

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 sticky top-0 z-30 flex items-center justify-between gap-4">
      {/* Left: Back button & Document Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Link
          href="/"
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors flex items-center gap-1 text-xs font-medium shrink-0"
          title="Back to all documents"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Docs</span>
        </Link>

        <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <FileText className="w-4 h-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {canEdit ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleBlur}
                onKeyDown={handleKeyDown}
                className="text-base font-semibold text-gray-900 hover:bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 rounded px-1.5 py-0.5 border border-transparent truncate max-w-md transition-all outline-none"
                placeholder="Untitled Document"
              />
            ) : (
              <span className="text-base font-semibold text-gray-900 px-1.5 py-0.5 truncate max-w-md">
                {document.title}
              </span>
            )}

            {/* Role Badge */}
            {userRole === 'owner' && (
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full shrink-0">
                Owner
              </span>
            )}
            {userRole === 'editor' && (
              <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 px-2 py-0.5 rounded-full shrink-0">
                Editor
              </span>
            )}
            {userRole === 'viewer' && (
              <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                View Only
              </span>
            )}
          </div>

          {/* Subheader status */}
          <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-0.5 px-1.5">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1 text-gray-500">
                <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                <span>Saving to cloud...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-gray-500">
                <Cloud className="w-3 h-3 text-emerald-600" />
                <span>Saved to storage</span>
              </span>
            )}
            {saveStatus === 'unsaved' && (
              <span className="text-amber-600 font-medium">Unsaved changes</span>
            )}

            <span className="hidden md:inline text-gray-300">&bull;</span>

            <span className="hidden md:inline text-gray-400">
              Owned by <strong className="text-gray-600 font-medium">{document.ownerName}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions, Share button & User Switcher */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Attachments drawer button */}
        <button
          onClick={onOpenAttachments}
          className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-medium text-gray-700 transition-colors shadow-xs"
          title="Document Attachments"
        >
          <Paperclip className="w-3.5 h-3.5 text-gray-500" />
          <span className="hidden sm:inline">Attachments</span>
          {attachmentCount > 0 && (
            <span className="px-1.5 py-0.2 bg-indigo-100 text-indigo-700 font-bold text-[10px] rounded-full">
              {attachmentCount}
            </span>
          )}
        </button>

        {/* Share Button (Google Docs style) */}
        <button
          onClick={onOpenShare}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs hover:shadow-blue-500/20 transition-all"
        >
          {document.collaborators.length > 0 ? (
            <Users className="w-3.5 h-3.5" />
          ) : (
            <Lock className="w-3.5 h-3.5" />
          )}
          <span>Share</span>
          {document.collaborators.length > 0 && (
            <span className="bg-blue-500/80 px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {document.collaborators.length}
            </span>
          )}
        </button>

        <div className="h-5 w-[1px] bg-gray-200 mx-0.5" />

        {/* User Switcher */}
        <UserSwitcher />
      </div>
    </header>
  );
}
