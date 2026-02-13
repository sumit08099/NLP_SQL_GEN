# 🤖 NLP SQL Master - Multi-Agent AI Data Analysis Platform

A professional-grade **Natural Language to SQL (NL2SQL)** system that transforms plain English questions into complex SQL queries. Built with a **Multi-Agent Architecture** and a **Hybrid Intelligence** model.

## 🌟 What's New
- **Hybrid Intelligence**: Combines a local fine-tuned T5-Small model with Gemini 2.0 Flash for cost-effective, high-accuracy reasoning.
- **Multi-Agent Orchestration**: Features specialized agents (Supervisor, Reasoning, Reflection) working in a self-correcting loop.
- **Enterprise Security**: Full JWT authentication layer with hashed passwords and protected API nodes.
- **Workspace UI**: A premium, glassmorphic React 19 interface with real-time AI chain visibility.

## 🌟 Key Features

### 🧠 Multi-Agent intelligence
- **Supervisor Agent**: Analyzes query intent and maps it to specific knowledge kernels (tables).
- **Reasoning Agent (Hybrid)**: First consults the local ML model, then uses Gemini to architect the final PostgreSQL query.
- **Reflection Agent**: A "code reviewer" that validates SQL against the schema to catch potential errors before execution.
- **Self-Correction**: Automatically retries and fixes queries if the database reports an error.

### 🛡️ Security & Privacy
- **JWT Authentication**: Secure login/signup flow to protect your data sources.
- **Encrypted Storage**: Passwords hashed with `bcrypt`.
- **Environment Isolation**: API keys and database credentials strictly managed via `.env`.

### 📊 Data & Ingestion
- Upload **CSV** or **Excel** files; the AI learns the schema instantly.
- **Natural Language Answers**: No need to read raw rows; the AI summarizes the findings for you.
- **AI Chain Logs**: Watch the AI's "thought process" with a collapsible technical breakdown.

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite, Tailwind v4, Framer Motion |
| **Backend** | FastAPI, LangGraph, SQLAlchemy |
| **AI Models** | Google Gemini 2.0 Flash, Local T5-Small |
| **Database** | PostgreSQL (Supabase), Alembic Migrations |

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.11+
- Node.js 18+
- [Supabase](https://supabase.com/) Account
- [Google Gemini API Key](https://aistudio.google.com/)

### 2. Setup
```powershell
# Clone the repository
git clone https://github.com/sumit08099/NLP_SQL_GEN.git
cd NLP_SQL_GEN

# Setup Backend Environment
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Setup Frontend
cd ../frontend
npm install
```

### 3. Environment Variables
Create a `.env` in the root:
```env
DATABASE_URL="your-supabase-connection-string"
DIRECT_URL="your-supabase-direct-url"
GEMINI_API_KEY="your-api-key"
SECRET_KEY="your-random-secure-key"
```

### 4. Initialize & Run
```powershell
# In Backend folder: Run Migrations
alembic upgrade head

# Start Backend
# Start Backend
python main.py
# Or for hot-reloading:
uvicorn main:app --reload

# Start Frontend (In frontend folder)
npm run dev
```

---
**Author:** Sumit Karan  
*Engineering a smarter way to talk to data.*