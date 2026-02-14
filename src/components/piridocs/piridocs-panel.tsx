"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useChatStore } from "@/store/chat-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FileText,
  Upload,
  Trash2,
  Building2,
  Database,
  Users,
  Plus,
  Search,
  Globe,
  Lock,
  BookOpen,
  Briefcase,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const kbDocumentTypes = [
  { value: "ans_portaria", label: "Portaria ANS", icon: FileText },
  { value: "ans_rn", label: "Resolução Normativa", icon: BookOpen },
  { value: "ans_ri", label: "Resolução Institucional", icon: BookOpen },
  { value: "operator_table", label: "Tabela de Operadora", icon: Database },
  { value: "regulation", label: "Regulamento", icon: FileText },
  { value: "other", label: "Outro", icon: FileText },
];

const clientDocTypes = [
  { value: "contract", label: "Contrato", icon: FileText },
  { value: "policy", label: "Apólice", icon: Briefcase },
  { value: "claim", label: "Sinistro", icon: FileText },
  { value: "invoice", label: "Fatura", icon: FileText },
  { value: "report", label: "Relatório", icon: FileText },
  { value: "other", label: "Outro", icon: FileText },
];

export function PiriDocsPanel() {
  const { userProfile } = useAuth();
  const { piriDocsOpen, setPiriDocsOpen, clients, documents } = useChatStore();
  const [activeTab, setActiveTab] = useState("knowledge");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClientId, setSelectedClientId] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  // Documentos da base de conhecimento (simulados - virão do banco)
  const knowledgeBaseDocs = documents.filter(d => d.category?.startsWith("ANS") || d.category?.startsWith("SUSEP"));
  
  // Documentos do cliente selecionado
  const clientDocs = selectedClientId 
    ? documents.filter(d => d.clientId === selectedClientId)
    : [];

  return (
    <Dialog open={piriDocsOpen} onOpenChange={setPiriDocsOpen}>
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col bg-white border-[#d4c8b0]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#1a3d2e]">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a4d2e] to-[#2d5a3d] flex items-center justify-center">
              <Database className="h-4 w-4 text-white" />
            </div>
            PiriDocs - Gestão de Conhecimento
          </DialogTitle>
          <DialogDescription className="text-[#5a6b5e]">
            Base de Conhecimento do Setor (compartilhada) e Documentos de Clientes (isolados)
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2 bg-[#f0ebe0]">
            <TabsTrigger value="knowledge" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1a4d2e]">
              <Globe className="h-4 w-4" />
              Base do Setor (Compartilhada)
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2 data-[state=active]:bg-white data-[state=active]:text-[#1a4d2e]">
              <Lock className="h-4 w-4" />
              Documentos de Clientes
            </TabsTrigger>
          </TabsList>

          {/* Base de Conhecimento do Setor */}
          <TabsContent value="knowledge" className="flex-1 mt-4">
            <div className="space-y-4">
              {/* Info Banner */}
              <div className="bg-[#d4e5d8] border border-[#1a4d2e]/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-[#1a4d2e] mt-0.5" />
                  <div>
                    <h3 className="font-medium text-[#1a4d2e]">Base Compartilhada do Setor</h3>
                    <p className="text-sm text-[#5a6b5e]">
                      Portarias ANS, Resoluções Normativas, Tabelas de Operadoras e outros documentos oficiais. 
                      Disponível para todos os usuários da plataforma nas consultas.
                    </p>
                  </div>
                </div>
              </div>

              {/* Search and Upload */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5a6b5e]" />
                  <Input
                    placeholder="Buscar na base de conhecimento..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 border-[#d4c8b0] focus:border-[#1a4d2e]"
                  />
                </div>
                <label>
                  <input type="file" accept=".pdf,.doc,.docx,.txt,.xls,.xlsx" className="hidden" />
                  <Button className="gap-2 bg-[#1a4d2e] hover:bg-[#153d24]">
                    <Upload className="h-4 w-4" />
                    Upload
                  </Button>
                </label>
              </div>

              {/* Quick Categories */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 text-xs bg-[#f0ebe0] border border-[#d4c8b0] rounded-full cursor-pointer hover:bg-[#e8e0d0]">
                  Todas
                </span>
                <span className="px-3 py-1 text-xs bg-[#f0ebe0] border border-[#d4c8b0] rounded-full cursor-pointer hover:bg-[#e8e0d0]">
                  ANS - Portarias
                </span>
                <span className="px-3 py-1 text-xs bg-[#f0ebe0] border border-[#d4c8b0] rounded-full cursor-pointer hover:bg-[#e8e0d0]">
                  ANS - RN
                </span>
                <span className="px-3 py-1 text-xs bg-[#f0ebe0] border border-[#d4c8b0] rounded-full cursor-pointer hover:bg-[#e8e0d0]">
                  ANS - RI
                </span>
                <span className="px-3 py-1 text-xs bg-[#f0ebe0] border border-[#d4c8b0] rounded-full cursor-pointer hover:bg-[#e8e0d0]">
                  Tabelas Operadoras
                </span>
                <span className="px-3 py-1 text-xs bg-[#f0ebe0] border border-[#d4c8b0] rounded-full cursor-pointer hover:bg-[#e8e0d0]">
                  SUSEP
                </span>
              </div>

              {/* Documents List */}
              <ScrollArea className="h-[320px]">
                {knowledgeBaseDocs.length === 0 ? (
                  <div className="text-center py-12 text-[#5a6b5e]">
                    <Database className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Base de Conhecimento do Setor</p>
                    <p className="text-sm mt-1">Faça upload de documentos oficiais</p>
                    <div className="grid grid-cols-2 gap-2 max-w-xs mx-auto mt-4 text-xs">
                      <div className="p-2 bg-[#f0ebe0] rounded flex items-center gap-2">
                        <BookOpen className="h-4 w-4" />
                        RN 465, 623...
                      </div>
                      <div className="p-2 bg-[#f0ebe0] rounded flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Portarias ANS
                      </div>
                      <div className="p-2 bg-[#f0ebe0] rounded flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Tabelas
                      </div>
                      <div className="p-2 bg-[#f0ebe0] rounded flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        SUSEP
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {knowledgeBaseDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#d4c8b0] hover:border-[#1a4d2e] hover:bg-[#f0ebe0]/50 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-[#f0ebe0] flex items-center justify-center">
                          <Database className="h-5 w-5 text-[#1a4d2e]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-[#1a3d2e]">{doc.name}</p>
                          <div className="flex items-center gap-2 text-xs text-[#5a6b5e]">
                            <span>{doc.category}</span>
                            <span>•</span>
                            <span>{doc.type}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-4 w-4 text-[#5a6b5e] hover:text-[#8b4513]" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Documentos de Clientes */}
          <TabsContent value="clients" className="flex-1 mt-4">
            <div className="space-y-4">
              {/* Info Banner */}
              <div className="bg-[#e8e0d0] border border-[#d4c8b0] rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-[#5a6b5e] mt-0.5" />
                  <div>
                    <h3 className="font-medium text-[#1a3d2e]">Documentos Isolados por Cliente</h3>
                    <p className="text-sm text-[#5a6b5e]">
                      Contratos, apólices e documentos específicos de cada cliente. 
                      <strong> Dados completamente isolados</strong> - cada cliente só tem acesso aos seus próprios documentos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Client Selector */}
              <div className="flex gap-2">
                <select 
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="flex-1 border border-[#d4c8b0] rounded-md px-3 py-2 bg-white focus:border-[#1a4d2e] focus:outline-none text-[#1a3d2e]"
                >
                  <option value="">Selecione um cliente...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
                <Button variant="outline" className="gap-2 border-[#1a4d2e] text-[#1a4d2e]">
                  <Plus className="h-4 w-4" />
                  Novo Cliente
                </Button>
              </div>

              {/* Documents List */}
              <ScrollArea className="h-[350px]">
                {!selectedClientId ? (
                  <div className="text-center py-12 text-[#5a6b5e]">
                    <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Selecione um Cliente</p>
                    <p className="text-sm mt-1">Os documentos do cliente serão exibidos aqui</p>
                    {clients.length === 0 && (
                      <p className="text-xs mt-4 text-[#5a6b5e]">
                        Nenhum cliente cadastrado. Clique em "Novo Cliente" para começar.
                      </p>
                    )}
                  </div>
                ) : clientDocs.length === 0 ? (
                  <div className="text-center py-12 text-[#5a6b5e]">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="font-medium">Nenhum documento</p>
                    <p className="text-sm mt-1">Faça upload de documentos para este cliente</p>
                    <Button className="mt-4 gap-2 bg-[#1a4d2e] hover:bg-[#153d24]">
                      <Upload className="h-4 w-4" />
                      Upload Documento
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {clientDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#d4c8b0] hover:border-[#1a4d2e] hover:bg-[#f0ebe0]/50 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-[#f0ebe0] flex items-center justify-center">
                          <Briefcase className="h-5 w-5 text-[#1a4d2e]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-[#1a3d2e]">{doc.name}</p>
                          <div className="flex items-center gap-2 text-xs text-[#5a6b5e]">
                            <span>{doc.type}</span>
                            <span>•</span>
                            <span>{doc.category || "Sem categoria"}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                          <Trash2 className="h-4 w-4 text-[#5a6b5e] hover:text-[#8b4513]" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
