import os
import re
import psycopg2
import pandas as pd
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
from models import DynamicTable, Base

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

def ingest_dataframe(df, table_name, user_id, original_filename=None):
    """
    Ingests a pandas DataFrame into Supabase and records metadata.
    """
    engine = get_sqlalchemy_engine()
    session = get_db_session()
    try:
        # 1. Upload the raw data
        df.to_sql(table_name, engine, if_exists='replace', index=False)
        
        # 2. Record/Update metadata in dynamic_tables
        columns_info = json.dumps(df.dtypes.apply(lambda x: str(x)).to_dict())
        row_count = len(df)
        
        existing = session.query(DynamicTable).filter(DynamicTable.table_name == table_name).first()
        if existing:
            existing.user_id = user_id
            existing.original_filename = original_filename or existing.original_filename
            existing.columns_info = columns_info
            existing.row_count = row_count
        else:
            new_meta = DynamicTable(
                user_id=user_id,
                table_name=table_name,
                original_filename=original_filename,
                columns_info=columns_info,
                row_count=row_count
            )
            session.add(new_meta)
        
        session.commit()
        return True, f"Table '{table_name}' ingested and mapped to NLP2SQL knowledge base."
    except Exception as e:
        session.rollback()
        return False, str(e)
    finally:
        session.close()

def fetch_db_schema(user_id=None):
    """
    Fetches the database schema filtered by user ownership.
    """
    conn = get_db_connection()
    if not conn:
        return "Could not connect to database."
    
    # Only get tables that are either in DynamicTable for this user OR standard public symbols
    # However, for NL2SQL on user data, we primarily care about their dynamic tables.
    session = get_db_session()
    try:
        user_tables = session.query(DynamicTable.table_name).filter(DynamicTable.user_id == user_id).all()
        user_table_list = [t[0] for t in user_tables]
        
        if not user_table_list:
            return "No user-uploaded tables found. Please upload data to begin."

        # Filter information_schema by these specific tables
        placeholders = ', '.join(["%s"] * len(user_table_list))
        query = f"""
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name IN ({placeholders})
        ORDER BY table_name;
        """
        
        with conn.cursor() as cur:
            cur.execute(query, user_table_list)
            rows = cur.fetchall()
    finally:
        session.close()
        conn.close()
    
    schema_text = "Your Knowledge Base (Uploaded Tables):\n"
    current_table = ""
    for table, col, dtype in rows:
        if table != current_table:
            schema_text += f"\nTable: {table}\n"
            current_table = table
        schema_text += f" - {col} ({dtype})\n"
    
    return schema_text

def get_table_profile(table_name):
    """Returns the first 3 rows of a table as a dictionary string for semantic understanding."""
    conn = get_db_connection()
    if not conn: return ""
    try:
        with conn.cursor() as cur:
            # Wrap table name in double quotes for safety
            cur.execute(f'SELECT * FROM "{table_name}" LIMIT 3')
            colnames = [desc[0] for desc in cur.description]
            results = cur.fetchall()
            sample = [dict(zip(colnames, row)) for row in results]
            return json.dumps(sample, default=str)
    except:
        return ""
    finally:
        conn.close()

def execute_query(sql_query, user_id=None):
    """
    Executes the generated SQL query and returns the results.
    Supports multiple statements.
    Returns: List of {"rows": [], "columns": []} or (None, error_msg)
    """
    conn = get_db_connection()
    if not conn:
        return None, "Database connection failed."
    
    # SECURITY: Parse query for tables and check against DynamicTable
    if user_id:
        session = get_db_session()
        user_tables = session.query(DynamicTable.table_name).filter(DynamicTable.user_id == user_id).all()
        user_table_list = [t[0].lower() for t in user_tables]
        session.close()

        used_tables = re.findall(r'FROM\s+"?(\w+)"?|JOIN\s+"?(\w+)"?', sql_query, re.IGNORECASE)
        flat_used = [t for tup in used_tables for t in tup if t]
        
        for ut in flat_used:
            if ut.lower() not in user_table_list and ut.lower() not in ['users', 'products', 'orders']:
                 return None, f"Security Violation: Access denied to table '{ut}'."

    try:
        all_results = []
        with conn.cursor() as cur:
            # 1. Clean and split the query by semicolon (basic splitting)
            # This handles most AI-generated multi-statement queries
            statements = [s.strip() for s in sql_query.split(';') if s.strip()]
            
            for statement in statements:
                cur.execute(statement)
                if cur.description:
                    colnames = [desc[0] for desc in cur.description]
                    rows = cur.fetchall()
                    all_results.append({
                        "columns": colnames,
                        "rows": rows
                    })
            
            if not all_results:
                return [], "" # No rows returned but successful
                
            return all_results, ""
    except Exception as e:
        return None, str(e)
    finally:
        conn.close()
