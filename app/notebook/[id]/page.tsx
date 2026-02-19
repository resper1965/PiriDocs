"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Notebook() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [thinking, setThinking] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("notebookId", id);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();

    setUploading(false);
    if (data.success) alert(`Documento ingerido com sucesso! (${data.chunks} trechos)`);
    else alert("Erro ao ingerir documento.");
  };

  const sendMessage = async () => {
    if (!input.trim() || thinking) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setThinking(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: userMsg.content, notebookId: id }),
    });
    const data = await res.json();
    setThinking(false);

    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.response ?? data.error ?? "Erro inesperado." },
    ]);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-80 border-r border-black/10 p-6 bg-white flex flex-col">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs text-muted hover:text-foreground transition-colors uppercase tracking-widest mb-8 text-left"
        >
          ← Notebooks
        </button>
        <h2 className="font-serif text-xl mb-6">Documentos</h2>
        <label className="block w-full p-4 border border-dashed text-center cursor-pointer hover:border-accent transition-colors text-sm text-muted">
          {uploading ? "Processando..." : "Adicionar PDF"}
          <input
            type="file"
            className="hidden"
            accept=".pdf"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </aside>

      {/* Main Chat */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {messages.length === 0 && !thinking && (
            <p className="text-muted text-center pt-24 text-sm">
              Adicione um PDF e faça sua primeira pergunta à Piri.
            </p>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full border flex items-center justify-center font-serif text-accent flex-shrink-0">
                  P
                </div>
              )}
              <div className="max-w-2xl">
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full border flex items-center justify-center font-serif text-accent flex-shrink-0">
                P
              </div>
              <p className="text-muted text-lg leading-relaxed">Analisando...</p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-black/5 bg-white/50">
          <div className="flex gap-4 max-w-3xl mx-auto">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent text-lg border-b border-black/20 focus:border-accent outline-none py-2"
              placeholder="Pergunte à Piri..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={thinking}
            />
            <button
              onClick={sendMessage}
              disabled={thinking || !input.trim()}
              className="px-6 py-2 bg-foreground text-background hover:bg-accent transition-colors text-sm uppercase tracking-widest disabled:opacity-40"
            >
              Enviar
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
