import { NextRequest, NextResponse } from 'next/server';
import { documentStore, SEEDED_USERS } from '@/lib/db/store';

export const dynamic = 'force-dynamic';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || SEEDED_USERS[0].id;

  const document = documentStore.getDocumentById(id);
  if (!document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const permission = documentStore.checkPermission(document, userId);
  if (permission === 'none') {
    return NextResponse.json(
      {
        error: 'Access denied: You do not have permission to view this document',
        permission: 'none',
        documentId: id,
        ownerName: document.ownerName,
        ownerEmail: document.ownerEmail,
      },
      { status: 403 }
    );
  }

  return NextResponse.json({ document, permission });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = params;
  try {
    const body = await request.json();
    const { title, content, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
    }

    const result = documentStore.updateDocument(id, {
      title,
      content,
      userId,
    });

    if (result.error) {
      const status = result.error.includes('Unauthorized') ? 403 : 404;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ document: result.doc });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || '';

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const result = documentStore.deleteDocument(id, userId);
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return NextResponse.json({ success: true });
}

