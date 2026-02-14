import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
  sources?: string[];
  agentUsed?: AgentType; // Qual agente respondeu (útil no modo orquestrado)
}

export type AgentType = 'legal' | 'commercial' | 'contract' | 'auto';

export interface Chat {
  id: string;
  title: string;
  agentType: AgentType;
  messages: Message[];
  clientId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  cnpj?: string;
  notes?: string;
  documents: Document[];
}

export interface Document {
  id: string;
  name: string;
  type: 'contract' | 'policy' | 'regulation' | 'report' | 'other';
  category?: string;
  clientId?: string;
  uploadedAt: Date;
  size?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'broker' | 'admin';
}

// Agent Configuration
export const AGENT_CONFIG: Record<AgentType, { name: string; description: string }> = {
  auto: {
    name: 'Orquestrador Inteligente',
    description: 'A IA escolhe o melhor especialista automaticamente',
  },
  legal: {
    name: 'Assistente Jurídico ANS',
    description: 'Especialista em direito e regulação da saúde suplementar',
  },
  commercial: {
    name: 'Assistente Comercial',
    description: 'Análises estatísticas e insights comerciais',
  },
  contract: {
    name: 'Assistente de Contratos',
    description: 'Gestão, gaps, ofensores e necessidades contratuais',
  },
};

// Store State
interface ChatState {
  // User
  user: User | null;
  setUser: (user: User | null) => void;
  
  // Chats
  chats: Chat[];
  currentChatId: string | null;
  setCurrentChatId: (id: string | null) => void;
  createChat: (agentType: AgentType, clientId?: string) => string;
  deleteChat: (id: string) => void;
  
  // Messages
  addMessage: (chatId: string, message: Omit<Message, 'id' | 'createdAt'>) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  
  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'documents'>) => string;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  
  // Documents (PiriDocs)
  documents: Document[];
  addDocument: (doc: Omit<Document, 'id' | 'uploadedAt'>) => string;
  deleteDocument: (id: string) => void;
  
  // UI State
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  piriDocsOpen: boolean;
  setPiriDocsOpen: (open: boolean) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 15);

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      // User
      user: {
        id: 'demo-user',
        name: 'Corretor Demo',
        email: 'demo@pirichat.com',
        role: 'broker',
      },
      setUser: (user) => set({ user }),
      
      // Chats
      chats: [],
      currentChatId: null,
      setCurrentChatId: (id) => set({ currentChatId: id }),
      createChat: (agentType, clientId) => {
        const id = generateId();
        const agentName = AGENT_CONFIG[agentType].name;
        const newChat: Chat = {
          id,
          title: agentType === 'auto' 
            ? 'Nova Conversa Inteligente' 
            : `Nova Conversa - ${agentName}`,
          agentType,
          messages: [],
          clientId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: id,
        }));
        return id;
      },
      deleteChat: (id) => set((state) => ({
        chats: state.chats.filter((c) => c.id !== id),
        currentChatId: state.currentChatId === id ? null : state.currentChatId,
      })),
      
      // Messages
      addMessage: (chatId, message) => set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    ...message,
                    id: generateId(),
                    createdAt: new Date(),
                  },
                ],
                updatedAt: new Date(),
              }
            : chat
        ),
      })),
      updateChatTitle: (chatId, title) => set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId ? { ...chat, title, updatedAt: new Date() } : chat
        ),
      })),
      
      // Clients
      clients: [],
      addClient: (client) => {
        const id = generateId();
        set((state) => ({
          clients: [...state.clients, { ...client, id, documents: [] }],
        }));
        return id;
      },
      updateClient: (id, data) => set((state) => ({
        clients: state.clients.map((c) =>
          c.id === id ? { ...c, ...data } : c
        ),
      })),
      deleteClient: (id) => set((state) => ({
        clients: state.clients.filter((c) => c.id !== id),
      })),
      
      // Documents
      documents: [],
      addDocument: (doc) => {
        const id = generateId();
        set((state) => ({
          documents: [...state.documents, { ...doc, id, uploadedAt: new Date() }],
        }));
        return id;
      },
      deleteDocument: (id) => set((state) => ({
        documents: state.documents.filter((d) => d.id !== id),
      })),
      
      // UI State
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      piriDocsOpen: false,
      setPiriDocsOpen: (open) => set({ piriDocsOpen: open }),
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'pirichat-storage',
      partialize: (state) => ({
        user: state.user,
        chats: state.chats,
        clients: state.clients,
        documents: state.documents,
      }),
    }
  )
);

// Selector hooks
export const useCurrentChat = () => {
  const chats = useChatStore((s) => s.chats);
  const currentChatId = useChatStore((s) => s.currentChatId);
  return chats.find((c) => c.id === currentChatId) || null;
};

export const useChatMessages = () => {
  const chat = useCurrentChat();
  return chat?.messages || [];
};
