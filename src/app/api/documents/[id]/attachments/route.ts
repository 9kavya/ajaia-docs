import { NextRequest, NextResponse } from 'next/server';
import { documentStore } from '@/lib/db/store';
import { Attachment } from '@/lib/db/types';

interface Params {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: Params) {
  const { id } = params;
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = (formData.get('userId') as string) || '';

    if (!file || !userId) {
      return NextResponse.json({ error: 'File and userId are required' }, { status: 400 });
    }

    const doc = documentStore.getDocumentById(id);
    if (!doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const permission = documentStore.checkPermission(doc, userId);
    if (permission !== 'owner' && permission !== 'editor') {
      return NextResponse.json({ error: 'Unauthorized: Viewers cannot upload attachments' }, { status: 403 });
    }

    const user = documentStore.getUserById(userId);
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${file.type || 'application/octet-stream'};base64,${base64Data}`;

    const attachment: Attachment = {
      id: 'att_' + Math.random().toString(36).substring(2, 9),
      filename: file.name,
      originalName: file.name,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      uploadedBy: userId,
      uploadedByName: user ? user.name : 'Unknown',
      uploadedAt: new Date().toISOString(),
      dataUrl,
    };

    const result = documentStore.addAttachment(id, attachment);
    return NextResponse.json({ document: result.doc, attachment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to upload attachment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = params;
  try {
    const body = await request.json();
    const { attachmentId, userId } = body;

    if (!attachmentId || !userId) {
      return NextResponse.json({ error: 'Missing attachmentId or userId' }, { status: 400 });
    }

    const result = documentStore.removeAttachment(id, attachmentId, userId);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }

    return NextResponse.json({ document: result.doc });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete attachment' }, { status: 500 });
  }
}
