"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { signOut } from "firebase/auth";

interface Notebook {
  id: string;
  title: string;
  created_at: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    fetch("/api/notebooks")
      .then((r) => r.json())
      .then((data) => setNotebooks(data.notebooks ?? []));
  }, []);

  const createNotebook = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    const res = await fetch("/api/notebooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    const data = await res.json();
    if (data.id) {
      router.push(`/notebook/${data.id}`);
    }
    setCreating(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    await fetch("/api/auth/session", { method: "DELETE" });
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-black/5 px-8 py-5 flex items-center justify-between">
        <h1 className="font-serif text-2xl">PiriDocs</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-muted hover:text-foreground transition-colors uppercase tracking-widest"
        >
          Sair
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-8 py-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-serif text-3xl mb-1">Notebooks</h2>
            <p className="text-muted text-sm">Gerencie seus documentos jurídicos</p>
          </div>
        </div>

        {/* Criar notebook */}
        <div className="flex gap-3 mb-10">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createNotebook()}
            placeholder="Título do novo notebook..."
            className="flex-1 px-0 py-2 bg-transparent border-0 border-b border-gray-300 focus:border-foreground outline-none text-base placeholder:text-muted transition-colors"
          />
          <button
            onClick={createNotebook}
            disabled={creating || !newTitle.trim()}
            className="px-6 py-2 bg-foreground text-background hover:bg-accent transition-colors text-sm uppercase tracking-widest disabled:opacity-40"
          >
            {creating ? "Criando..." : "Criar"}
          </button>
        </div>

        {/* Lista de notebooks */}
        {notebooks.length === 0 ? (
          <p className="text-muted text-center py-16 text-sm">
            Nenhum notebook ainda. Crie o primeiro acima.
          </p>
        ) : (
          <div className="grid gap-3">
            {notebooks.map((nb) => (
              <button
                key={nb.id}
                onClick={() => router.push(`/notebook/${nb.id}`)}
                className="w-full text-left px-6 py-5 border border-black/10 hover:border-accent hover:bg-white transition-all group"
              >
                <p className="font-medium group-hover:text-accent transition-colors">
                  {nb.title}
                </p>
                <p className="text-xs text-muted mt-1">
                  {new Date(nb.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
