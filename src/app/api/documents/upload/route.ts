import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import ZAI from "z-ai-web-dev-sdk";

// Document type detection
function detectDocumentType(filename: string): string {
  const lower = filename.toLowerCase();
  if (lower.includes("contrato") || lower.includes("contract")) return "contract";
  if (lower.includes("apolice") || lower.includes("policy") || lower.includes("apólice")) return "policy";
  if (lower.includes("regulamento") || lower.includes("regulation") || lower.includes("rn") || lower.includes("ri")) return "regulation";
  if (lower.includes("relatorio") || lower.includes("report") || lower.includes("relatório")) return "report";
  return "other";
}

// Category detection based on content/filename
function detectCategory(filename: string): string {
  const upper = filename.toUpperCase();
  if (upper.includes("RN") || upper.includes("RESOLUÇÃO NORMATIVA")) return "ANS-RN";
  if (upper.includes("RI") || upper.includes("RESOLUÇÃO INSTITUCIONAL")) return "ANS-RI";
  if (upper.includes("DO-") || upper.includes("DIRETRIZ")) return "ANS-DO";
  if (upper.includes("ANS")) return "ANS";
  if (upper.includes("SUSEP")) return "SUSEP";
  if (upper.includes("CONTRATO")) return "Contratual";
  return "Outros";
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const processedDocuments: Array<{
      name: string;
      type: string;
      category: string;
      size: number;
      content?: string;
    }> = [];

    // Initialize ZAI for document processing
    const zai = await ZAI.create();

    for (const file of files) {
      if (!file.name) continue;

      // Save file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(uploadDir, `${Date.now()}-${file.name}`);
      await writeFile(filePath, buffer);

      // Extract text content using VLM for PDFs and documents
      let extractedContent = "";
      try {
        const fileBuffer = Buffer.from(bytes);
        const base64 = fileBuffer.toString("base64");
        const mimeType = file.type || "application/octet-stream";

        // Use VLM to extract text from documents
        const visionResponse = await zai.chat.completions.createVision({
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Extraia todo o texto deste documento. Mantenha a estrutura e formatação original o máximo possível. Liste o conteúdo completo.",
                },
                {
                  type: "file_url",
                  file_url: {
                    url: `data:${mimeType};base64,${base64}`,
                  },
                },
              ],
            },
          ],
          thinking: { type: "disabled" },
        });

        extractedContent = visionResponse.choices[0]?.message?.content || "";
      } catch (extractError) {
        console.log("Text extraction skipped for:", file.name);
      }

      const docType = detectDocumentType(file.name);
      const category = detectCategory(file.name);

      processedDocuments.push({
        name: file.name,
        type: docType,
        category: category,
        size: file.size,
        content: extractedContent,
      });
    }

    return NextResponse.json({
      success: true,
      documents: processedDocuments,
      message: `${processedDocuments.length} documento(s) processado(s) com sucesso`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro no upload",
      },
      { status: 500 }
    );
  }
}

// GET - List documents
export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), "uploads");
    
    if (!existsSync(uploadDir)) {
      return NextResponse.json({ success: true, documents: [] });
    }

    // For now, return empty - documents are managed by Zustand store
    return NextResponse.json({ success: true, documents: [] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Erro ao listar documentos" },
      { status: 500 }
    );
  }
}
