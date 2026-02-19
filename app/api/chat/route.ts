import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { ChatVertexAI } from '@langchain/google-vertexai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { RunnableSequence } from '@langchain/core/runnables';
import { PIRI_PROMPT } from '@/lib/piri';

// Gemini Flash: 1M tokens de contexto, mais rápido e barato que o Pro
const model = new ChatVertexAI({ model: 'gemini-1.5-flash', temperature: 0.2 });

export async function POST(req: Request) {
  try {
    const { query, notebookId } = await req.json();

    // Carrega todas as páginas do notebook ordenadas por arquivo e página
    const snapshot = await adminDb
      .collection('document_pages')
      .where('notebook_id', '==', notebookId)
      .orderBy('filename')
      .orderBy('page_num')
      .get();

    if (snapshot.empty) {
      return NextResponse.json({
        response:
          'Nenhum documento foi adicionado a este notebook ainda. Faça upload de um PDF para começar.',
      });
    }

    // Monta contexto com marcadores de arquivo e página para citações exatas
    let currentFile = '';
    const parts: string[] = [];
    for (const doc of snapshot.docs) {
      const { filename, page_num, text } = doc.data() as {
        filename: string;
        page_num: number;
        text: string;
      };
      if (filename !== currentFile) {
        parts.push(`\n[Documento: ${filename}]`);
        currentFile = filename;
      }
      parts.push(`[Página ${page_num}]\n${text}`);
    }

    const context = parts.join('\n');

    const prompt = PromptTemplate.fromTemplate(`
      ${PIRI_PROMPT}
      Contexto dos documentos:
      {context}
      Pergunta do usuário: {question}
      Resposta:
    `);

    const chain = RunnableSequence.from([prompt, model, new StringOutputParser()]);
    const response = await chain.invoke({ context, question: query });

    return NextResponse.json({ response });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Erro no processamento da IA' }, { status: 500 });
  }
}
