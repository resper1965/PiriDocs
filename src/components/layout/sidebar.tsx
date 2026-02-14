"use client";

import { useChatStore, useCurrentChat, AgentType } from "@/store/chat-store";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MessageSquare,
  Plus,
  Trash2,
  Scale,
  BarChart3,
  FileCheck,
  ChevronLeft,
  FileText,
  Users,
  LogOut,
} from "lucide-react";
import { useState } from "react";

const agentIcons = {
  legal: Scale,
  commercial: BarChart3,
  contract: FileCheck,
};

const agentColors = {
  legal: "bg-[#1a4d2e]",      // Verde escuro
  commercial: "bg-[#3d5a6b]", // Azul acinzentado
  contract: "bg-[#8b6914]",   // Âmbar/Dourado
};

export function Sidebar() {
  const {
    chats,
    currentChatId,
    setCurrentChatId,
    createChat,
    deleteChat,
    sidebarOpen,
    setSidebarOpen,
    setPiriDocsOpen,
  } = useChatStore();
  
  const { userProfile, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<"chats" | "clients">("chats");

  const handleNewChat = (agentType: AgentType) => {
    createChat(agentType);
  };

  const groupedChats = {
    legal: chats.filter((c) => c.agentType === "legal"),
    commercial: chats.filter((c) => c.agentType === "commercial"),
    contract: chats.filter((c) => c.agentType === "contract"),
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-[#d4c8b0] flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#d4c8b0]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a4d2e] to-[#2d5a3d] flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="font-semibold text-lg text-[#1a3d2e]">PiriChat</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* New Chat Buttons */}
        <div className="p-3 space-y-2">
          <Button
            onClick={() => handleNewChat("legal")}
            className="w-full justify-start gap-2 bg-[#1a4d2e] hover:bg-[#153d24]"
          >
            <Scale className="h-4 w-4" />
            Novo Chat Jurídico
          </Button>
          <Button
            onClick={() => handleNewChat("contract")}
            variant="outline"
            className="w-full justify-start gap-2 border-[#8b6914] text-[#8b6914] hover:bg-[#8b6914]/10"
          >
            <FileCheck className="h-4 w-4" />
            Novo Chat Contratos
          </Button>
          <Button
            onClick={() => handleNewChat("commercial")}
            variant="outline"
            className="w-full justify-start gap-2 border-[#3d5a6b] text-[#3d5a6b] hover:bg-[#3d5a6b]/10"
          >
            <BarChart3 className="h-4 w-4" />
            Novo Chat Comercial
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#d4c8b0]">
          <button
            onClick={() => setActiveTab("chats")}
            className={cn(
              "flex-1 py-2 text-sm font-medium transition-colors",
              activeTab === "chats"
                ? "text-[#1a4d2e] border-b-2 border-[#1a4d2e]"
                : "text-[#5a6b5e] hover:text-[#1a3d2e]"
            )}
          >
            Conversas
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={cn(
              "flex-1 py-2 text-sm font-medium transition-colors",
              activeTab === "clients"
                ? "text-[#1a4d2e] border-b-2 border-[#1a4d2e]"
                : "text-[#5a6b5e] hover:text-[#1a3d2e]"
            )}
          >
            Clientes
          </button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1">
          {activeTab === "chats" ? (
            <div className="p-2 space-y-4">
              {/* Contract Chats */}
              {groupedChats.contract.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-xs font-medium text-[#5a6b5e] uppercase tracking-wider flex items-center gap-1">
                    <FileCheck className="h-3 w-3" /> Contratos
                  </p>
                  <div className="space-y-1">
                    {groupedChats.contract.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === currentChatId}
                        onClick={() => setCurrentChatId(chat.id)}
                        onDelete={() => deleteChat(chat.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Legal Chats */}
              {groupedChats.legal.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-xs font-medium text-[#5a6b5e] uppercase tracking-wider flex items-center gap-1">
                    <Scale className="h-3 w-3" /> Jurídico
                  </p>
                  <div className="space-y-1">
                    {groupedChats.legal.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === currentChatId}
                        onClick={() => setCurrentChatId(chat.id)}
                        onDelete={() => deleteChat(chat.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Commercial Chats */}
              {groupedChats.commercial.length > 0 && (
                <div>
                  <p className="px-2 py-1 text-xs font-medium text-[#5a6b5e] uppercase tracking-wider flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" /> Comercial
                  </p>
                  <div className="space-y-1">
                    {groupedChats.commercial.map((chat) => (
                      <ChatItem
                        key={chat.id}
                        chat={chat}
                        isActive={chat.id === currentChatId}
                        onClick={() => setCurrentChatId(chat.id)}
                        onDelete={() => deleteChat(chat.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {chats.length === 0 && (
                <div className="text-center py-8 text-[#5a6b5e]">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma conversa ainda</p>
                  <p className="text-xs mt-1">Inicie um novo chat acima</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-2">
              <ClientsList />
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-[#d4c8b0] space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start gap-2 border-[#d4c8b0] hover:bg-[#f0ebe0] hover:border-[#1a4d2e]"
            onClick={() => setPiriDocsOpen(true)}
          >
            <FileText className="h-4 w-4" />
            PiriDocs
          </Button>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-[#f0ebe0]">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userProfile?.photoURL || undefined} />
              <AvatarFallback className="bg-[#1a4d2e] text-white text-sm">
                {userProfile?.displayName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-[#1a3d2e]">{userProfile?.displayName || "Usuário"}</p>
              <p className="text-xs text-[#5a6b5e] truncate">{userProfile?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={signOut}
              title="Sair"
            >
              <LogOut className="h-4 w-4 text-[#5a6b5e]" />
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

function ChatItem({
  chat,
  isActive,
  onClick,
  onDelete,
}: {
  chat: ReturnType<typeof useCurrentChat>;
  isActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const Icon = chat ? agentIcons[chat.agentType] : MessageSquare;
  const color = chat ? agentColors[chat.agentType] : "bg-[#5a6b5e]";

  return (
    <div
      onClick={onClick}
      className={cn(
        "group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors",
        isActive ? "bg-[#d4e5d8] text-[#1a4d2e]" : "hover:bg-[#f0ebe0]"
      )}
    >
      <div className={cn("w-2 h-2 rounded-full", color)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{chat?.title}</p>
        <p className="text-xs text-[#5a6b5e]">
          {chat?.messages.length || 0} mensagens
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 opacity-0 group-hover:opacity-100"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        <Trash2 className="h-3 w-3 text-[#5a6b5e] hover:text-[#8b4513]" />
      </Button>
    </div>
  );
}

function ClientsList() {
  const { clients } = useChatStore();

  return (
    <div className="space-y-2">
      {clients.length === 0 ? (
        <div className="text-center py-8 text-[#5a6b5e]">
          <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhum cliente cadastrado</p>
          <p className="text-xs mt-1">Adicione clientes em PiriDocs</p>
        </div>
      ) : (
        clients.map((client) => (
          <div
            key={client.id}
            className="p-2 rounded-lg hover:bg-[#f0ebe0] cursor-pointer"
          >
            <p className="text-sm font-medium text-[#1a3d2e]">{client.name}</p>
            <p className="text-xs text-[#5a6b5e]">
              {client.documents?.length || 0} documentos
            </p>
          </div>
        ))
      )}
    </div>
  );
}
