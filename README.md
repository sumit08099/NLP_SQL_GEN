# 🤖 AI-Powered NL2SQL Assistant

A professional-grade Natural Language to SQL (NL2SQL) system that converts plain English questions into valid PostgreSQL queries. This project uses a **Hybrid AI Architecture** combining a locally fine-tuned **T5-Small** model with **Gemini 2.0 Flash** for expert-level error correction.

## 🌟 Key Features
- **Natural Language Parsing**: Ask questions like *"Who are the top 5 users by purchase value?"*
- **Hybrid Engine**: Use a local ML model (Free/Fast) for simple queries and Gemini 2.0 Flash for complex self-correction.
- **Agentic Workflow**: Built with **LangGraph** to automatically fix SQL errors by analyzing database feedback.
- **Supabase Integration**: Direct connection to Supabase (PostgreSQL) for real-time data execution.
- **Interactive UI**: Built-in Streamlit dashboard for easy interaction.

## 🏗️ Technical Architecture
1. **Local ML Model**: T5-Small fine-tuned on the **Spider Dataset** (Gold Standard for NL2SQL).
2. **Orchestrator**: LangChain & LangGraph managing the "Generator -> Executor -> Debugger" loop.
3. **Database**: Supabase PostgreSQL with schema-aware prompting.

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.9+
- A Google Gemini API Key
- A Supabase Database connection string

### 2. Installation
```powershell
# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Configuration
Create a `.env` file in the root directory and add your credentials:
```env
DATABASE_URL="postgresql://postgres.[ID]:[PASSWORD]@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
```

### 4. Running the Assistant
#### Run the Agentic CLI:
```powershell
python agent.py
```

#### Run the Web UI:
```powershell
streamlit run app.py
```

---

## 📈 ML Training (Spider Dataset)
If you wish to re-train the core model:
1. Use the `train.py` script provided in this repository.
2. Training on a GPU (e.g., Google Colab T4) is highly recommended.
3. Place the resulting `fine_tuned_sql_model` folder in the project root.

Refer to `TRAINING_GUIDE.md` for detailed dataset links and training parameters.

---

## 🛡️ Security
- **Credentials**: Sensitive info is stored in `.env` and excluded via `.gitignore`.
- **Database Safety**: The system is read-mode-optimized by default to prevent accidental data modification.

## 👨‍💻 Author
**Sumit Karan**