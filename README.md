# 🚀 SynapseAI – Modular Agentic AI Platform

A production-ready, modular AI agent platform built using **FastAPI, LangGraph, Azure OpenAI, and Pinecone**.

SynapseAI combines conversational AI agents, Retrieval-Augmented Generation (RAG), long-term semantic memory, and streaming LLM responses into a scalable, containerized backend system.

This project demonstrates end-to-end AI system design — from backend architecture and vector databases to deployment, monitoring, and evaluation.

---

## 📌 Project Overview

SynapseAI was built to provide a scalable foundation for developing AI-powered applications with:

- 🤖 Conversational AI agents  
- 📚 Retrieval-Augmented Generation (RAG)  
- 🧠 Long-term semantic memory  
- 🔐 Secure authentication  
- ⚡ Real-time streaming responses  
- 📊 Observability and monitoring  
- 🐳 Containerized production deployment  

The system follows **service-oriented architecture principles**, enabling modular scaling and clean separation of concerns.

---

## 🏗️ System Architecture

```
User
  ↓
FastAPI Backend
  ↓
LangGraph Agent
  ↓
Azure OpenAI (LLM)
  ↓
Vector Database (Pinecone / pgvector)
  ↓
PostgreSQL (User & Session Data)
```

---

## 🧠 Core Components

### 1️⃣ AI Agent Workflow (LangGraph)

- State-driven agent execution  
- Tool calling and function execution  
- Conversational memory handling  
- Event-based flow control  
- Streaming and non-streaming responses  

LangGraph was used to maintain structured reasoning flow and state persistence.

---

### 2️⃣ Retrieval-Augmented Generation (RAG)

The RAG pipeline was implemented as follows:

1. Documents were ingested and split into chunks using `RecursiveCharacterTextSplitter`.
2. Chunks were converted into embeddings using OpenAI embedding models.
3. Embeddings were stored in **Pinecone**.
4. On user query:
   - Query was embedded.
   - Semantic similarity search retrieved relevant chunks.
   - Retrieved context was passed to the LLM.
   - A context-aware response was generated.

This significantly improved response accuracy and reduced hallucinations.

---

### 3️⃣ Long-Term Memory System

The long-term memory system was powered by:

- **pgvector** for semantic similarity search  
- **PostgreSQL** for structured storage  
- User-isolated memory collections  

Capabilities:

- Automatic memory extraction  
- Context-aware retrieval  
- Dynamic memory updates  

---

### 4️⃣ FastAPI Backend

The backend included:

- JWT-based authentication  
- Session management  
- Rate limiting  
- CORS configuration  
- Structured logging  
- Streaming LLM responses (NDJSON)  

API endpoints included:

- `/api/v1/auth/*`
- `/api/v1/chatbot/chat`
- `/api/v1/chatbot/chat/stream`
- `/health`
- `/metrics`

Swagger documentation available at:

```
http://localhost:8000/docs
```

---

### 5️⃣ LLM Integration

Integrated with Azure OpenAI models:

- GPT-4o  
- GPT-4o-mini  
- GPT-5 variants  

Features:

- Automatic retry logic (exponential backoff)  
- Configurable temperature & token limits  
- Environment-specific configurations  
- Fallback handling  

---

### 6️⃣ Observability & Monitoring

Monitoring stack included:

- 📈 Prometheus (metrics collection)  
- 📊 Grafana (dashboard visualization)  
- 🔎 Langfuse (LLM tracing)  
- Structured logging with request context  

Tracked metrics:

- API latency  
- Rate limiting stats  
- Database performance  
- Token usage  
- System resource utilization  

---

### 7️⃣ Model Evaluation Framework

An automated evaluation pipeline was implemented to measure LLM performance.

Features:

- Trace-based evaluation  
- Metric scoring  
- JSON report generation  
- Success/failure analysis  

Reports generated in:

```
evals/reports/
```

---

## 🛠️ Tech Stack

### 🔹 Backend
- Python  
- FastAPI  
- LangGraph  
- LangChain  

### 🔹 AI & Data
- Azure OpenAI  
- OpenAI Embeddings  
- Pinecone  
- PostgreSQL  
- pgvector  

### 🔹 DevOps
- Docker  
- Docker Compose  
- Azure Container Apps  

### 🔹 Monitoring
- Prometheus  
- Grafana  
- Langfuse  

---

## ⚙️ Setup Instructions

### 1️⃣ Clone Repository

```bash
git clone <your-repo-url>
cd synapseai
```

---

### 2️⃣ Create Environment File

Create a `.env` file:

```env
APP_ENV=development
OPENAI_API_KEY=your_openai_key
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=mydb
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
LANGFUSE_PUBLIC_KEY=your_key
LANGFUSE_SECRET_KEY=your_secret
SECRET_KEY=your_jwt_secret
```

---

### 3️⃣ Install Dependencies

```bash
uv sync
source .venv/bin/activate
```

---

### 4️⃣ Run Locally

```bash
make dev
```

Access Swagger UI:

```
http://localhost:8000/docs
```

---

## 🐳 Running with Docker

```bash
docker compose up --build
```

This launches:

- FastAPI backend  
- PostgreSQL  
- Prometheus  
- Grafana  

Monitoring URLs:

Prometheus:
```
http://localhost:9090
```

Grafana:
```
http://localhost:3000
```

Default credentials:

```
Username: admin
Password: admin
```

---

## 📊 Running Model Evaluation

```bash
make eval
```

Reports generated in:

```
evals/reports/
```

---

## 🔐 Security Features

- JWT authentication  
- Token expiration handling  
- Rate limiting  
- Input validation  
- CORS restrictions  
- Structured request logging  

---

## 🔮 Future Enhancements

- Multi-agent orchestration  
- Redis caching  
- Kubernetes deployment  
- CI/CD automation  
- Frontend dashboard  
- Horizontal scaling  

---

## 📌 Key Learnings

This project involved:

- Designing modular AI architecture  
- Implementing production-grade backend systems  
- Building RAG pipelines  
- Integrating vector databases  
- Deploying containerized services  
- Monitoring LLM systems in production  
- Evaluating AI system performance  

---

## 👨‍💻 Author

**Ramesh Sain**  
M.Tech CSE – Artificial Intelligence & Machine Learning  

---
