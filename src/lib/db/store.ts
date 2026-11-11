import fs from 'fs';
import path from 'path';
import { Document, User, Collaborator, Attachment, Role, DocumentFilter } from './types';

export const SEEDED_USERS: User[] = [
  {
    id: 'usr_alex',
    name: 'Alex Rivera',
    email: 'alex@ajaia.io',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    roleDescription: 'Product Lead',
  },
  {
    id: 'usr_sarah',
    name: 'Sarah Chen',
    email: 'sarah@ajaia.io',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    roleDescription: 'Engineering Lead',
  },
  {
    id: 'usr_marcus',
    name: 'Marcus Vance',
    email: 'marcus@ajaia.io',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    roleDescription: 'Design Lead',
  },
];

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'documents.json');

const INITIAL_DOCUMENTS: Document[] = [
  {
    id: 'doc_product_roadmap',
    title: 'Ajaia Product Roadmap & Vision 2027',
    ownerId: 'usr_alex',
    ownerName: 'Alex Rivera',
    ownerEmail: 'alex@ajaia.io',
    content: `<h1>Ajaia Product Roadmap &amp; Vision</h1><p>Welcome to the core product planning document for the <strong>Ajaia Collaborative Platform</strong>. This document outlines our major product milestones, design decisions, and upcoming launches.</p><h2>1. Executive Summary</h2><p>Our mission is to empower distributed teams to draft, iterate, and ship mission-critical ideas at lightning speed. We are building an <em>AI-native workspace</em> combining rich collaborative editing with proactive context retrieval.</p><h2>2. Key Pillars</h2><ul><li><strong>Instant Synchronous Editing:</strong> Zero perceptible lag and robust offline tolerance.</li><li><strong>Intelligent Context:</strong> Semantic file indexing for rich attachments and cross-document references.</li><li><strong>Seamless Team Collaboration:</strong> Transparent ownership and granular role-based sharing (Editor vs. Viewer).</li></ul><h2>3. Q1 Launch Checklist</h2><ul data-type="taskList"><li data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Complete rich-text TipTap WYSIWYG core integration</p></div></li><li data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Multi-format file upload (.md, .txt, .docx ingestion)</p></div></li><li data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Role-based document sharing (Viewer / Editor enforcement)</p></div></li><li data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Multiplayer cursor sync using WebSockets / CRDT</p></div></li></ul><blockquote><p><em>"Simplicity is the ultimate sophistication. Ship the focused core before spreading into complex periphery."</em></p></blockquote>`,
    plainTextPreview: 'Ajaia Product Roadmap & Vision. Welcome to the core product planning document...',
    collaborators: [
      {
        userId: 'usr_sarah',
        email: 'sarah@ajaia.io',
        name: 'Sarah Chen',
        role: 'editor',
        addedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        userId: 'usr_marcus',
        email: 'marcus@ajaia.io',
        name: 'Marcus Vance',
        role: 'viewer',
        addedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    attachments: [
      {
        id: 'att_roadmap_spec',
        filename: 'roadmap_milestones.txt',
        originalName: 'roadmap_milestones.txt',
        size: 1420,
        mimeType: 'text/plain',
        uploadedBy: 'usr_alex',
        uploadedByName: 'Alex Rivera',
        uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    lastEditedBy: {
      userId: 'usr_sarah',
      name: 'Sarah Chen',
    },
  },
  {
    id: 'doc_arch_rfc',
    title: 'RFC 042: High Performance Document Storage & Sync',
    ownerId: 'usr_sarah',
    ownerName: 'Sarah Chen',
    ownerEmail: 'sarah@ajaia.io',
    content: `<h1>RFC 042: High Performance Document Storage &amp; Sync</h1><p><strong>Author:</strong> Sarah Chen, Principal Architect<br><strong>Status:</strong> Approved for Implementation</p><h2>1. Problem Statement</h2><p>Traditional document editors face challenges when balancing quick local responsiveness with server persistence. When multiple team members work on a document, latency and conflict resolution must be handled gracefully.</p><h2>2. Architectural Decisions</h2><ol><li><strong>Structured Content Storage:</strong> We preserve rich text formatted as clean HTML/JSON nodes, enabling fast roundtrips and standard web accessibility.</li><li><strong>Role-Based Access Boundaries:</strong> Permissions are strictly verified at both API endpoints and client controls. Viewers are blocked from mutation payloads.</li><li><strong>Pluggable Storage Layer:</strong> A decoupled file-backed repository pattern that seamlessly upgrades to Postgres or Neon in production.</li></ol><pre><code>// Pseudocode: Permission Check
function canEdit(doc, user) {
  if (doc.ownerId === user.id) return true;
  return doc.collaborators.some(c =&gt; c.userId === user.id &amp;&amp; c.role === 'editor');
}</code></pre>`,
    plainTextPreview: 'RFC 042: High Performance Document Storage & Sync. Author: Sarah Chen...',
    collaborators: [
      {
        userId: 'usr_alex',
        email: 'alex@ajaia.io',
        name: 'Alex Rivera',
        role: 'editor',
        addedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ],
    attachments: [],
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
    lastEditedBy: {
      userId: 'usr_sarah',
      name: 'Sarah Chen',
    },
  },
  {
    id: 'doc_design_system',
    title: 'Ajaia Design System & Typography Guidelines',
    ownerId: 'usr_marcus',
    ownerName: 'Marcus Vance',
    ownerEmail: 'marcus@ajaia.io',
    content: `<h1>Ajaia Design System &amp; Typography</h1><p>Guidelines for building clean, usable productivity interfaces at Ajaia.</p><h2>Visual Hierarchy</h2><p>The document editor must prioritize clarity and minimize chrome clutter. The page should feel like high-grade stationery with smooth typography.</p><ul><li><strong>Font Family:</strong> Clean sans-serif with readable monospace for code</li><li><strong>Document Margins:</strong> 64px desktop padding resembling physical paper sheets</li><li><strong>Status Signals:</strong> Subtle save pill with clear feedback: <em>Saved, Saving, Error</em></li></ul>`,
    plainTextPreview: 'Ajaia Design System & Typography. Guidelines for building clean...',
    collaborators: [
      {
        userId: 'usr_alex',
        email: 'alex@ajaia.io',
        name: 'Alex Rivera',
        role: 'viewer',
        addedAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        userId: 'usr_sarah',
        email: 'sarah@ajaia.io',
        name: 'Sarah Chen',
        role: 'viewer',
        addedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    attachments: [],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 14400000).toISOString(),
    lastEditedBy: {
      userId: 'usr_marcus',
      name: 'Marcus Vance',
    },
  },
];

class DocumentStore {
  private documents: Map<string, Document> = new Map();
  private initialized: boolean = false;

  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      try {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      } catch (e) {
        console.error('Failed to create data directory', e);
      }
    }
  }

  private load(): void {
    if (this.initialized) return;

    this.ensureDataDir();

    if (fs.existsSync(DATA_FILE)) {
      try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed: Document[] = JSON.parse(raw);
        this.documents.clear();
        for (const doc of parsed) {
          this.documents.set(doc.id, doc);
        }
        this.initialized = true;
        return;
      } catch (err) {
        console.warn('Failed to parse existing data file, reseeding initial documents', err);
      }
    }

    // Initialize with seeded docs
    this.documents.clear();
    for (const doc of INITIAL_DOCUMENTS) {
      this.documents.set(doc.id, doc);
    }
    this.save();
    this.initialized = true;
  }

  private save(): void {
    try {
      this.ensureDataDir();
      const docsArray = Array.from(this.documents.values());
      fs.writeFileSync(DATA_FILE, JSON.stringify(docsArray, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving documents to disk:', err);
    }
  }

  public getUsers(): User[] {
    return SEEDED_USERS;
  }

  public getUserById(id: string): User | undefined {
    return SEEDED_USERS.find((u) => u.id === id);
  }

  public getUserByEmail(email: string): User | undefined {
    return SEEDED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  public getDocuments(userId: string, filter: DocumentFilter = 'all'): Document[] {
    this.load();
    const all = Array.from(this.documents.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return all.filter((doc) => {
      const isOwner = doc.ownerId === userId;
      const isCollaborator = doc.collaborators.some((c) => c.userId === userId);

      if (filter === 'owned') return isOwner;
      if (filter === 'shared') return isCollaborator && !isOwner;
      return isOwner || isCollaborator;
    });
  }

  public getDocumentById(id: string): Document | undefined {
    this.load();
    return this.documents.get(id);
  }

  public checkPermission(doc: Document, userId: string): Role | 'none' {
    if (doc.ownerId === userId) return 'owner';
    const coll = doc.collaborators.find((c) => c.userId === userId);
    if (coll) return coll.role;
    return 'none';
  }

  public createDocument(params: {
    title?: string;
    content?: string;
    ownerId: string;
    attachments?: Attachment[];
  }): Document {
    this.load();
    const owner = this.getUserById(params.ownerId) || SEEDED_USERS[0];
    const id = 'doc_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
    const now = new Date().toISOString();

    const newDoc: Document = {
      id,
      title: params.title?.trim() || 'Untitled Document',
      content: params.content || '<p></p>',
      plainTextPreview: (params.content || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 140),
      ownerId: owner.id,
      ownerName: owner.name,
      ownerEmail: owner.email,
      collaborators: [],
      attachments: params.attachments || [],
      createdAt: now,
      updatedAt: now,
      lastEditedBy: {
        userId: owner.id,
        name: owner.name,
      },
    };

    this.documents.set(id, newDoc);
    this.save();
    return newDoc;
  }

  public updateDocument(
    id: string,
    updates: {
      title?: string;
      content?: string;
      userId: string;
    }
  ): { doc?: Document; error?: string } {
    this.load();
    const doc = this.documents.get(id);
    if (!doc) return { error: 'Document not found' };

    const permission = this.checkPermission(doc, updates.userId);
    if (permission !== 'owner' && permission !== 'editor') {
      return { error: 'Unauthorized: Read-only access or not shared' };
    }

    const editor = this.getUserById(updates.userId) || { name: 'User', id: updates.userId };
    const now = new Date().toISOString();

    if (updates.title !== undefined) {
      doc.title = updates.title.trim() || 'Untitled Document';
    }

    if (updates.content !== undefined) {
      doc.content = updates.content;
      doc.plainTextPreview = updates.content
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 140);
    }

    doc.updatedAt = now;
    doc.lastEditedBy = {
      userId: editor.id,
      name: editor.name,
    };

    this.documents.set(id, doc);
    this.save();
    return { doc };
  }

  public deleteDocument(id: string, userId: string): { success: boolean; error?: string } {
    this.load();
    const doc = this.documents.get(id);
    if (!doc) return { success: false, error: 'Document not found' };

    if (doc.ownerId !== userId) {
      return { success: false, error: 'Only the document owner can delete this document' };
    }

    this.documents.delete(id);
    this.save();
    return { success: true };
  }

  public shareDocument(
    id: string,
    params: {
      userId: string; // The user initiating the share
      targetEmail: string;
      role: 'editor' | 'viewer';
    }
  ): { doc?: Document; error?: string } {
    this.load();
    const doc = this.documents.get(id);
    if (!doc) return { error: 'Document not found' };

    const initiatorPerm = this.checkPermission(doc, params.userId);
    if (initiatorPerm !== 'owner' && initiatorPerm !== 'editor') {
      return { error: 'Unauthorized: Only owners and editors can share this document' };
    }

    const email = params.targetEmail.toLowerCase().trim();
    if (email === doc.ownerEmail.toLowerCase()) {
      return { error: 'Target user is already the owner' };
    }

    const targetUser = this.getUserByEmail(email);
    const targetUserId = targetUser ? targetUser.id : 'usr_ext_' + Math.random().toString(36).substring(2, 7);
    const targetName = targetUser ? targetUser.name : email.split('@')[0];

    // Remove existing collaborator entry if present
    const existingIndex = doc.collaborators.findIndex((c) => c.email.toLowerCase() === email);
    if (existingIndex >= 0) {
      doc.collaborators[existingIndex].role = params.role;
    } else {
      doc.collaborators.push({
        userId: targetUserId,
        email,
        name: targetName,
        role: params.role,
        addedAt: new Date().toISOString(),
      });
    }

    doc.updatedAt = new Date().toISOString();
    this.documents.set(id, doc);
    this.save();
    return { doc };
  }

  public removeCollaborator(
    id: string,
    params: {
      userId: string; // Owner or self
      targetUserId: string;
    }
  ): { doc?: Document; error?: string } {
    this.load();
    const doc = this.documents.get(id);
    if (!doc) return { error: 'Document not found' };

    if (doc.ownerId !== params.userId && params.userId !== params.targetUserId) {
      return { error: 'Unauthorized: Only owner can remove collaborators' };
    }

    doc.collaborators = doc.collaborators.filter((c) => c.userId !== params.targetUserId);
    doc.updatedAt = new Date().toISOString();
    this.documents.set(id, doc);
    this.save();
    return { doc };
  }

  public addAttachment(id: string, attachment: Attachment): { doc?: Document; error?: string } {
    this.load();
    const doc = this.documents.get(id);
    if (!doc) return { error: 'Document not found' };

    doc.attachments = doc.attachments || [];
    doc.attachments.push(attachment);
    doc.updatedAt = new Date().toISOString();
    this.documents.set(id, doc);
    this.save();
    return { doc };
  }

  public removeAttachment(id: string, attachmentId: string, userId: string): { doc?: Document; error?: string } {
    this.load();
    const doc = this.documents.get(id);
    if (!doc) return { error: 'Document not found' };

    const permission = this.checkPermission(doc, userId);
    if (permission !== 'owner' && permission !== 'editor') {
      return { error: 'Unauthorized: Read-only access' };
    }

    doc.attachments = (doc.attachments || []).filter((a) => a.id !== attachmentId);
    doc.updatedAt = new Date().toISOString();
    this.documents.set(id, doc);
    this.save();
    return { doc };
  }
}

export const documentStore = new DocumentStore();

