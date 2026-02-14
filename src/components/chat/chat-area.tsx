"use client";

import { useChatStore, useCurrentChat, useChatMessages, AgentType, AGENT_CONFIG } from "@/store/chat-store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Menu,
  Send,
  Scale,
  BarChart3,
  FileCheck,
  Sparkles,
  FileText,
  User,
  ArrowRightLeft,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

const agentInfo: Record<Exclude<AgentType, 'auto'>, {
  name: string;
  description: string;
  icon: typeof Scale;
  gradient: string;
  bgColor: string;
}> = {
  legal: {
    name: "PiriJurídico",
    description: "Especialista em direito e regulação da saúde suplementar",
    icon: Scale,
    gradient: "from-[#1a4d2e] to-[#2d5a3d]",
    bgColor: "bg-[#1a4d2e]",
  },
  contract: {
    name: "PiriContratos",
    description: "Gestão, gaps, ofensores e necessidades contratuais",
    icon: FileCheck,
    gradient: "from-[#8b6914] to-[#a67c00]",
    bgColor: "bg-[#8b6914]",
  },
  commercial: {
    name: "PiriComercial",
    description: "Análises estatísticas e insights comerciais",
    icon: BarChart3,
    gradient: "from-[#3d5a6b] to-[#4a6b7c]",
    bgColor: "bg-[#3d5a6b]",
  },
};

export function ChatArea() {
  const currentChat = useCurrentChat();
  const messages = useChatMessages();
  const { setSidebarOpen, addMessage, isLoading, setIsLoading, updateChatTitle, currentChatId } = useChatStore();
  const [input, setInput] = useState("");
  const [currentAgent, setCurrentAgent] = useState<Exclude<AgentType, 'auto'> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !currentChatId || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    addMessage(currentChatId, {
      role: "user",
      content: userMessage,
    });

    if (messages.length === 0) {
      const title = userMessage.slice(0, 40) + (userMessage.length > 40 ? "..." : "");
      updateChatTitle(currentChatId, title);
    }

    setIsLoading(true);

    try {
      const isAutoMode = currentChat?.agentType === 'auto';
      
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          agentType: isAutoMode ? undefined : currentChat?.agentType,
          chatHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          autoOrchestrate: isAutoMode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Se modo auto, mostrar qual agente foi usado
        if (isAutoMode && data.agentType) {
          setCurrentAgent(data.agentType);
        }

        addMessage(currentChatId, {
          role: "assistant",
          content: data.response,
          sources: data.sources,
          agentUsed: data.agentType,
        });
      } else {
        addMessage(currentChatId, {
          role: "assistant",
          content: "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.",
        });
      }
    } catch (error) {
      addMessage(currentChatId, {
        role: "assistant",
        content: "Erro de conexão. Verifique sua internet e tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Empty state
  if (!currentChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#faf8f4] p-8">
        <div className="text-center max-w-lg">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#1a4d2e] via-[#2d5a3d] to-[#8b6914] flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-[#1a3d2e]">Bem-vindo ao PiriChat</h2>
          <p className="text-[#5a6b5e] mb-6">
            Sua plataforma de IA especializada em saúde suplementar e seguros saúde.
          </p>
          
          {/* Conversa Inteligente - Destaque */}
          <Button
            onClick={() => useChatStore.getState().createChat("auto")}
            className="w-full justify-start gap-3 h-auto py-4 bg-gradient-to-r from-[#1a4d2e] via-[#2d5a3d] to-[#8b6914] hover:opacity-90 mb-3"
          >
            <Sparkles className="h-5 w-5" />
            <div className="text-left">
              <p className="font-medium">Nova Conversa Inteligente</p>
              <p className="text-xs opacity-80">A IA escolhe automaticamente o melhor especialista</p>
            </div>
          </Button>
          
          <p className="text-xs text-[#5a6b5e] mb-3">— ou escolha um especialista —</p>
          
          <div className="grid grid-cols-1 gap-2">
            <Button
              onClick={() => useChatStore.getState().createChat("legal")}
              variant="outline"
              className="justify-start gap-3 h-auto py-3 border-[#1a4d2e] text-[#1a4d2e] hover:bg-[#1a4d2e]/10"
            >
              <Scale className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Chat Jurídico ANS</p>
                <p className="text-xs opacity-70">Regulação e normas</p>
              </div>
            </Button>
            <Button
              onClick={() => useChatStore.getState().createChat("contract")}
              variant="outline"
              className="justify-start gap-3 h-auto py-3 border-[#8b6914] text-[#8b6914] hover:bg-[#8b6914]/10"
            >
              <FileCheck className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Chat de Contratos</p>
                <p className="text-xs opacity-70">Gaps, ofensores e necessidades</p>
              </div>
            </Button>
            <Button
              onClick={() => useChatStore.getState().createChat("commercial")}
              variant="outline"
              className="justify-start gap-3 h-auto py-3 border-[#3d5a6b] text-[#3d5a6b] hover:bg-[#3d5a6b]/10"
            >
              <BarChart3 className="h-5 w-5" />
              <div className="text-left">
                <p className="font-medium">Chat Comercial</p>
                <p className="text-xs opacity-70">Análises e estatísticas</p>
              </div>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isAutoMode = currentChat.agentType === 'auto';
  const lastMessageAgent = messages.length > 0 ? messages[messages.length - 1]?.agentUsed : null;
  const displayAgent = isAutoMode ? (lastMessageAgent || currentAgent) : currentChat.agentType;
  const agent = displayAgent && displayAgent !== 'auto' ? agentInfo[displayAgent] : null;

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-[#d4c8b0] p-4 bg-white">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {isAutoMode ? (
            <>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#1a4d2e] via-[#2d5a3d] to-[#8b6914]">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-[#1a3d2e]">Conversa Inteligente</h1>
                <p className="text-xs text-[#5a6b5e]">
                  {agent ? (
                    <span className="flex items-center gap-1">
                      Respondendo como: <span className="font-medium text-[#1a4d2e]">{agent.name}</span>
                      <ArrowRightLeft className="h-3 w-3" />
                    </span>
                  ) : (
                    "A IA escolherá o melhor especialista"
                  )}
                </p>
              </div>
            </>
          ) : agent ? (
            <>
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br", agent.gradient)}>
                <agent.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold text-[#1a3d2e]">{agent.name}</h1>
                <p className="text-xs text-[#5a6b5e]">{agent.description}</p>
              </div>
            </>
          ) : null}
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-[#faf8f4]" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              {isAutoMode ? (
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#1a4d2e] via-[#2d5a3d] to-[#8b6914]">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              ) : agent ? (
                <div className={cn("w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center bg-gradient-to-br", agent.gradient)}>
                  <agent.icon className="h-6 w-6 text-white" />
                </div>
              ) : null}
              <p className="text-[#5a6b5e] mb-2">Como posso ajudar você hoje?</p>
              <div className="flex flex-wrap justify-center gap-2 mt-4">
                <SuggestionChip onClick={() => setInput("Analise este contrato e identifique os principais gaps de cobertura")}>
                  Análise de Contrato
                </SuggestionChip>
                <SuggestionChip onClick={() => setInput("O que diz a RN 465 sobre reajustes?")}>
                  RN 465 - Reajustes
                </SuggestionChip>
                <SuggestionChip onClick={() => setInput("Qual a tendência do mercado de saúde suplementar em 2025?")}>
                  Tendências 2025
                </SuggestionChip>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble 
                key={message.id} 
                message={message} 
                showAgentBadge={isAutoMode}
              />
            ))
          )}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                isAutoMode 
                  ? "bg-gradient-to-br from-[#1a4d2e] via-[#2d5a3d] to-[#8b6914]"
                  : agent ? `bg-gradient-to-br ${agent.gradient}` : "bg-[#1a4d2e]"
              )}>
                {isAutoMode ? (
                  <Sparkles className="h-4 w-4 text-white" />
                ) : agent ? (
                  <agent.icon className="h-4 w-4 text-white" />
                ) : null}
              </div>
              <div className="bg-[#f0ebe0] rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-[#d4c8b0] p-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isAutoMode ? "Digite sua pergunta... A IA escolherá o melhor especialista" : "Digite sua mensagem..."}
              className="min-h-[44px] max-h-32 resize-none border-[#d4c8b0] focus:border-[#1a4d2e] focus:ring-[#1a4d2e]"
              rows={1}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={cn(
                "px-4",
                isAutoMode
                  ? "bg-gradient-to-r from-[#1a4d2e] to-[#8b6914] hover:opacity-90"
                  : agent
                  ? agent.bgColor
                  : "bg-[#1a4d2e] hover:bg-[#153d24]"
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-[#5a6b5e] mt-2 text-center">
            PiriChat pode cometer erros. Verifique informações importantes.
          </p>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({
  message,
  showAgentBadge,
}: {
  message: { role: string; content: string; sources?: string[]; agentUsed?: string };
  showAgentBadge?: boolean;
}) {
  const isUser = message.role === "user";
  const agentUsed = message.agentUsed && message.agentUsed !== 'auto' ? agentInfo[message.agentUsed as Exclude<AgentType, 'auto'>] : null;
  const AgentIcon = agentUsed?.icon;

  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          isUser ? "bg-[#e8e0d0]" : agentUsed ? `bg-gradient-to-br ${agentUsed.gradient}` : "bg-[#1a4d2e]"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-[#1a3d2e]" />
        ) : AgentIcon ? (
          <AgentIcon className="h-4 w-4 text-white" />
        ) : (
          <Sparkles className="h-4 w-4 text-white" />
        )}
      </div>
      <div
        className={cn(
          "rounded-2xl px-4 py-3 max-w-[85%]",
          isUser
            ? "bg-[#1a4d2e] text-white rounded-tr-sm"
            : "bg-[#f0ebe0] rounded-tl-sm"
        )}
      >
        {!isUser && showAgentBadge && agentUsed && (
          <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-[#d4c8b0]/50">
            <AgentIcon className="h-3 w-3 text-[#1a4d2e]" />
            <span className="text-xs font-medium text-[#1a4d2e]">{agentUsed.name}</span>
          </div>
        )}
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="markdown-content prose prose-sm max-w-none text-[#1a3d2e]">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 pt-2 border-t border-[#d4c8b0]">
            <p className="text-xs text-[#5a6b5e] flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Fontes: {message.sources.join(", ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SuggestionChip({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-sm bg-white border border-[#d4c8b0] hover:border-[#1a4d2e] hover:bg-[#f0ebe0] rounded-full transition-colors text-[#1a3d2e]"
    >
      {children}
    </button>
  );
}
