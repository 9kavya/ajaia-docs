export type Role = 'owner' | 'editor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  roleDescription: string;
}

export interface Collaborator {
  userId: string;
  email: string;
  name: string;
  role: 'editor' | 'viewer';
  addedAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedBy: string;
  uploadedByName: string;
  uploadedAt: string;
  dataUrl?: string; // base64 or stored URL
}

export interface Document {
  id: string;
  title: string;
  content: string; // HTML string for TipTap
  plainTextPreview?: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  collaborators: Collaborator[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  lastEditedBy: {
    userId: string;
    name: string;
  };
}

export type DocumentFilter = 'all' | 'owned' | 'shared';

