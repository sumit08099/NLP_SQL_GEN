import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def generate_sql(user_prompt, schema_context):
    """
    Uses Gemini 2.0 Flash to convert Natural Language to SQL.
    """
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    full_prompt = f"""
    You are an expert SQL assistant. Your task is to convert the following user question into a valid PostgreSQL query based on the provided database schema.
    
    {schema_context}
    
    User Question: {user_prompt}
    
    Important:
    1. Only return the SQL query. Do not include any explanation or markdown formatting (no ```sql).
    2. Ensure the query is compatible with PostgreSQL.
    3. If the question cannot be answered by the schema, state that.
    """
    
    response = model.generate_content(full_prompt)
    return response.text.strip()

def format_answer(user_prompt, results, columns):
    """
    Takes the SQL results and formats them into a human-readable answer using Gemini.
    """
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    data_str = str([dict(zip(columns, row)) for row in results])
    
    full_prompt = f"""
    Based on the following user question and the data retrieved from the database, provide a friendly and clear human-language answer.
    
    User Question: {user_prompt}
    Retrieved Data: {data_str}
    
    Answer:
    """
    
    response = model.generate_content(full_prompt)
    return response.text.strip()
