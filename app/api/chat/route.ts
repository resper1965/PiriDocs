import { NextResponse } from 'next/server';
import { OpenAI } from '@langchain/openai';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';
import { createClient } from '@supabase/supabase-js';
import { OpenAIEmbeddings } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { PIRI_PROMPT } from '@/lib/piri';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { query, notebookId } = await req.json();

    const vectorStore = await SupabaseVectorStore.fromExistingIndex(
      new OpenAIEmbeddings(),
      { client: supabaseAdmin, tableName: 'document_chunks' }
    );

    const relevantDocs = await vectorStore.similaritySearch(query, 4);
    const context = relevantDocs.map(d => d.pageContent).join('\n\n');

    const model = new OpenAI({ modelName: 'gpt-4o', temperature: 0.2 });
    const prompt = PromptTemplate.fromTemplate(`
      ${PIRI_PROMPT}
      Contexto dos documentos:
      {context}
      Pergunta do usuário: {question}
      Resposta:
    `);

    const chain = RunnableSequence.from([prompt, model, new StringOutputParser()]);
    const response = await chain.invoke({ context, question: query });

    return NextResponse.json({ response, sources: relevantDocs.map(d => d.metadata) });
  } catch (e) {
    return NextResponse.json({ error: 'Erro no processamento da IA' }, { status: 500 });
  }
}
