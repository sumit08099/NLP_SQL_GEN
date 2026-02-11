import streamlit as st
import database
import ai_engine

st.set_page_config(page_title="AI SQL Generator", layout="wide")

st.title("🤖 Natural Language to SQL Assistant")
st.write("Ask questions about your database in plain English!")

# Sidebar for Setup Check
with st.sidebar:
    st.header("Setup Status")
    if not database.get_db_connection():
        st.error("❌ Database not connected. Check .env")
    else:
        st.success("✅ Connected to Supabase")

# Main Interface
user_query = st.text_input("Enter your question:", placeholder="e.g., Show me all users who joined last month")

if st.button("Generate & Execute"):
    if user_query:
        with st.spinner("Analyzing schema and generating query..."):
            # 1. Fetch Schema
            schema = database.fetch_db_schema()
            
            # 2. Generate SQL
            sql = ai_engine.generate_sql(user_query, schema)
            
            st.subheader("Generated SQL")
            st.code(sql, language="sql")
            
            # 3. Execute Query
            results, columns_or_error = database.execute_query(sql)
            
            if results is not None:
                st.subheader("Results")
                st.table(results) # Or use st.dataframe for larger results
                
                # 4. Human Language Answer
                with st.spinner("Formatting answer..."):
                    answer = ai_engine.format_answer(user_query, results, columns_or_error)
                    st.success(answer)
            else:
                st.error(f"Execution Error: {columns_or_error}")
    else:
        st.warning("Please enter a question.")
