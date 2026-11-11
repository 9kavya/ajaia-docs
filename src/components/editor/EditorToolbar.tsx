'use client';

import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Minus,
  Undo2,
  Redo2,
  RemoveFormatting,
  FileUp,
  Loader2,
} from 'lucide-react';
import { useUser } from '@/lib/context/UserContext';

interface EditorToolbarProps {
  editor: Editor | null;
  readOnly?: boolean;
}

export function EditorToolbar({ editor, readOnly = false }: EditorToolbarProps) {
  const { showToast } = useUser();
  const [isImporting, setIsImporting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    setIsImporting(true);
    try {
      let content = '';
      let serverSuccess = false;

      // 1. Attempt server-side parse
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('mode', 'parseOnly');

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json();
          if (res.ok && data.content) {
            content = data.content;
            serverSuccess = true;
          }
        }
      } catch (serverErr) {
        console.warn('Server parse failed, falling back to client parse:', serverErr);
      }

      // 2. Client-side fallback if server returned error or non-JSON
      if (!serverSuccess || !content) {
        const text = await file.text();
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'md' || ext === 'markdown') {
          // Simple client markdown parser
          content = text
            .split(/\r?\n/)
            .map((line) => {
              if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`;
              if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`;
              if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`;
              if (line.startsWith('- ')) return `<li>${line.slice(2)}</li>`;
              if (!line.trim()) return '<p></p>';
              return `<p>${line}</p>`;
            })
            .join('');
        } else {
          content = text
            .split(/\r?\n/)
            .map((line) => `<p>${line || '<br>'}</p>`)
            .join('');
        }
      }

      if (content) {
        editor.chain().focus().insertContent(content).run();
        showToast(`Imported content from "${file.name}" into document`, 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to import file', 'error');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (readOnly) {
    return (
      <div className="bg-amber-50/60 border-b border-amber-200/50 px-6 py-2 flex items-center justify-between text-xs text-amber-800">
        <span className="font-medium">
          🔒 You are viewing this document in <strong>View-Only mode</strong>. Editing tools are disabled.
        </span>
        <span className="text-[11px] text-amber-600 bg-amber-100/70 px-2 py-0.5 rounded font-mono">
          READ_ONLY
        </span>
      </div>
    );
  }

  const currentHeading = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    return 'p';
  };

  const handleHeadingChange = (value: string) => {
    if (value === 'p') {
      editor.chain().focus().setParagraph().run();
    } else if (value === 'h1') {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
    } else if (value === 'h2') {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    } else if (value === 'h3') {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-1.5 flex items-center flex-wrap gap-1 sticky top-[57px] z-20 shadow-xs">
      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5 pr-1.5 border-r border-gray-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent text-gray-700 transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent text-gray-700 transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      {/* Headings dropdown */}
      <div className="px-1.5 border-r border-gray-200">
        <select
          value={currentHeading()}
          onChange={(e) => handleHeadingChange(e.target.value)}
          className="text-xs font-medium py-1 px-2 rounded-md bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
        >
          <option value="p">Normal text</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
        </select>
      </div>

      {/* Basic Formatting: Bold, Italic, Underline, Strike */}
      <div className="flex items-center gap-0.5 px-1.5 border-r border-gray-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('bold')
              ? 'bg-blue-100 text-blue-700 font-bold'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('italic')
              ? 'bg-blue-100 text-blue-700 font-bold'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('underline')
              ? 'bg-blue-100 text-blue-700 font-bold'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('strike')
              ? 'bg-blue-100 text-blue-700 font-bold'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('highlight')
              ? 'bg-amber-100 text-amber-800'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Highlight"
        >
          <Highlighter className="w-4 h-4" />
        </button>
      </div>

      {/* Alignment */}
      <div className="flex items-center gap-0.5 px-1.5 border-r border-gray-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive({ textAlign: 'left' })
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive({ textAlign: 'center' })
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive({ textAlign: 'right' })
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive({ textAlign: 'justify' })
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Justify"
        >
          <AlignJustify className="w-4 h-4" />
        </button>
      </div>

      {/* Lists & Blocks */}
      <div className="flex items-center gap-0.5 px-1.5 border-r border-gray-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('bulletList')
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Bulleted list"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('orderedList')
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Numbered list"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('taskList')
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Task checklist"
        >
          <CheckSquare className="w-4 h-4" />
        </button>
      </div>

      {/* Quotes, Code & Divider */}
      <div className="flex items-center gap-0.5 px-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('blockquote')
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Quote Block"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-1.5 rounded transition-colors ${
            editor.isActive('codeBlock')
              ? 'bg-blue-100 text-blue-700'
              : 'hover:bg-gray-100 text-gray-700'
          }`}
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-700 transition-colors"
          title="Horizontal Line"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
          title="Clear Formatting"
        >
          <RemoveFormatting className="w-4 h-4" />
        </button>

        <div className="h-4 w-[1px] bg-gray-200 mx-1" />

        {/* Import file directly into cursor */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImportFile}
          accept=".md,.markdown,.txt,.docx"
          className="hidden"
        />
        <button
          type="button"
          disabled={isImporting}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors disabled:opacity-50"
          title="Import content from .md, .txt, or .docx file directly into this draft"
        >
          {isImporting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <FileUp className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">Import into draft</span>
        </button>
      </div>
    </div>
  );
}

