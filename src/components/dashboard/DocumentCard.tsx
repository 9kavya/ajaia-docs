'use client';

import React from 'react';
import Link from 'next/link';
import { Document } from '@/lib/db/types';
import { useUser } from '@/lib/context/UserContext';
import {
  FileText,
  Users,
  Shield,
  Trash2,
  Lock,
  Edit3,
  Clock,
  MoreVertical,
} from 'lucide-react';

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
  onShare: (doc: Document) => void;
}

export function DocumentCard({ document, onDelete, onShare }: DocumentCardProps) {
  const { currentUser } = useUser() as any;
  const isOwner = document.ownerId === currentUser.id;
  const userCollab = document.collaborators.find((c) => c.userId === currentUser.id);
  const userRole = isOwner ? 'owner' : userCollab ? userCollab.role : 'none';

  return (
    <div className="bg-white rounded-xl border border-gray-200/90 hover:border-blue-400 hover:shadow-md transition-all flex flex-col overflow-hidden group">
      {/* Top Preview Area */}
      <Link
        href={`/document/${document.id}`}
        className="h-28 bg-[#fdfdfd] p-4 border-b border-gray-100 flex flex-col justify-start relative overflow-hidden group-hover:bg-blue-50/20 transition-colors"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <FileText className="w-3.5 h-3.5" />
          </div>

          {/* Badges */}
          <div>
            {isOwner ? (
              <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Shield className="w-2.5 h-2.5" />
                Owner
              </span>
            ) : userRole === 'editor' ? (
              <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Edit3 className="w-2.5 h-2.5" />
                Shared: Editor
              </span>
            ) : (
              <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                Shared: Viewer
              </span>
            )}
          </div>
        </div>

        {/* Text snippet preview */}
        <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
          {document.plainTextPreview || 'No content yet...'}
        </p>
      </Link>

      {/* Details & Actions Footer */}
      <div className="p-3.5 flex flex-col justify-between flex-1 gap-3 bg-white">
        <div>
          <Link
            href={`/document/${document.id}`}
            className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1"
          >
            {document.title}
          </Link>

          <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-1">
            <Clock className="w-3 h-3 text-gray-400" />
            <span className="truncate">
              {isOwner ? 'Created by you' : `Shared by ${document.ownerName}`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
          {/* Collaborator Avatars */}
          <div className="flex items-center -space-x-1.5 overflow-hidden">
            {document.collaborators.slice(0, 3).map((c, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center ring-1 ring-white"
                title={`${c.name} (${c.role})`}
              >
                {c.name.charAt(0)}
              </div>
            ))}
            {document.collaborators.length > 3 && (
              <div className="w-5 h-5 rounded-full bg-gray-100 text-gray-600 text-[9px] font-bold flex items-center justify-center ring-1 ring-white">
                +{document.collaborators.length - 3}
              </div>
            )}
            {document.collaborators.length === 0 && (
              <span className="text-[10px] text-gray-400">Only you</span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onShare(document)}
              className="p-1 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="Share document"
            >
              <Users className="w-3.5 h-3.5" />
            </button>

            {isOwner && (
              <button
                onClick={() => onDelete(document.id)}
                className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete document"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

