# PiriDocs

Assistente jurídico com IA especializado em **Direito da Saúde Suplementar** e regulação da ANS. Faça upload de documentos PDF e consulte a Piri, uma advogada sênior virtual fundamentada na legislação (Lei 9.656, RNs da ANS).

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth | Firebase Authentication |
| Banco de dados | Firestore |
| LLM | Vertex AI — Gemini 1.5 Flash |
| PDF | pdf-parse |
| Estilização | Tailwind CSS |

## Por que sem RAG vetorial?

Documentos jurídicos típicos (contratos ANS, RNs, pareceres) têm entre 20 e 200 páginas, equivalentes a 10K–100K tokens. O **Gemini 1.5 Flash possui janela de contexto de 1 milhão de tokens**, o suficiente para enviar o documento inteiro a cada consulta.

Isso elimina a necessidade de chunking, embeddings e busca vetorial — reduzindo complexidade e latência — e permite que a Piri cite páginas com precisão (`[Fonte: Arquivo, Pág X]`).

> Se o volume de documentos por notebook crescer a ponto de exceder o contexto disponível, o passo natural é adicionar RAG com Vertex AI Vector Search.

## Pré-requisitos

- Node.js 18+
- Projeto no [Firebase Console](https://console.firebase.google.com)
- Projeto no [Google Cloud](https://console.cloud.google.com) com as APIs habilitadas:
  - **Vertex AI API**
  - **Cloud Firestore API**

## Setup

### 1. Clonar e instalar dependências

```bash
git clone <repo>
cd PiriDocs
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Preencha `.env.local` com as credenciais do Firebase e do Google Cloud.

### 3. Configurar Firebase

No [Console Firebase](https://console.firebase.google.com):

1. **Authentication** → Habilitar provedor **Email/Senha**
2. **Firestore Database** → Criar banco em modo **produção**

### 4. Criar índices compostos no Firestore

Na coleção `document_pages`, crie dois índices compostos (o console solicitará automaticamente ao executar as primeiras queries):

| Campos | Ordem |
|---|---|
| `notebook_id` ASC + `filename` ASC + `page_num` ASC | Crescente |

### 5. Credenciais Vertex AI (desenvolvimento local)

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT=seu-projeto-id
```

### 6. Rodar localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Fluxo da aplicação

```
/login  →  Firebase Auth  →  cookie httpOnly (firebase-token)  →  /dashboard
/dashboard  →  listar / criar notebooks (Firestore: notebooks)
/notebook/[id]  →  upload PDF  →  páginas extraídas  →  Firestore (document_pages)
               →  chat  →  todas as páginas do notebook  →  Gemini 1.5 Flash  →  resposta jurídica
```

## Coleções Firestore

### `notebooks`
| Campo | Tipo |
|---|---|
| `title` | string |
| `user_id` | string |
| `created_at` | timestamp |

### `document_pages`
| Campo | Tipo |
|---|---|
| `notebook_id` | string |
| `filename` | string |
| `page_num` | number |
| `text` | string |
| `created_at` | timestamp |

## Deploy (Cloud Run)

Em Cloud Run, as credenciais Vertex AI são automáticas via **Workload Identity**. A service account do Cloud Run precisa dos papéis:

- `roles/aiplatform.user`
- `roles/datastore.user`
- `roles/firebase.sdkAdminServiceAgent`
