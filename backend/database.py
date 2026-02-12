import os
import psycopg2
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

def get_db_session():
    engine = get_sqlalchemy_engine()
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return SessionLocal()

def get_db_connection():
    try:
        url = os.getenv("DATABASE_URL")
        # psycopg2 doesn't always support the pgbouncer=true query param in the URI
        if url and "pgbouncer=true" in url:
            url = url.replace("?pgbouncer=true", "")
        conn = psycopg2.connect(url)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def get_sqlalchemy_engine():
    url = os.getenv("DATABASE_URL")
    if url and "pgbouncer=true" in url:
        url = url.replace("?pgbouncer=true", "")
    return create_engine(url)

def ingest_dataframe(df, table_name):
    """
    Ingests a pandas DataFrame into Supabase as a new table.
    """
    engine = get_sqlalchemy_engine()
    try:
        df.to_sql(table_name, engine, if_exists='replace', index=False)
        return True, f"Table '{table_name}' created/updated successfully."
    except Exception as e:
        return False, str(e)

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
