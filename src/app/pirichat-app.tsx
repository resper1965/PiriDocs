"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { ChatArea } from "@/components/chat/chat-area";
import { PiriDocsPanel } from "@/components/piridocs/piridocs-panel";
import { useChatStore } from "@/store/chat-store";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Menu, FileText, Heart, Scale, BarChart3, FileCheck, Leaf, LogOut, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function PiriChatApp() {
  const { sidebarOpen, setSidebarOpen, setPiriDocsOpen } = useChatStore();
  const { userProfile, signOut } = useAuth();

  return (
    <div className="h-screen flex flex-col bg-[#faf8f4]">
      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between p-3 border-b border-[#d4c8b0] bg-white">
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5 text-[#1a3d2e]" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#1a4d2e] to-[#2d5a3d] flex items-center justify-center">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <span className="font-semibold text-[#1a3d2e]">PiriChat</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setPiriDocsOpen(true)}>
              <FileText className="h-5 w-5 text-[#1a3d2e]" />
            </Button>
          </header>

          {/* Chat Area */}
          <ChatArea />
        </div>
      </div>

      {/* Footer - Fixed at bottom */}
      <footer className="border-t border-[#d4c8b0] bg-white px-4 py-2 shrink-0">
        <div className="flex items-center justify-between text-xs text-[#5a6b5e]">
          {/* Left: Developed by */}
          <div className="flex items-center gap-1">
            <span>Desenvolvido por</span>
            <a 
              href="http://bekaa.eu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-medium text-[#1a4d2e] hover:text-[#153d24] transition-colors"
            >
              <span>Bekaá Trusted Advisors</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Center: Brand & Agents */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Leaf className="h-3 w-3 text-[#1a4d2e]" />
              <span className="font-medium text-[#1a4d2e]">PiriGones</span>
            </div>
            <span className="text-[#d4c8b0]">|</span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[#1a4d2e]" />
              Auto
            </span>
            <span className="flex items-center gap-1">
              <Scale className="h-3 w-3 text-[#1a4d2e]" />
              Jurídico
            </span>
            <span className="flex items-center gap-1">
              <FileCheck className="h-3 w-3 text-[#8b6914]" />
              Contratos
            </span>
            <span className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3 text-[#3d5a6b]" />
              Comercial
            </span>
          </div>

          {/* Right: User */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={userProfile?.photoURL || undefined} />
                <AvatarFallback className="bg-[#1a4d2e] text-white text-[8px]">
                  {userProfile?.displayName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline">{userProfile?.displayName}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={signOut}
              title="Sair"
            >
              <LogOut className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </footer>

      {/* PiriDocs Modal */}
      <PiriDocsPanel />
    </div>
  );
}
