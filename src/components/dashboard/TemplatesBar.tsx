'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/lib/context/UserContext';
import { Plus, UploadCloud, Calendar, FileCode, CheckSquare, Sparkles } from 'lucide-react';

interface TemplatesBarProps {
  onOpenUpload: () => void;
}

const TEMPLATES = [
  {
    id: 'blank',
    title: 'Blank Document',
    subtitle: 'Start with a clean slate',
    icon: Plus,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    content: '<p></p>',
  },
  {
    id: 'meeting',
    title: 'Meeting Notes',
    subtitle: 'Attendees, agenda & action items',
    icon: Calendar,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    content: `<h1>Team Sync &amp; Meeting Notes</h1><p><strong>Date:</strong> ${new Date().toLocaleDateString()}<br><strong>Attendees:</strong> Alex Rivera, Sarah Chen, Marcus Vance</p><h2>1. Agenda Topics</h2><ul><li>Quarterly roadmap sync and feature priority review</li><li>Collaborative rich-text editor architecture</li><li>File import (.md, .docx) validation</li></ul><h2>2. Key Decisions</h2><p>Agreed to ship core TipTap formatting and granular role-based sharing model.</p><h2>3. Action Items</h2><ul data-type="taskList"><li data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Complete deployment testing on Vercel</p></div></li><li data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Record walkthrough demo video covering key flows</p></div></li></ul>`,
  },
  {
    id: 'rfc',
    title: 'Project Spec & RFC',
    subtitle: 'System architecture & tradeoffs',
    icon: FileCode,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    content: `<h1>RFC: Collaborative Document Service</h1><p><strong>Status:</strong> Proposed<br><strong>Owners:</strong> Engineering &amp; Product</p><h2>Problem Statement</h2><p>Provide a high-speed, intuitive workspace for distributed cross-functional collaboration.</p><h2>Core Requirements</h2><ol><li>WYSIWYG Rich-Text Editing with zero latency</li><li>Granular Role-based Access Control (Owner, Editor, Viewer)</li><li>Multi-format Ingestion (.md, .txt, .docx)</li></ol><h2>Tradeoff Analysis</h2><blockquote><p>Prioritizing rock-solid document editing, clean sharing permissions, and robust persistence over premature real-time WebSockets complexity.</p></blockquote>`,
  },
  {
    id: 'weekly',
    title: 'Weekly Team Update',
    subtitle: 'Progress, blockers & goals',
    icon: CheckSquare,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    content: `<h1>Weekly Engineering &amp; Product Update</h1><p><strong>Week Ending:</strong> Friday</p><h2>🚀 Highlights &amp; Ships</h2><ul><li>Shipped document sharing with granular role enforcement</li><li>Implemented multi-file parser engine</li></ul><h2>🚧 Blockers &amp; Dependencies</h2><p>None at this time. All core systems functioning cleanly.</p><h2>🎯 Priorities for Next Week</h2><ul><li>Add CRDT multiplayer sync with Yjs</li><li>Add export to PDF / Markdown</li></ul>`,
  },
];

export function TemplatesBar({ onOpenUpload }: TemplatesBarProps) {
  const router = useRouter();
  const { currentUser, showToast } = useUser();

  const handleCreateFromTemplate = async (template: (typeof TEMPLATES)[0]) => {
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: template.id === 'blank' ? 'Untitled Document' : template.title,
          content: template.content,
          ownerId: currentUser.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create document');

      showToast(`Created "${data.document.title}"`, 'success');
      router.push(`/document/${data.document.id}`);
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="bg-[#f1f3f4] border-b border-gray-200 py-6 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h2 className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Start a new document
            </h2>
          </div>
          <button
            onClick={onOpenUpload}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Import .md / .docx / .txt</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {/* Import File Button */}
          <button
            type="button"
            onClick={onOpenUpload}
            className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-indigo-200 bg-white hover:bg-indigo-50/50 hover:border-indigo-400 transition-all group text-center shadow-xs"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition-colors mb-2">
              <UploadCloud className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold text-gray-900 group-hover:text-indigo-600">
              Import File
            </span>
            <span className="text-[10px] text-gray-400 mt-0.5">.md, .txt, .docx</span>
          </button>

          {/* Templates */}
          {TEMPLATES.map((tmpl) => {
            const Icon = tmpl.icon;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleCreateFromTemplate(tmpl)}
                className="flex flex-col items-start p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-400 hover:shadow-md transition-all text-left group"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border mb-3 transition-colors ${tmpl.color}`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-1">
                  {tmpl.title}
                </span>
                <span className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">
                  {tmpl.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

