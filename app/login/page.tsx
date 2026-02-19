"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase/client";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await credential.user.getIdToken();

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (res.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        alert("Erro ao iniciar sessão. Tente novamente.");
      }
    } catch {
      alert("Credenciais inválidas. Verifique seu email e senha.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9] p-8">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-foreground tracking-tight mb-2">
            PiriDocs
          </h1>
          <p className="text-muted text-sm uppercase tracking-widest">
            Inteligência Jurídica
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="space-y-4">
            <input
              id="email"
              type="email"
              placeholder="Email"
              required
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-foreground placeholder:text-muted text-foreground transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              id="password"
              type="password"
              placeholder="Senha"
              required
              className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 focus:ring-0 focus:border-foreground placeholder:text-muted text-foreground transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-foreground text-background hover:bg-accent transition-colors duration-300 text-sm uppercase tracking-widest font-medium"
          >
            Acessar
          </button>
        </form>
      </div>
    </div>
  );
}
