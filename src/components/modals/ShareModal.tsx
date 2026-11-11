'use client';

import React, { useState } from 'react';
import { Document, Role } from '@/lib/db/types';
import { useUser } from '@/lib/context/UserContext';
import {
  X,
  Users,
  Copy,
  Check,
  Shield,
  Trash2,
  UserPlus,
  Lock,
} from 'lucide-react';

interface ShareModalProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onDocumentUpdated: (doc: Document) => void;
  userRole: Role | 'none';
}

export function ShareModal({
  document,
  isOpen,
  onClose,
  onDocumentUpdated,
  userRole,
}: ShareModalProps) {
  const { currentUser, users, showToast } = useUser() as any;
  const [targetEmail, setTargetEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState<'editor' | 'viewer'>('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const canManageSharing = userRole === 'owner' || userRole === 'editor';
  const isOwner = userRole === 'owner';

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/documents/${document.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          targetEmail: targetEmail.trim(),
          role: selectedRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to share document');
      }

      onDocumentUpdated(data.document);
      showToast(`Shared access with ${targetEmail} as ${selectedRole}`, 'success');
      setTargetEmail('');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorUserId: string, collaboratorName: string) => {
    try {
      const res = await fetch(`/api/documents/${document.id}/share`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          targetUserId: collaboratorUserId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove collaborator');

      onDocumentUpdated(data.document);
      showToast(`Removed access for ${collaboratorName}`, 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const handleRoleChange = async (collaboratorEmail: string, newRole: 'editor' | 'viewer') => {
    try {
      const res = await fetch(`/api/documents/${document.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          targetEmail: collaboratorEmail,
          role: newRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update collaborator role');

      onDocumentUpdated(data.document);
      showToast(`Updated permissions for ${collaboratorEmail}`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const copyShareLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    showToast('Document link copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 leading-tight">
                Share &ldquo;{document.title}&rdquo;
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Manage who can view or edit this document
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Add collaborator form */}
          {canManageSharing ? (
            <form onSubmit={handleShare} className="space-y-3">
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Add People or Groups
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    placeholder="Enter email (e.g. sarah@ajaia.io)"
                    className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400"
                  />
                </div>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as 'editor' | 'viewer')}
                  className="text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  type="submit"
                  disabled={isSubmitting || !targetEmail.trim()}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-blue-500/25 flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Invite</span>
                </button>
              </div>

              {/* Quick-add team suggestions */}
              <div className="pt-1">
                <span className="text-[11px] font-medium text-gray-400 mr-2">Quick Add:</span>
                <div className="inline-flex flex-wrap gap-1.5 mt-1">
                  {users
                    .filter((u: any) => u.email !== document.ownerEmail)
                    .map((user: any) => {
                      const isAlreadyCollab = document.collaborators.some(
                        (c) => c.email.toLowerCase() === user.email.toLowerCase()
                      );
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => setTargetEmail(user.email)}
                          disabled={isAlreadyCollab}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                            isAlreadyCollab
                              ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default'
                              : 'bg-white hover:bg-blue-50 text-gray-700 border-gray-200 hover:border-blue-200 hover:text-blue-600'
                          }`}
                        >
                          {user.name} ({user.roleDescription})
                          {isAlreadyCollab && ' ✓'}
                        </button>
                      );
                    })}
                </div>
              </div>
            </form>
          ) : (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200/60 rounded-xl flex items-center gap-2.5 text-xs text-amber-800">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>You have read-only access to this document. Only owners and editors can share.</span>
            </div>
          )}

          {/* Collaborators list */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              People With Access ({1 + document.collaborators.length})
            </h3>

            <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-gray-50/30">
              {/* Owner Row */}
              <div className="flex items-center justify-between p-3 bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
                    {document.ownerName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                      <span>{document.ownerName}</span>
                      {document.ownerId === currentUser.id && (
                        <span className="text-[10px] bg-blue-50 text-blue-700 font-medium px-1.5 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500">{document.ownerEmail}</div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Shield className="w-3 h-3 text-blue-600" />
                  Owner
                </span>
              </div>

              {/* Collaborators */}
              {document.collaborators.map((collaborator) => (
                <div
                  key={collaborator.userId}
                  className="flex items-center justify-between p-3 bg-white hover:bg-gray-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center font-bold text-sm border border-gray-200">
                      {collaborator.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                        <span>{collaborator.name}</span>
                        {collaborator.userId === currentUser.id && (
                          <span className="text-[10px] bg-purple-50 text-purple-700 font-medium px-1.5 py-0.5 rounded-full">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500">{collaborator.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {canManageSharing ? (
                      <>
                        <select
                          value={collaborator.role}
                          onChange={(e) =>
                            handleRoleChange(collaborator.email, e.target.value as 'editor' | 'viewer')
                          }
                          className="text-xs font-medium px-2.5 py-1 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none"
                        >
                          <option value="editor">Can edit</option>
                          <option value="viewer">Can view</option>
                        </select>
                        {isOwner && (
                          <button
                            onClick={() =>
                              handleRemoveCollaborator(collaborator.userId, collaborator.name)
                            }
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    ) : (
                      <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg capitalize">
                        {collaborator.role === 'editor' ? 'Can edit' : 'Can view'}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {document.collaborators.length === 0 && (
                <div className="p-4 text-center text-xs text-gray-400 bg-white">
                  No other collaborators yet. Invite teammates above!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={copyShareLink}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-all shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-semibold transition-all shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

