import { NextResponse } from 'next/server';
import { documentStore } from '@/lib/db/store';

export async function GET() {
  const users = documentStore.getUsers();
  return NextResponse.json({ users });
}

