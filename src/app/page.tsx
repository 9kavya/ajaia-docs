'use client';

import React, { useState, useEffect } from 'react';
import { Document, DocumentFilter } from '@/lib/db/types';
import { useUser } from '@/lib/context/UserContext';
import { UserSwitcher } from '@/components/dashboard/UserSwitcher';
import { TemplatesBar } from '@/components/dashboard/TemplatesBar';
import { DocumentCard } from '@/components/dashboard/DocumentCard';
import { FileUploadModal } from '@/components/modals/FileUploadModal';
import { ShareModal } from '@/components/modals/ShareModal';
import { localIndexedDB } from '@/lib/db/indexedDB';
import {
  FileText,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Plus,
  UploadCloud,
  FolderOpen,
  Sparkles,
  Database,
} from 'lucide-react';

export default function DashboardPage() {
  const { currentUser, showToast } = useUser() as any;
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filter, setFilter] = useState<DocumentFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [sharingDoc, setSharingDoc] = useState<Document | null>(null);

  const fetchDocuments = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/documents?userId=${currentUser.id}&filter=${filter}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch documents');
      const docs = data.documents || [];
      setDocuments(docs);

      // Sync into client-side IndexedDB for offline persistence
      if (localIndexedDB.isSupported()) {
        await localIndexedDB.syncDocuments(docs);
      }
    } catch (err: any) {
      // Fallback directly to client-side IndexedDB if offline or server is paused
      if (localIndexedDB.isSupported()) {
        const localDocs = await localIndexedDB.getAllDocuments(currentUser.id, filter);
        if (localDocs.length > 0) {
          setDocuments(localDocs);
          showToast('Loaded documents from local IndexedDB', 'info');
        } else {
          showToast(err.message, 'error');
        }
      } else {
        showToast(err.message, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [currentUser?.id, filter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const res = await fetch(`/api/documents/${id}?userId=${currentUser?.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');

      // Delete from client-side IndexedDB
      if (localIndexedDB.isSupported()) {
        await localIndexedDB.deleteDocument(id);
      }

      setDocuments((prev) => prev.filter((d) => d.id !== id));
      showToast('Document deleted from local storage & IndexedDB', 'info');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const filteredDocs = documents.filter((doc) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      (doc.plainTextPreview && doc.plainTextPreview.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Main Navigation Bar */}
      <header className="border-b border-gray-200 px-4 md:px-8 py-2.5 flex items-center justify-between gap-4 sticky top-0 bg-white/95 backdrop-blur-xs z-30">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-gray-900 tracking-tight text-base">
              Ajaia <span className="text-blue-600 font-semibold">Docs</span>
            </span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by title or content..."
              className="w-full text-xs bg-gray-100/80 hover:bg-gray-100 focus:bg-white pl-9 pr-4 py-2 rounded-full border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* User Switcher & Local DB Badge */}
        <div className="flex items-center gap-2.5">
          <div
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[11px] text-emerald-800 font-medium"
            title="IndexedDB connected: Local browser database active (AjaiaDocs_LocalDB)"
          >
            <Database className="w-3 h-3 text-emerald-600" />
            <span>Local DB: IndexedDB</span>
          </div>
          <UserSwitcher />
        </div>
      </header>

      {/* Templates Bar */}
      <TemplatesBar onOpenUpload={() => setIsUploadModalOpen(true)} />

      {/* Main Documents Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 py-8">
        {/* Section Header & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-base font-bold text-gray-900">Your Documents</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Viewing documents as <strong className="text-gray-700">{currentUser.name}</strong> ({currentUser.roleDescription})
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'all'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              All Documents
            </button>
            <button
              onClick={() => setFilter('owned')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'owned'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Owned by me
            </button>
            <button
              onClick={() => setFilter('shared')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === 'shared'
                  ? 'bg-white text-blue-800 shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              Shared with me
            </button>
          </div>
        </div>

        {/* Document Grid */}
        <div className="pt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-44 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : filteredDocs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  onDelete={handleDelete}
                  onShare={(d) => setSharingDoc(d)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 px-4 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                <FolderOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">No documents found</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                {filter === 'shared'
                  ? "No documents have been shared with this persona yet. Switch personas or share a document from Alex's account!"
                  : "Start by picking a template above or importing a Markdown or Word file."}
              </p>
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-xs flex items-center gap-1.5"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Import File (.md / .docx)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          fetchDocuments();
        }}
      />

      {/* Share Modal */}
      {sharingDoc && (
        <ShareModal
          document={sharingDoc}
          isOpen={!!sharingDoc}
          onClose={() => {
            setSharingDoc(null);
            fetchDocuments();
          }}
          onDocumentUpdated={(updated) => {
            setSharingDoc(updated);
            fetchDocuments();
          }}
          userRole={
            sharingDoc.ownerId === currentUser.id
              ? 'owner'
              : (sharingDoc.collaborators.find((c) => c.userId === currentUser.id)?.role as any) ||
                'none'
          }
        />
      )}
    </div>
  );
}

