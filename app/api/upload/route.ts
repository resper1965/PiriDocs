import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const notebookId = formData.get('notebookId') as string;

    if (!file || !notebookId) return NextResponse.json({ error: 'Dados faltando' }, { status: 400 });

    const loader = new PDFLoader(file);
    const docs = await loader.load();

    docs.forEach(doc => { doc.metadata.notebook_id = notebookId; });

    const splitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000, chunkOverlap: 200 });
    const splitDocs = await splitter.splitDocuments(docs);

    await SupabaseVectorStore.fromDocuments(
      splitDocs,
      new OpenAIEmbeddings(),
      { client: supabaseAdmin, tableName: 'document_chunks' }
    );

    return NextResponse.json({ success: true, chunks: splitDocs.length });
  } catch (e) {
    return NextResponse.json({ error: 'Erro no processamento' }, { status: 500 });
  }
}
