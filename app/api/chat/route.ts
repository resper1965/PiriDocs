import { NextResponse } from 'next/server';
import { adminDb, FieldValue } from '@/lib/firebase/admin';
import { ChatVertexAI } from '@langchain/google-vertexai';
import { VertexAIEmbeddings } from '@langchain/google-vertexai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { PIRI_PROMPT } from '@/lib/piri';

const embeddings = new VertexAIEmbeddings({ model: 'text-embedding-004' });
const model = new ChatVertexAI({ model: 'gemini-1.5-pro', temperature: 0.2 });

export async function POST(req: Request) {
  try {
    const { query, notebookId } = await req.json();

    const queryVector = await embeddings.embedQuery(query);

    const snapshot = await adminDb
      .collection('document_chunks')
      .where('notebook_id', '==', notebookId)
      .findNearest('embedding', FieldValue.vector(queryVector), {
        limit: 4,
        distanceMeasure: 'COSINE',
      })
      .get();

    const relevantDocs = snapshot.docs.map((doc) => doc.data());
    const context = relevantDocs.map((d) => d.content as string).join('\n\n');

    const prompt = PromptTemplate.fromTemplate(`
      ${PIRI_PROMPT}
      Contexto dos documentos:
      {context}
      Pergunta do usuário: {question}
      Resposta:
    `);

    const chain = RunnableSequence.from([prompt, model, new StringOutputParser()]);
    const response = await chain.invoke({ context, question: query });

    return NextResponse.json({
      response,
      sources: relevantDocs.map((d) => d.metadata),
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro no processamento da IA' }, { status: 500 });
  }
}
