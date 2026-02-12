import streamlit as st
import pandas as pd
import database
import ai_engine
import os

st.set_page_config(page_title="Data Insights AI", layout="wide", page_icon="📊")

# Custom CSS for chat-like experience
st.markdown("""
<style>
    .reportview-container {
        background: #f0f2f6;
    }
    .stTextInput > div > div > input {
        border-radius: 20px;
    }
    .stButton > button {
        border-radius: 20px;
        width: 100%;
    }
</style>
""", unsafe_allow_html=True)

st.title("📊 Data Insights AI")
st.subheader("Upload your data and ask questions in plain English")

# --- STEP 1: UPLOAD SECTION ---
with st.sidebar:
    st.header("📂 Data Source")
    uploaded_file = st.file_uploader("Upload CSV or Excel", type=["csv", "xlsx", "xls"])
    
    if uploaded_file is not None:
        try:
            if uploaded_file.name.endswith('.csv'):
                df = pd.read_csv(uploaded_file)
            else:
                df = pd.read_excel(uploaded_file)
            
            st.success(f"Successfully loaded: {uploaded_file.name}")
            st.write(f"Rows: {df.shape[0]}, Columns: {df.shape[1]}")
            
            table_name = st.text_input("Database Table Name", value=os.path.splitext(uploaded_file.name)[0].replace(" ", "_").lower())
            
            if st.button("🚀 Process & Ingest"):
                with st.spinner("Ingesting data to database..."):
                    success, message = database.ingest_dataframe(df, table_name)
                    if success:
                        st.success(f"✅ {message}")
                        st.session_state['current_table'] = table_name
                    else:
                        st.error(f"❌ {message}")
        except Exception as e:
            st.error(f"Error reading file: {e}")

    st.divider()
    st.header("⚙️ System Status")
    if not database.get_db_connection():
        st.error("❌ Database not connected")
    else:
        st.success("✅ Connected to Supabase")

# --- STEP 2: CHAT INTERFACE ---
st.divider()

if 'chat_history' not in st.session_state:
    st.session_state['chat_history'] = []

# Display current schema status
schema = database.fetch_db_schema()
if "Table:" in schema:
    st.info(f"Available Tables: {', '.join([t.split(':')[1].strip() for t in schema.splitlines() if 'Table:' in t])}")
else:
    st.warning("No tables found in database. Please upload data first.")

user_query = st.chat_input("Ask a question about your data...")

if user_query:
    # Add user message to history
    st.session_state['chat_history'].append({"role": "user", "content": user_query})
    
    with st.spinner("Generating Insights..."):
        # 1. Fetch Schema
        schema = database.fetch_db_schema()
        
        # 2. Generate SQL (Using our Hybrid Engine)
        sql = ai_engine.generate_sql(user_query, schema)
        
        # 3. Execute Query
        results, columns_or_error = database.execute_query(sql)
        
        if results is not None:
            # 4. Human Language Answer
            answer = ai_engine.format_answer(user_query, results, columns_or_error)
            st.session_state['chat_history'].append({
                "role": "assistant", 
                "content": answer,
                "sql": sql,
                "data": results
            })
        else:
            st.session_state['chat_history'].append({
                "role": "assistant", 
                "content": f"Sorry, I ran into an error: {columns_or_error}",
                "sql": sql
            })

# Display Chat History
for msg in st.session_state['chat_history']:
    with st.chat_message(msg["role"]):
        st.write(msg["content"])
        if "sql" in msg:
            with st.expander("View SQL Query"):
                st.code(msg["sql"], language="sql")
        if "data" in msg:
            with st.expander("View Raw Data"):
                st.table(msg["data"])
