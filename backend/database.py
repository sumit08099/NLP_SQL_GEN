import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    try:
        conn = psycopg2.connect(os.getenv("DATABASE_URL"))
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def fetch_db_schema():
    """
    Fetches the database schema (tables and columns) to provide context to Gemini.
    """
    conn = get_db_connection()
    if not conn:
        return "Could not connect to database."
    
    query = """
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'public'
    ORDER BY table_name;
    """
    
    with conn.cursor() as cur:
        cur.execute(query)
        rows = cur.fetchall()
    
    conn.close()
    
    schema_text = "Database Schema:\n"
    current_table = ""
    for table, col, dtype in rows:
        if table != current_table:
            schema_text += f"\nTable: {table}\n"
            current_table = table
        schema_text += f" - {col} ({dtype})\n"
    
    return schema_text

def execute_query(sql_query):
    """
    Executes the generated SQL query and returns the results.
    """
    conn = get_db_connection()
    if not conn:
        return None, "Database connection failed."
    
    try:
        with conn.cursor() as cur:
            cur.execute(sql_query)
            colnames = [desc[0] for desc in cur.description]
            results = cur.fetchall()
            return results, colnames
    except Exception as e:
        return None, str(e)
    finally:
        conn.close()
