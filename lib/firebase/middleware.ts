import { adminAuth } from './admin';
import { NextRequest } from 'next/server';

export async function verifySession(request: NextRequest) {
  const token = request.cookies.get('firebase-token')?.value;
  if (!token) return null;

  try {
    return await adminAuth.verifyIdToken(token);
  } catch {
    return null;
  }
}
