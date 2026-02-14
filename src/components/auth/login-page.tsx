"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Scale, BarChart3, FileCheck, Sparkles, LogIn, ExternalLink, Heart, Zap } from "lucide-react";

export function LoginPage() {
  const { signInWithGoogle, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#faf8f4] via-[#f0ebe0] to-[#e8e0d0] p-4">
      <div className="w-full max-w-md flex-1 flex flex-col justify-center">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#1a4d2e] via-[#2d5a3d] to-[#8b6914] flex items-center justify-center shadow-lg">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-[#1a3d2e] mb-2">PiriChat</h1>
          <p className="text-[#5a6b5e]">
            Inteligência para Saúde Suplementar
          </p>
        </div>

        {/* Features */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-[#d4c8b0]">
          {/* Orquestrador - Destaque */}
          <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-[#1a4d2e]/10 via-[#2d5a3d]/10 to-[#8b6914]/10 border border-[#1a4d2e]/20">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#1a4d2e] via-[#2d5a3d] to-[#8b6914] flex items-center justify-center shrink-0">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-[#1a3d2e] flex items-center gap-1">
                  Orquestrador Inteligente
                  <span className="text-[8px] px-1.5 py-0.5 bg-[#1a4d2e] text-white rounded-full">NOVO</span>
                </h3>
                <p className="text-sm text-[#5a6b5e]">
                  A IA escolhe automaticamente o melhor especialista para sua pergunta.
                </p>
              </div>
            </div>
          </div>

          <h2 className="text-sm font-medium text-[#5a6b5e] mb-3 text-center uppercase tracking-wider">
            Especialistas Disponíveis
          </h2>
          
          <div className="space-y-2">
            {/* Legal Agent */}
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#f0ebe0]">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1a4d2e] to-[#2d5a3d] flex items-center justify-center shrink-0">
                <Scale className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-[#1a3d2e]">PiriJurídico</h3>
                <p className="text-xs text-[#5a6b5e]">
                  ANS, RN, RI, SUSEP e legislação
                </p>
              </div>
            </div>

            {/* Contract Agent */}
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#f5e6c8]/50">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b6914] to-[#a67c00] flex items-center justify-center shrink-0">
                <FileCheck className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-[#1a3d2e]">PiriContratos</h3>
                <p className="text-xs text-[#5a6b5e]">
                  Gaps, ofensores e necessidades contratuais
                </p>
              </div>
            </div>

            {/* Commercial Agent */}
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-[#e8e0d0]/50">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#3d5a6b] to-[#4a6b7c] flex items-center justify-center shrink-0">
                <BarChart3 className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-sm text-[#1a3d2e]">PiriComercial</h3>
                <p className="text-xs text-[#5a6b5e]">
                  Análises, tendências e insights de mercado
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Login Button */}
        <Button
          onClick={signInWithGoogle}
          disabled={loading}
          className="w-full h-12 text-lg gap-2 bg-[#1a4d2e] hover:bg-[#153d24]"
        >
          {loading ? (
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          ) : (
            <>
              <LogIn className="h-5 w-5" />
              Entrar com Google
            </>
          )}
        </Button>

        {/* Terms */}
        <p className="text-center text-xs text-[#5a6b5e] mt-6">
          Ao entrar, você concorda com nossos termos de uso e política de privacidade.
        </p>
      </div>

      {/* Footer */}
      <footer className="w-full max-w-md text-center py-4">
        <div className="flex items-center justify-center gap-1 text-xs text-[#5a6b5e]">
          <span>Desenvolvido com</span>
          <Heart className="h-3 w-3 text-[#1a4d2e] fill-[#1a4d2e]" />
          <span>por</span>
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
        <p className="text-[10px] text-[#5a6b5e]/70 mt-1">
          PiriGones Platform © {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
