import React from 'react';
import { notFound } from 'next/navigation';
import { documentStore, SEEDED_USERS } from '@/lib/db/store';
import { DocumentEditor } from '@/components/editor/DocumentEditor';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function DocumentPage({ params }: PageProps) {
  const { id } = params;
  const document = documentStore.getDocumentById(id);

  if (!document) {
    notFound();
  }

  // Initial user defaults to Alex (SEEDED_USERS[0])
  const initialUser = SEEDED_USERS[0];
  const initialRole = documentStore.checkPermission(document, initialUser.id);

  return (
    <DocumentEditor
      initialDocument={JSON.parse(JSON.stringify(document))}
      initialRole={initialRole}
    />
  );
}
