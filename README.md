# 🤖 NLP2SQL: Autonomous Data Intelligence Layer

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue?logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.109.0-059669?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Gemini](https://img.shields.io/badge/Google_GenAI-Gemini_2.0_Flash-orange?logo=google&logoColor=white)](https://aistudio.google.com/)
[![Hugging Face](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Models-yellow)](https://huggingface.co/Karan6124/t5-nl2sql-gen)

**NLP2SQL** is a professional-grade autonomous data intelligence platform that transforms Natural Language into precise PostgreSQL queries. Engineered for scale and precision, it utilizes a sophisticated **Multi-Agent Orchestration** model to navigate complex schemas, identify analytical trends, and self-heal from errors.

---

## 🚀 The Multi-Agent Intelligence Layer

Unlike simple NL2SQL scripts, this platform utilizes **LangGraph** to coordinate a team of specialized AI agents:

### 1. 🎯 Supervisor (Semantic Filter)
Acts as the project manager. It performs a **Semantic Schema Search** to identify the most relevant tables from your knowledge base, stripping away noise to keep the reasoning engine focused.

### 2. 🧠 Reasoning Architect (Two-Step Strategy)
Engineered for logic. It follows a **Two-Step Strategy**:
*   **Logic Path**: First, it plans the joints, filters, and aggregations in plain English.
*   **SQL Generation**: Only after the logic is sound does it generate the final PostgreSQL.

### 3. 🔍 Reflection Agent (Schema-Obsessed Auditor)
The code reviewer. It performs a strict **Hallucination Check**, verifying every column and table name against the actual DB schema before allowing execution.

### 4. ⚡ Executor (Self-Healing Loop)
Runs the code. If the database reports an error, the Executor captures the traceback and feeds it back into the Reasoning loop for an **Error-Aware Retry**.

### 5. 📝 Pro Formatter (Analytical Storytelling)
The data analyst. It doesn't just list rows—it performs **Analytical Storytelling**, identifying patterns, trends, and anomalies to answer the "Why" behind the data.

---

## 🌟 Advanced Features

*   **Hybrid Intelligence**: Seamlessly blends a local fine-tuned ML model with Gemini 2.0 Flash for maximum speed and accuracy.
*   **Semantic Knowledge Mapping**: Simply upload a CSV or Excel file, and the AI maps the entire schema into its neural memory instantly.
*   **Security Layer**: Enterprise-grade JWT authentication and bcrypt password encryption ensure your data remains isolated and secure.
*   **Premium Workspace**: A state-of-the-art glassmorphic UI featuring real-time AI thought visualization, technical detail expansion, and automated system clock synchronization.

---

## 🏗️ Technical Architecture

| Component | Technology |
|---|---|
| **Core Engine** | FastAPI (Python 3.11) |
| **Agentic Framework** | LangGraph / LangChain |
| **Primary LLM** | Google Gemini 2.0 Flash |
| **Local Model** | [Fine-tuned T5-Small](https://huggingface.co/Karan6124/t5-nl2sql-gen) |
| **Frontend** | React 19 + Framer Motion |
| **Styling** | Vanilla CSS + Tailwind v4 (Beta) |
| **Database** | PostgreSQL |

---

## 🚀 Rapid Deployment

### 1. Environment Configuration
Create a `.env` in the root directory:
```env
DATABASE_URL="postgresql://user:pass@host:5432/db"
GEMINI_API_KEY="your-key"
SECRET_KEY="your-jwt-secret"
```

### 2. Backend Initialization
```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

### 3. Frontend Initialization
```powershell
cd frontend
npm install
npm run dev
```

---

## 📄 License
Project developed for next-generation AI data analysis demo.

**Lead Engineers:** Sumit, Karan  
