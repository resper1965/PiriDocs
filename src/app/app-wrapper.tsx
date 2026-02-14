"use client";

import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { LoginPage } from "@/components/auth/login-page";
import { PiriChatApp } from "./pirichat-app";

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f4]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#1a4d2e] to-[#2d5a3d] flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <p className="text-[#5a6b5e]">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <PiriChatApp />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
