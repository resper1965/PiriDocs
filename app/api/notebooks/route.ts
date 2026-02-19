import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

async function getUserId(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get('firebase-token')?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const uid = await getUserId(req);
  if (!uid) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const snapshot = await adminDb
    .collection('notebooks')
    .where('user_id', '==', uid)
    .orderBy('created_at', 'desc')
    .get();

  const notebooks = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    created_at: doc.data().created_at?.toDate().toISOString(),
  }));

  return NextResponse.json({ notebooks });
}

export async function POST(req: NextRequest) {
  const uid = await getUserId(req);
  if (!uid) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const { title } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 });

  const ref = await adminDb.collection('notebooks').add({
    title: title.trim(),
    user_id: uid,
    created_at: new Date(),
  });

  return NextResponse.json({ id: ref.id });
}
