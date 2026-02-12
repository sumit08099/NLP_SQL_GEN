# 🤖 NLP SQL Master - Multi-Agent AI Data Analysis Platform

A next-generation **Natural Language to SQL (NL2SQL)** system that transforms plain English questions into complex SQL queries. Built with a **Multi-Agent Architecture** featuring Supervisor, Reasoning, and Reflection agents for intelligent, self-correcting query generation.

## 🌟 Key Features

### 🧠 Multi-Agent Intelligence
- **Supervisor Agent**: Analyzes query context, identifies relevant tables, and routes to specialized agents
- **Reasoning Agent**: Constructs complex SQL queries with JOINs, aggregations, and proper logic
- **Reflection Agent**: Validates SQL against schema, catches errors, and suggests improvements
- **Executor Agent**: Safely runs queries with automatic retry on failure
- **Formatter Agent**: Converts results into natural, conversational answers

### 📊 Data Ingestion
- Upload **CSV** or **Excel** files directly through the UI
- Automatic table creation in Supabase PostgreSQL
- Schema introspection for intelligent query generation
- Metadata tracking for dynamic tables

### 🎯 Advanced Query Handling
- **Ambiguity Resolution**: Handles queries without explicit table names
- **Multi-Table JOINs**: Automatically identifies foreign key relationships
- **Aggregations**: GROUP BY, COUNT, SUM, AVG with semantic understanding
- **Self-Correction**: Iterative refinement loop for perfect SQL generation

### � Modern Tech Stack
- **Frontend**: React 19 + Vite + TailwindCSS v4 (Glassmorphism UI)
- **Backend**: FastAPI + LangGraph + LangChain
- **AI Models**: Google Gemini 2.0 Flash (Thinking Mode) + Fine-tuned T5-Small
- **Database**: Supabase PostgreSQL with Alembic migrations
- **Deployment Ready**: Docker support, environment-based configuration

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      React Frontend                          │
│  (Data Upload, Chat Interface, Schema Explorer)             │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────┐
│                    FastAPI Backend                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Multi-Agent System (LangGraph)            │ │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────┐          │ │
│  │  │Supervisor│─▶│Reasoning │─▶│ Reflection │          │ │
│  │  └──────────┘  └──────────┘  └────────────┘          │ │
│  │       │              │              │                  │ │
│  │       └──────────────▼──────────────▼                 │ │
│  │              ┌──────────┐  ┌───────────┐              │ │
│  │              │ Executor │─▶│ Formatter │              │ │
│  │              └──────────┘  └───────────┘              │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL
┌──────────────────────▼──────────────────────────────────────┐
│              Supabase PostgreSQL Database                    │
│  (Users, Orders, Products + Dynamic CSV Tables)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** (for frontend)
- **Supabase Account** (free tier works)
- **Google Gemini API Key** ([Get it here](https://aistudio.google.com/apikey))

### 1. Clone & Setup Environment
```powershell
git clone https://github.com/sumit08099/NLP_SQL_GEN.git
cd NLP_SQL_GEN

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Configure Environment Variables
Create a `.env` file in the **root directory**:
```env
# Supabase Database
DATABASE_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT_ID]:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"

# Google Gemini API
GEMINI_API_KEY="YOUR_GEMINI_API_KEY_HERE"
```

### 3. Run Database Migrations
```powershell
cd backend
..\venv\Scripts\python -m alembic upgrade head
cd ..
```

### 4. Start the Application

**Terminal 1 - Backend:**
```powershell
.\venv\Scripts\python -m uvicorn backend.main:app --reload
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

**Access the app:** Open [http://localhost:5173](http://localhost:5173)

---

## � Usage Guide

### 1. Upload Your Data
- Click "Choose CSV/Excel" in the sidebar
- Select your file (supports `.csv`, `.xlsx`, `.xls`)
- Enter a table name (auto-suggested from filename)
- Click "Ingest Data"

### 2. Ask Questions
Examples:
- *"Show me the first 5 rows from the patients table"*
- *"What is the total revenue by product category?"*
- *"Which users have placed more than 3 orders?"*
- *"Join users and orders to show top 10 customers by spending"*

### 3. View Results
- **Generated SQL**: See the exact query the AI created
- **Execution Results**: View the data in a clean table format
- **Natural Answer**: Get a conversational summary of the results
- **Query Plan**: (Optional) See the reasoning behind the SQL
- **Reflection Notes**: (Optional) See validation feedback

---

## 🧪 Advanced Features

### Multi-Agent Workflow
The system uses a **state machine** approach:
1. **Supervisor** analyzes the query and identifies target tables
2. **Reasoning** creates a query plan and generates SQL
3. **Reflection** validates the SQL against the schema
4. If issues found → Loop back to **Reasoning** (max 2 iterations)
5. **Executor** runs the approved SQL
6. **Formatter** creates a human-readable answer

### Schema-Aware Intelligence
- Reads foreign key relationships for automatic JOINs
- Uses column comments for semantic matching
- Leverages indexes to identify important filtering columns
- Tracks dynamic CSV uploads in metadata table

### Error Handling
- Automatic retry with improved prompts on SQL errors
- Graceful degradation if agents fail
- Detailed error messages for debugging

---

## 📁 Project Structure

```
NLP_SQL_GEN/
├── backend/
│   ├── agent.py              # Legacy single-agent (T5 + Gemini hybrid)
│   ├── multi_agent.py        # New multi-agent system ⭐
│   ├── main.py               # FastAPI application
│   ├── database.py           # Supabase connection & queries
│   ├── models.py             # SQLAlchemy models with relationships
│   ├── ai_engine.py          # Gemini API wrapper
│   ├── train.py              # T5-Small training script
│   ├── alembic/              # Database migrations
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── index.css         # TailwindCSS v4 styles
│   │   └── main.jsx          # React entry point
│   ├── package.json          # Node dependencies
│   └── vite.config.js        # Vite configuration
├── .env                      # Environment variables (not in git)
├── .gitignore
├── README.md                 # This file
└── TRAINING_GUIDE.md         # ML model training guide
```

---

## 🎓 ML Training (Optional)

The system includes a **fine-tuned T5-Small model** trained on the **Spider Dataset**. To retrain:

1. Open `backend/train.py` in Google Colab (free T4 GPU)
2. Run all cells to download Spider dataset and train
3. Download the `fine_tuned_sql_model.zip` from Colab
4. Extract to `backend/fine_tuned_sql_model/`

See **TRAINING_GUIDE.md** for detailed instructions.

---

## � Security Best Practices

- ✅ All credentials stored in `.env` (excluded from git)
- ✅ CORS configured for frontend-backend communication
- ✅ SQL injection protection via parameterized queries
- ✅ Database connection pooling for performance
- ✅ Read-only mode recommended for production

---

## 🛠️ Tech Stack Details

| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend Framework | React | 19.2.0 |
| Build Tool | Vite | 7.3.1 |
| Styling | TailwindCSS | 4.1.18 |
| Backend Framework | FastAPI | Latest |
| AI Orchestration | LangGraph | Latest |
| LLM Integration | LangChain | Latest |
| AI Models | Gemini 2.0 Flash | Latest |
| Local ML | T5-Small (Fine-tuned) | - |
| Database | PostgreSQL (Supabase) | 15+ |
| ORM | SQLAlchemy | Latest |
| Migrations | Alembic | Latest |

---

## 🤝 Contributing

This is a student project for academic purposes. Contributions, suggestions, and feedback are welcome!

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👨‍💻 Author

**Sumit Karan**  
Computer Science Student  
Passionate about AI, NLP, and Full-Stack Development

---

## 🙏 Acknowledgments

- **Spider Dataset** - Yale University (NL2SQL benchmark)
- **Google Gemini** - Advanced reasoning capabilities
- **Supabase** - Managed PostgreSQL hosting
- **LangChain/LangGraph** - Agent orchestration framework