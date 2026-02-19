import { NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebase/admin';
import { VertexAIEmbeddings } from '@langchain/google-vertexai';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { Document } from '@langchain/core/documents';
import pdfParse from 'pdf-parse';

const embeddings = new VertexAIEmbeddings({ model: 'text-embedding-004' });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const notebookId = formData.get('notebookId') as string;

    if (!file || !notebookId)
      return NextResponse.json({ error: 'Dados faltando' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfData = await pdfParse(buffer);

    const rawDoc = new Document({
      pageContent: pdfData.text,
      metadata: { source: file.name, notebook_id: notebookId },
    });

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await splitter.splitDocuments([rawDoc]);

    const texts = chunks.map((c) => c.pageContent);
    const vectors = await embeddings.embedDocuments(texts);

    const batch = adminDb.batch();
    chunks.forEach((chunk, i) => {
      const ref = adminDb.collection('document_chunks').doc();
      batch.set(ref, {
        content: chunk.pageContent,
        metadata: chunk.metadata,
        notebook_id: notebookId,
        embedding: FieldValue.vector(vectors[i]),
        created_at: new Date(),
      });
    });
    await batch.commit();

    return NextResponse.json({ success: true, chunks: chunks.length });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro no processamento' }, { status: 500 });
  }
}
