'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/context/UserContext';
import {
  UploadCloud,
  FileText,
  X,
  FileCode,
  FileCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface FileUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FileUploadModal({ isOpen, onClose }: FileUploadModalProps) {
  const router = useRouter();
  const { currentUser, showToast } = useUser() as any;
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['md', 'markdown', 'txt', 'docx', 'json'];

    if (!ext || !validExtensions.includes(ext)) {
      showToast(
        `Unsupported file type .${ext}. Please upload a .md, .txt, or .docx file.`,
        'error'
      );
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('File size exceeds 10MB limit.', 'error');
      return;
    }

    setSelectedFile(file);
  };

  const handleUploadAndConvert = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('userId', currentUser.id);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload and parse file');
      }

      showToast(`Imported "${data.document.title}" successfully!`, 'success');
      onClose();
      router.push(`/document/${data.document.id}`);
    } catch (err: any) {
      showToast(err.message, 'error');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 leading-tight">
                Import Document
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Upload a file to convert it into an editable document
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
        <div className="p-6 space-y-5">
          {/* Supported Format Pills */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-semibold text-gray-700">Supported Formats:</span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono text-[11px] font-semibold rounded">
              .md
            </span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono text-[11px] font-semibold rounded">
              .docx
            </span>
            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-mono text-[11px] font-semibold rounded">
              .txt
            </span>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-mono text-[11px] font-semibold rounded">
              .json
            </span>
          </div>

          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50 scale-[0.99]'
                : selectedFile
                ? 'border-emerald-400 bg-emerald-50/20'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".md,.markdown,.txt,.docx,.json"
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileCheck className="w-6 h-6" />
                </div>
                <div className="font-semibold text-gray-900 text-sm">{selectedFile.name}</div>
                <div className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB &bull; Click to change file
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2.5">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-semibold text-indigo-600 hover:underline text-sm">
                    Click to browse
                  </span>{' '}
                  <span className="text-gray-500 text-sm">or drag and drop</span>
                </div>
                <p className="text-xs text-gray-400">
                  Markdown (.md), Word (.docx), or Text (.txt) up to 10MB
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl text-xs text-gray-600 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
            <div>
              Headings, lists, bold, italics, and code blocks are automatically parsed into the
              rich-text editor format so you can edit immediately.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUploadAndConvert}
            disabled={!selectedFile || isUploading}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-indigo-500/25 flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Importing & Converting...</span>
              </>
            ) : (
              <span>Import & Open Document</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

