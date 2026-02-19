# PiriDocs

Assistente jurídico com IA especializado em **Direito da Saúde Suplementar** e regulação da ANS. Faça upload de documentos PDF e consulte a Piri, uma advogada sênior virtual fundamentada na legislação (Lei 9.656, RNs da ANS).

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 14 (App Router) |
| Auth | Firebase Authentication |
| Banco de dados / Vector Store | Firestore (vector search nativo) |
| LLM | Vertex AI — Gemini 1.5 Pro |
| Embeddings | Vertex AI — text-embedding-004 |
| PDF | pdf-parse |
| Estilização | Tailwind CSS |

## Pré-requisitos

- Node.js 18+
- Projeto no [Firebase Console](https://console.firebase.google.com)
- Projeto no [Google Cloud](https://console.cloud.google.com) com as APIs habilitadas:
  - Vertex AI API
  - Cloud Firestore API

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

Preencha `.env.local` com as credenciais do Firebase e do Google Cloud (veja comentários no arquivo).

### 3. Configurar Firebase

No [Console Firebase](https://console.firebase.google.com):

1. **Authentication** → Habilitar provedor **Email/Senha**
2. **Firestore Database** → Criar banco em modo **produção**

### 4. Criar índice vetorial no Firestore

No [Console GCP](https://console.cloud.google.com) → Firestore → Índices, crie:

| Campo | Configuração |
|---|---|
| Coleção | `document_chunks` |
| Campo | `embedding` |
| Dimensão | `768` |
| Métrica | `COSINE` |

Ou via CLI:

```bash
gcloud firestore indexes composite create \
  --collection-group=document_chunks \
  --field-config field-path=embedding,vector-config='{"dimension":"768","flat": "{}"}' \
  --field-config field-path=notebook_id,order=ASCENDING
```

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
/dashboard  →  listar / criar notebooks (Firestore)
/notebook/[id]  →  upload PDF  →  chunks + embeddings (Vertex AI)  →  Firestore
               →  chat  →  findNearest (COSINE)  →  Gemini 1.5 Pro  →  resposta jurídica
```

## Coleções Firestore

### `notebooks`
| Campo | Tipo |
|---|---|
| `title` | string |
| `user_id` | string |
| `created_at` | timestamp |

### `document_chunks`
| Campo | Tipo |
|---|---|
| `content` | string |
| `metadata` | map |
| `notebook_id` | string |
| `embedding` | vector (dim 768) |
| `created_at` | timestamp |

## Deploy (Cloud Run)

Em Cloud Run, as credenciais Vertex AI são automáticas via **Workload Identity** — não é necessário `GOOGLE_APPLICATION_CREDENTIALS`. Basta garantir que a service account do Cloud Run tenha os papéis:

- `roles/aiplatform.user`
- `roles/datastore.user`
- `roles/firebase.sdkAdminServiceAgent`
