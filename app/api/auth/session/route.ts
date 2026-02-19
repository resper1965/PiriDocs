import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();
  try {
    await adminAuth.verifyIdToken(idToken);
    const response = NextResponse.json({ success: true });
    response.cookies.set('firebase-token', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 24 horas
      path: '/',
    });
    return response;
  } catch {
    return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('firebase-token');
  return response;
}
