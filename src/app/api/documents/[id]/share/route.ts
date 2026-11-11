import { NextRequest, NextResponse } from 'next/server';
import { documentStore } from '@/lib/db/store';

interface Params {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = params;
  try {
    const body = await request.json();
    const { userId, targetEmail, role } = body;

    if (!userId || !targetEmail || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, targetEmail, role' },
        { status: 400 }
      );
    }

    if (role !== 'editor' && role !== 'viewer') {
      return NextResponse.json(
        { error: 'Invalid role. Must be "editor" or "viewer"' },
        { status: 400 }
      );
    }

    const result = documentStore.shareDocument(id, {
      userId,
      targetEmail,
      role,
    });

    if (result.error) {
      const status = result.error.includes('Unauthorized') ? 403 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({ document: result.doc });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process share request' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = params;
  try {
    const body = await request.json();
    const { userId, targetUserId } = body;

    if (!userId || !targetUserId) {
      return NextResponse.json(
        { error: 'Missing userId or targetUserId' },
        { status: 400 }
      );
    }

    const result = documentStore.removeCollaborator(id, {
      userId,
      targetUserId,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({ document: result.doc });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove collaborator' }, { status: 500 });
  }
}
