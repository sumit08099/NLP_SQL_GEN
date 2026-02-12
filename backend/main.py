from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import os
import sys
from pathlib import Path
# Add current directory to path so database, agent, etc. can be imported
sys.path.append(str(Path(__file__).parent))

import database
import agent
import ai_engine
from typing import List

app = FastAPI(title="NL2SQL API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...), table_name: str = Form(...)):
    try:
        content = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.BytesIO(content))
        elif file.filename.endswith(('.xlsx', '.xls')):
            df = pd.read_excel(io.BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        success, message = database.ingest_dataframe(df, table_name)
        if not success:
            raise HTTPException(status_code=500, detail=message)
            
        return {"message": message, "table_name": table_name}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/schema")
async def get_schema():
    return {"schema": database.fetch_db_schema()}

@app.post("/chat")
async def chat(query: str = Form(...)):
    try:
        # 1. Fetch Schema
        schema = database.fetch_db_schema()
        
        # 2. Run the Agent (Hybrid Local T5 + Gemini)
        # We reuse the run_nl2sql_agent function from agent.py
        initial_state = {
            "user_query": query,
            "db_schema": schema,
            "iteration_count": 0
        }
        
        # Invoke the LangGraph app
        result = agent.app.invoke(initial_state)
        
        return {
            "answer": result['final_answer'],
            "sql": result.get('generated_sql'),
            "data": result.get('query_results')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
