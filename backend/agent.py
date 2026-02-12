import os
from typing import Annotated, TypedDict, List
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
import database # Our existing database logic

load_dotenv()

# Define the State for our Agent
class AgentState(TypedDict):
    user_query: str
    db_schema: str
    generated_sql: str
    query_results: List
    error_message: str
    iteration_count: int
    final_answer: str

# Initialize the LLM (Gemini 2.0 Flash)
llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=os.getenv("GEMINI_API_KEY"))

# Load your fine-tuned local model
from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch

try:
    print("🤖 Loading Local ML Model...")
    # Get the directory where agent.py is located
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, "fine_tuned_sql_model")
    
    local_tokenizer = T5Tokenizer.from_pretrained(model_path)
    local_model = T5ForConditionalGeneration.from_pretrained(model_path)
    LOCAL_MODEL_READY = True
except Exception as e:
    print(f"⚠️ Local model not found or error loading: {e}")
    LOCAL_MODEL_READY = False

# --- Node 1: Planner/SQL Generator ---
def sql_generator_node(state: AgentState):
    print("--- GENERATING SQL ---")
    
    # HYBRID LOGIC: 
    # Attempt 1: Try Local ML Model (Free)
    # Attempt 2+: Use Gemini 2.0 Flash (Expert Fixer)
    
    if state.get('iteration_count', 0) == 0 and LOCAL_MODEL_READY:
        print("Using Local T5 Model (Primary Attempt)...")
        input_text = f"translate English to SQL: {state['user_query']} | Schema: {state['db_schema']}"
        inputs = local_tokenizer(input_text, return_tensors="pt", max_length=512, truncation=True)
        
        with torch.no_grad():
            outputs = local_model.generate(**inputs, max_length=512)
        
        generated_sql = local_tokenizer.decode(outputs[0], skip_special_tokens=True)
        print(f"Local Model Output: {generated_sql}")
        
    else:
        print("Using Gemini 2.0 Flash (Expert Correction)...")
        prompt = f"""
        You are an expert PostgreSQL developer. 
        DATABASE SCHEMA:
        {state['db_schema']}
        
        USER QUESTION:
        {state['user_query']}
        
        PREVIOUS ERROR (if any):
        {state.get('error_message', 'None')}
        
        Generate ONLY the SQL query. No markdown formatting.
        """
        response = llm.invoke(prompt)
        generated_sql = response.content.strip()

    return {"generated_sql": generated_sql, "iteration_count": state.get('iteration_count', 0) + 1}

# --- Node 2: Database Executor ---
def db_executor_node(state: AgentState):
    print("--- EXECUTING SQL ---")
    results, error = database.execute_query(state['generated_sql'])
    
    if error:
        return {"error_message": error, "query_results": None}
    return {"query_results": results, "error_message": None}

# --- Node 3: Definer/Answer Formatter ---
def answer_formatter_node(state: AgentState):
    print("--- FORMATTING ANSWER ---")
    prompt = f"""
    User Question: {state['user_query']}
    SQL Used: {state['generated_sql']}
    Data Results: {state['query_results']}
    
    Based on this data, provide a clear and concise natural language answer to the user.
    """
    response = llm.invoke(prompt)
    return {"final_answer": response.content}

# --- Router Logic ---
def should_continue(state: AgentState):
    # If there is an error and we haven't tried too many times, go back to SQL generation
    if state.get('error_message') and state.get('iteration_count', 0) < 3:
        print(f"--- ERROR DETECTED: {state['error_message']} (Retrying...) ---")
        return "generate_sql"
    return "format_answer"

# --- Building the Graph ---
workflow = StateGraph(AgentState)

workflow.add_node("generate_sql", sql_generator_node)
workflow.add_node("execute_db", db_executor_node)
workflow.add_node("format_answer", answer_formatter_node)

workflow.set_entry_point("generate_sql")
workflow.add_edge("generate_sql", "execute_db")

workflow.add_conditional_edges(
    "execute_db",
    should_continue,
    {
        "generate_sql": "generate_sql", # Loop back to fix SQL
        "format_answer": "format_answer" # Move forward to result
    }
)

workflow.add_edge("format_answer", END)

# Compile the Graph
app = workflow.compile()

def run_nl2sql_agent(query: str):
    schema = database.fetch_db_schema()
    initial_state = {
        "user_query": query,
        "db_schema": schema,
        "iteration_count": 0
    }
    
    result = app.invoke(initial_state)
    return result['final_answer']

if __name__ == "__main__":
    test_query = "Who are the top 5 users by creation date?"
    print(run_nl2sql_agent(test_query))
