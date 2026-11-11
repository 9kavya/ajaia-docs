'use client';

import React, { useState, useRef } from 'react';
import { Document, Attachment, Role } from '@/lib/db/types';
import { useUser } from '@/lib/context/UserContext';
import {
  Paperclip,
  X,
  Upload,
  Download,
  Trash2,
  File,
  FileText,
  Image,
  Loader2,
} from 'lucide-react';

interface AttachmentsDrawerProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onDocumentUpdated: (doc: Document) => void;
  userRole: Role | 'none';
}

export function AttachmentsDrawer({
  document,
  isOpen,
  onClose,
  onDocumentUpdated,
  userRole,
}: AttachmentsDrawerProps) {
  const { currentUser, showToast } = useUser() as any;
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const canUpload = userRole === 'owner' || userRole === 'editor';

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', currentUser.id);

      const res = await fetch(`/api/documents/${document.id}/attachments`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload attachment');

      onDocumentUpdated(data.document);
      showToast(`Attached "${file.name}"`, 'success');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId: string, filename: string) => {
    try {
      const res = await fetch(`/api/documents/${document.id}/attachments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attachmentId,
          userId: currentUser.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete attachment');

      onDocumentUpdated(data.document);
      showToast(`Removed attachment "${filename}"`, 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Paperclip className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Document Attachments</h2>
              <p className="text-[11px] text-gray-500">
                {document.attachments?.length || 0} file(s) attached to this document
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 space-y-5 overflow-y-auto">
          {/* Upload Box */}
          {canUpload && (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 p-3.5 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60 rounded-xl text-xs font-semibold text-indigo-600 transition-all disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading attachment...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload Attachment (PDF, Image, Data)</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Attachments List */}
          <div className="space-y-2">
            {(!document.attachments || document.attachments.length === 0) && (
              <div className="text-center py-12 px-4 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                <Paperclip className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-600">No attachments yet</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Upload relevant background files, images, or specs associated with this document.
                </p>
              </div>
            )}

            {document.attachments?.map((att) => (
              <div
                key={att.id}
                className="p-3 bg-white border border-gray-200 rounded-xl hover:shadow-xs transition-shadow flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                    {att.mimeType.startsWith('image/') ? (
                      <Image className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <FileText className="w-4 h-4 text-indigo-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {att.originalName}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {formatSize(att.size)} &bull; Uploaded by {att.uploadedByName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {att.dataUrl && (
                    <a
                      href={att.dataUrl}
                      download={att.originalName}
                      className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Download attachment"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {canUpload && (
                    <button
                      onClick={() => handleDeleteAttachment(att.id, att.originalName)}
                      className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete attachment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

