import React from 'react';
import { documentStore, SEEDED_USERS } from '@/lib/db/store';
import { DocumentEditor } from '@/components/editor/DocumentEditor';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function DocumentPage({ params }: PageProps) {
  const { id } = params;
  const document = documentStore.getDocumentById(id);

  // If not found in server memory (e.g. created offline or in client IndexedDB),
  // fallback to a document placeholder so DocumentEditor can hydrate from IndexedDB
  const doc = document || {
    id,
    title: 'Document',
    content: '<p></p>',
    plainTextPreview: '',
    ownerId: SEEDED_USERS[0].id,
    ownerName: SEEDED_USERS[0].name,
    ownerEmail: SEEDED_USERS[0].email,
    collaborators: [],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const initialRole = document
    ? documentStore.checkPermission(document, SEEDED_USERS[0].id)
    : 'owner';

  return (
    <DocumentEditor
      initialDocument={JSON.parse(JSON.stringify(doc))}
      initialRole={initialRole}
    />
  );
}

