import { NextRequest, NextResponse } from 'next/server';
import { documentStore, SEEDED_USERS } from '@/lib/db/store';
import { DocumentFilter } from '@/lib/db/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId') || SEEDED_USERS[0].id;
  const filter = (searchParams.get('filter') as DocumentFilter) || 'all';

  const documents = documentStore.getDocuments(userId, filter);
  return NextResponse.json({ documents });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, ownerId } = body;

    const currentUserId = ownerId || SEEDED_USERS[0].id;
    const document = documentStore.createDocument({
      title,
      content,
      ownerId: currentUserId,
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid document creation payload' },
      { status: 400 }
    );
  }
}

