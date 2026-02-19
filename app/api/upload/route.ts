import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import pdfParse from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const notebookId = formData.get('notebookId') as string;

    if (!file || !notebookId)
      return NextResponse.json({ error: 'Dados faltando' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());

    // Extrai texto página por página preservando numeração
    const pages: string[] = [];
    await pdfParse(buffer, {
      pagerender: (pageData: any) =>
        pageData.getTextContent().then((content: any) => {
          let lastY: number | undefined;
          let text = '';
          for (const item of content.items as any[]) {
            if (lastY === undefined || lastY === item.transform[5]) {
              text += item.str;
            } else {
              text += '\n' + item.str;
            }
            lastY = item.transform[5];
          }
          pages.push(text.trim());
          return text;
        }),
    });

    if (pages.length === 0) {
      const fallback = await pdfParse(buffer);
      pages.push(fallback.text.trim());
    }

    // Persiste cada página como documento individual no Firestore
    const batch = adminDb.batch();
    pages.forEach((text, i) => {
      if (!text) return; // ignora páginas em branco
      const ref = adminDb.collection('document_pages').doc();
      batch.set(ref, {
        notebook_id: notebookId,
        filename: file.name,
        page_num: i + 1,
        text,
        created_at: new Date(),
      });
    });
    await batch.commit();

    return NextResponse.json({ success: true, pages: pages.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro no processamento' }, { status: 500 });
  }
}
