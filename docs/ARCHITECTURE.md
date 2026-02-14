# PiriGones Platform - Análise de Tecnologias

## LiteLLM - Análise de Valor

### ✅ SIM, LiteLLM tem MUITO valor para a PiriGones Platform

#### Benefícios Principais:

1. **Multi-provedor Unificado**
   - Interface única para OpenAI, Anthropic, Google, Cohere, etc.
   - Troca de provedor sem mudança de código
   - Compatibilidade com z-ai-web-dev-sdk atual

2. **Fallbacks Automáticos**
   ```
   OpenAI cai → tenta Anthropic → tenta Google
   ```
   - Alta disponibilidade para produção
   - Reduz pontos de falha

3. **Modelos Locais (Ollama)**
   - Rodar LLaMA, Mistral, etc. localmente
   - Zero custo de API para dados sensíveis
   - Privacidade total para documentos de clientes

4. **Controle de Custos**
   - Rate limiting por usuário/chave
   - Tracking de uso e custos
   - Cache de respostas

5. **Roteamento Inteligente**
   - Modelos mais baratos para tarefas simples
   - Modelos mais potentes para análises complexas
   - Balanceamento de carga

### Recomendação de Implementação:

```typescript
// Fase 1: Manter z-ai-web-dev-sdk (desenvolvimento)
// Fase 2: Adicionar LiteLLM como opção (produção)
// Fase 3: Configurar fallbacks e roteamento

// Exemplo de configuração LiteLLM
const litellmConfig = {
  model_list: [
    { model_name: "gpt-4", litellm_params: { model: "openai/gpt-4" } },
    { model_name: "claude", litellm_params: { model: "anthropic/claude-3" } },
    { model_name: "local", litellm_params: { model: "ollama/llama3" } },
  ],
  router_strategy: "simple-shuffle",
  fallbacks: [{ "gpt-4": ["claude", "local"] }],
};
```

### Custo-Benefício:
- **Desenvolvimento**: z-ai-web-dev-sdk é suficiente
- **Produção**: LiteLLM adiciona resiliência e controle
- **Veredito**: Implementar na Fase 2

---

## Arquitetura de Documentos - PiriGones Platform

### 📚 Base de Conhecimento do Setor (Compartilhada)
- Portarias ANS
- Resoluções Normativas (RN)
- Resoluções Institucionais (RI)
- Tabelas de Operadoras
- Regulamentos SUSEP
- **Acesso**: Todos os usuários
- **Embeddings**: KBEmbedding (compartilhado)

### 🔒 Documentos de Clientes (Isolados)
- Contratos
- Apólices
- Sinistros
- Faturas
- Relatórios
- **Acesso**: Apenas o corretor dono do cliente
- **Embeddings**: ClientEmbedding (isolado por cliente)

### 🔍 Sistema RAG (Retrieval Augmented Generation)
- Busca semântica com embeddings vetoriais
- Contexto combinado: Base do Setor + Docs do Cliente
- Chunking inteligente (1000 chars, 200 overlap)
- Similaridade de cosseno para ranking

---

## Stack Final Recomendada

| Componente | Tecnologia | Status |
|------------|------------|--------|
| Framework | Next.js 16 | ✅ Implementado |
| Auth | Firebase + Google | ✅ Implementado |
| Database | Prisma + SQLite | ✅ Implementado |
| State | Zustand | ✅ Implementado |
| LLM (dev) | z-ai-web-dev-sdk | ✅ Implementado |
| LLM (prod) | LiteLLM | 📋 Fase 2 |
| RAG | Embeddings locais | ✅ Implementado |
| Storage | Firebase Storage | 📋 Pendente |
| Vetores | Pinecone/Weaviate | 📋 Opcional |
