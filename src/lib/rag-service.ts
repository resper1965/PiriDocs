/**
 * RAG Service - Retrieval Augmented Generation
 * 
 * Gerencia embeddings e busca semântica para:
 * - KnowledgeBase: Base de conhecimento do setor (compartilhada)
 * - ClientDocument: Documentos de clientes (isolados)
 */

import { db } from "@/lib/db";
import ZAI from "z-ai-web-dev-sdk";

// Tipos
export type SourceType = "knowledge_base" | "client_document";

export interface RAGSource {
  type: SourceType;
  documentId: string;
  documentName: string;
  chunkIndex: number;
  chunkText: string;
  score: number;
}

export interface RAGContext {
  sources: RAGSource[];
  context: string;
}

// Configuração
const CHUNK_SIZE = 1000; // caracteres por chunk
const CHUNK_OVERLAP = 200; // sobreposição entre chunks
const MAX_SOURCES = 5; // máximo de fontes para contexto

/**
 * Divide texto em chunks para embedding
 */
function splitIntoChunks(text: string): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < text.length) {
    const end = Math.min(start + CHUNK_SIZE, text.length);
    let chunk = text.slice(start, end);
    
    // Tenta terminar em um limite de sentença
    if (end < text.length) {
      const lastPeriod = chunk.lastIndexOf(".");
      const lastNewline = chunk.lastIndexOf("\n");
      const breakPoint = Math.max(lastPeriod, lastNewline);
      
      if (breakPoint > start + CHUNK_SIZE / 2) {
        chunk = text.slice(start, breakPoint + 1);
        start = breakPoint + 1;
      } else {
        start = end - CHUNK_OVERLAP;
      }
    } else {
      start = end;
    }
    
    if (chunk.trim()) {
      chunks.push(chunk.trim());
    }
  }
  
  return chunks;
}

/**
 * Gera embedding para um texto usando z-ai
 * Nota: z-ai-web-dev-sdk não tem endpoint de embeddings direto,
 * então usamos uma simulação baseada em hash para desenvolvimento
 */
async function generateEmbedding(text: string): Promise<number[]> {
  // Para produção, usar OpenAI embeddings ou similar
  // Por ora, retornamos um embedding simulado baseado no hash do texto
  
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  // Simula um embedding de 1536 dimensões (mesmo tamanho do ada-002)
  const embedding: number[] = [];
  let hash = 0;
  
  for (let i = 0; i < data.length; i++) {
    hash = ((hash << 5) - hash) + data[i];
    hash = hash & hash;
  }
  
  for (let i = 0; i < 1536; i++) {
    // Gera valores pseudo-aleatórios mas determinísticos
    const value = Math.sin(hash + i) * 0.5;
    embedding.push(value);
  }
  
  return embedding;
}

/**
 * Calcula similaridade de cosseno entre dois vetores
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Processa documento da Base de Conhecimento e gera embeddings
 */
export async function processKnowledgeBaseDocument(documentId: string): Promise<void> {
  const doc = await db.knowledgeBase.findUnique({
    where: { id: documentId },
  });
  
  if (!doc || !doc.content) return;
  
  // Remove embeddings antigos
  await db.kBEmbedding.deleteMany({
    where: { documentId },
  });
  
  // Divide em chunks
  const chunks = splitIntoChunks(doc.content);
  
  // Gera embeddings para cada chunk
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i]);
    
    await db.kBEmbedding.create({
      data: {
        documentId,
        chunkIndex: i,
        chunkText: chunks[i],
        embedding: JSON.stringify(embedding),
      },
    });
  }
  
  console.log(`Processed KB document ${doc.name}: ${chunks.length} chunks`);
}

/**
 * Processa documento de cliente e gera embeddings
 */
export async function processClientDocument(documentId: string): Promise<void> {
  const doc = await db.clientDocument.findUnique({
    where: { id: documentId },
  });
  
  if (!doc || !doc.content) return;
  
  // Remove embeddings antigos
  await db.clientEmbedding.deleteMany({
    where: { documentId },
  });
  
  // Divide em chunks
  const chunks = splitIntoChunks(doc.content);
  
  // Gera embeddings para cada chunk
  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i]);
    
    await db.clientEmbedding.create({
      data: {
        documentId,
        chunkIndex: i,
        chunkText: chunks[i],
        embedding: JSON.stringify(embedding),
      },
    });
  }
  
  console.log(`Processed client document ${doc.name}: ${chunks.length} chunks`);
}

/**
 * Busca contexto relevante na Base de Conhecimento (compartilhada)
 */
export async function searchKnowledgeBase(
  query: string,
  limit: number = MAX_SOURCES
): Promise<RAGSource[]> {
  const queryEmbedding = await generateEmbedding(query);
  
  const embeddings = await db.kBEmbedding.findMany({
    include: {
      document: true,
    },
  });
  
  const results: RAGSource[] = [];
  
  for (const emb of embeddings) {
    const storedEmbedding = JSON.parse(emb.embedding) as number[];
    const score = cosineSimilarity(queryEmbedding, storedEmbedding);
    
    results.push({
      type: "knowledge_base",
      documentId: emb.documentId,
      documentName: emb.document.name,
      chunkIndex: emb.chunkIndex,
      chunkText: emb.chunkText,
      score,
    });
  }
  
  // Ordena por similaridade e retorna os melhores
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Busca contexto relevante em documentos de um cliente específico
 */
export async function searchClientDocuments(
  query: string,
  clientId: string,
  limit: number = MAX_SOURCES
): Promise<RAGSource[]> {
  const queryEmbedding = await generateEmbedding(query);
  
  // Busca embeddings apenas dos documentos deste cliente
  const embeddings = await db.clientEmbedding.findMany({
    include: {
      document: {
        include: {
          client: true,
        },
      },
    },
    where: {
      document: {
        clientId,
      },
    },
  });
  
  const results: RAGSource[] = [];
  
  for (const emb of embeddings) {
    const storedEmbedding = JSON.parse(emb.embedding) as number[];
    const score = cosineSimilarity(queryEmbedding, storedEmbedding);
    
    results.push({
      type: "client_document",
      documentId: emb.documentId,
      documentName: emb.document.name,
      chunkIndex: emb.chunkIndex,
      chunkText: emb.chunkText,
      score,
    });
  }
  
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Busca contexto completo (Base de Conhecimento + Documentos do Cliente)
 */
export async function searchFullContext(
  query: string,
  clientId?: string
): Promise<RAGContext> {
  const sources: RAGSource[] = [];
  
  // Sempre busca na Base de Conhecimento (compartilhada)
  const kbResults = await searchKnowledgeBase(query, 3);
  sources.push(...kbResults);
  
  // Se tem cliente, busca nos documentos dele (isolado)
  if (clientId) {
    const clientResults = await searchClientDocuments(query, clientId, 2);
    sources.push(...clientResults);
  }
  
  // Ordena todos por score
  sources.sort((a, b) => b.score - a.score);
  
  // Monta contexto para o LLM
  const contextParts: string[] = [];
  
  for (const source of sources.slice(0, MAX_SOURCES)) {
    const typeLabel = source.type === "knowledge_base" 
      ? "[Base de Conhecimento]" 
      : "[Documento do Cliente]";
    
    contextParts.push(
      `${typeLabel} ${source.documentName}:\n${source.chunkText}`
    );
  }
  
  return {
    sources: sources.slice(0, MAX_SOURCES),
    context: contextParts.join("\n\n---\n\n"),
  };
}

/**
 * Formata fontes para exibição
 */
export function formatSourcesForDisplay(sources: RAGSource[]): string[] {
  return sources.map((s) => {
    const type = s.type === "knowledge_base" ? "KB" : "Cliente";
    return `${type}: ${s.documentName}`;
  });
}
