import { NextRequest, NextResponse } from 'next/server';
import { parseUploadedFile } from '@/lib/parser/fileParser';
import { documentStore, SEEDED_USERS } from '@/lib/db/store';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const userId = (formData.get('userId') as string) || SEEDED_USERS[0].id;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const filename = file.name;
    const mode = formData.get('mode') as string | null;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the file content according to its extension
    const parsed = await parseUploadedFile(filename, buffer);

    if (mode === 'parseOnly') {
      return NextResponse.json({
        content: parsed.content,
        title: parsed.title,
        parsedMeta: {
          originalName: filename,
          fileType: parsed.fileType,
          size: file.size,
        },
      });
    }

    // Create a new document in the store
    const document = documentStore.createDocument({
      title: parsed.title,
      content: parsed.content,
      ownerId: userId,
    });

    return NextResponse.json(
      {
        document,
        parsedMeta: {
          originalName: filename,
          fileType: parsed.fileType,
          size: file.size,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('File import error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to parse and import file' },
      { status: 500 }
    );
  }
}

