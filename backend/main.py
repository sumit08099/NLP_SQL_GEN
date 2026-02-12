from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import auth
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import Annotated
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

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

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

# ============================================================================
# AUTH ENDPOINTS
# ============================================================================

@app.post("/signup")
async def signup(username: str = Form(...), email: str = Form(...), password: str = Form(...)):
    hashed_pass = auth.get_password_hash(password)
    # Note: In a real app, you'd save this to your Supabase Users table
    # For now, we simulate success
    return {"message": "User created successfully"}

@app.post("/login")
async def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    # Simulation: In real life, fetch user from DB and verify_password
    access_token = auth.create_access_token(data={"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/chat")
async def chat(query: str = Form(...), token: Annotated[str, Depends(oauth2_scheme)] = None):
    try:
        # Verify Token
        if not auth.decode_token(token):
             raise HTTPException(status_code=401, detail="Invalid session")
             
        # 1. Fetch Schema
        schema = database.fetch_db_schema()
        
        # 2. Run the Multi-Agent System (Supervisor -> Reasoning -> Reflection)
        import multi_agent
        
        result = multi_agent.run_multi_agent_query(query, schema)
        
        return {
            "answer": result['final_answer'],
            "sql": result.get('generated_sql'),
            "data": result.get('query_results'),
            "plan": result.get('query_plan'),  # Show the reasoning
            "reflection": result.get('reflection_notes')  # Show validation feedback
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
