import { NextResponse } from 'next/server';
import { getDbUser } from '@/lib/auth';

export async function GET() {
  try {
    const dbUser = await getDbUser();
    if (!dbUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json(dbUser);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('GET /api/users/me error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
