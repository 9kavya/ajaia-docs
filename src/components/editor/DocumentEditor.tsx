'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Highlight from '@tiptap/extension-highlight';

import { EditorToolbar } from './EditorToolbar';
import { Document, Role } from '@/lib/db/types';
import { useUser } from '@/lib/context/UserContext';
import { DocumentHeader } from './DocumentHeader';
import { UserSwitcher } from '../dashboard/UserSwitcher';
import { ShareModal } from '../modals/ShareModal';
import { AttachmentsDrawer } from '../modals/AttachmentsDrawer';

interface DocumentEditorProps {
  initialDocument: Document;
  initialRole: Role | 'none';
}

export function DocumentEditor({ initialDocument, initialRole }: DocumentEditorProps) {
  const { currentUser, showToast } = useUser();
  const [document, setDocument] = useState<Document>(initialDocument);
  const [userRole, setUserRole] = useState<Role | 'none'>(initialRole);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAttachmentsOpen, setIsAttachmentsOpen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);

  // Recalculate permission role whenever currentUser changes
  useEffect(() => {
    if (document.ownerId === currentUser.id) {
      setUserRole('owner');
    } else {
      const coll = document.collaborators.find((c) => c.userId === currentUser.id);
      if (coll) {
        setUserRole(coll.role);
      } else {
        setUserRole('none');
      }
    }
  }, [currentUser.id, document]);

  const canEdit = userRole === 'owner' || userRole === 'editor';

  // Persistence handler
  const saveDocumentContent = useCallback(
    async (content: string, title?: string) => {
      if (!canEdit) return;

      setSaveStatus('saving');
      try {
        const res = await fetch(`/api/documents/${document.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            content,
            title: title || document.title,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to save document');

        setDocument(data.document);
        setSaveStatus('saved');
      } catch (err: any) {
        setSaveStatus('unsaved');
        showToast(err.message || 'Error saving changes', 'error');
      }
    },
    [canEdit, currentUser.id, document.id, document.title, showToast]
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Placeholder.configure({
        placeholder: 'Start writing your document here... Type "/" for commands or format from toolbar.',
      }),
    ],
    content: document.content,
    editable: canEdit,
    editorProps: {
      attributes: {
        class:
          'prose prose-slate max-w-none focus:outline-none min-h-[750px] text-gray-800 text-[15px] leading-relaxed',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();

      // Update metrics
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
      setCharCount(text.length);

      if (!canEdit) return;

      setSaveStatus('saving');
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        saveDocumentContent(html);
      }, 1000);
    },
  });

  // Update editable mode if user role toggles
  useEffect(() => {
    if (editor) {
      editor.setEditable(canEdit);
    }
  }, [canEdit, editor]);

  // Initial metric calculation
  useEffect(() => {
    if (editor && !isMountedRef.current) {
      isMountedRef.current = true;
      const text = editor.getText();
      setWordCount(text.trim() ? text.trim().split(/\s+/).length : 0);
      setCharCount(text.length);
    }
  }, [editor]);

  // Handle keyboard shortcut for saving
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (editor && canEdit) {
          saveDocumentContent(editor.getHTML());
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editor, canEdit, saveDocumentContent]);

  const handleTitleChange = (newTitle: string) => {
    setDocument((prev) => ({ ...prev, title: newTitle }));
    if (editor) {
      saveDocumentContent(editor.getHTML(), newTitle);
    }
  };

  const handleDocumentUpdated = (updatedDoc: Document) => {
    setDocument(updatedDoc);
  };

  if (userRole === 'none') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
          <p className="text-sm text-gray-500 mt-2">
            You do not currently have permission to access <strong>&ldquo;{document.title}&rdquo;</strong> as{' '}
            {currentUser.name}.
          </p>
          <div className="mt-6 p-3.5 bg-gray-50 rounded-xl text-xs text-gray-600 text-left space-y-1">
            <div>
              <span className="font-semibold">Document Owner:</span> {document.ownerName} ({document.ownerEmail})
            </div>
            <div>
              <span className="font-semibold">Your Active Persona:</span> {currentUser.name} ({currentUser.email})
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-2">
            <p className="text-xs text-gray-400">
              💡 Tip: Use the top user switcher to switch to the owner ({document.ownerName}) or an authorized collaborator.
            </p>
            <div className="pt-2 flex justify-center">
              <UserSwitcher />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Top Header */}
      <DocumentHeader
        document={document}
        saveStatus={saveStatus}
        userRole={userRole}
        onTitleChange={handleTitleChange}
        onOpenShare={() => setIsShareModalOpen(true)}
        onOpenAttachments={() => setIsAttachmentsOpen(true)}
      />

      {/* Formatting Toolbar */}
      <EditorToolbar editor={editor} readOnly={!canEdit} />

      {/* Document Workspace Area */}
      <main className="flex-1 flex justify-center py-8 px-4 overflow-y-auto">
        <div className="w-full max-w-[850px]">
          {/* Printable Google Docs style Sheet Container */}
          <div className="bg-white rounded-lg shadow-[0_1px_3px_1px_rgba(60,64,67,.15)] border border-gray-200/80 min-h-[1050px] px-12 md:px-16 py-12 transition-shadow hover:shadow-[0_2px_6px_2px_rgba(60,64,67,.15)]">
            <EditorContent editor={editor} />
          </div>

          {/* Footer Statistics */}
          <div className="mt-4 pb-12 flex items-center justify-between text-xs text-gray-400 px-2">
            <div className="flex items-center gap-4">
              <span>{wordCount} words</span>
              <span>&bull;</span>
              <span>{charCount} characters</span>
            </div>
            <div>
              Last updated: {new Date(document.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </main>

      {/* Share Modal */}
      <ShareModal
        document={document}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onDocumentUpdated={handleDocumentUpdated}
        userRole={userRole}
      />

      {/* Attachments Drawer */}
      <AttachmentsDrawer
        document={document}
        isOpen={isAttachmentsOpen}
        onClose={() => setIsAttachmentsOpen(false)}
        onDocumentUpdated={handleDocumentUpdated}
        userRole={userRole}
      />
    </div>
  );
}

function Lock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
