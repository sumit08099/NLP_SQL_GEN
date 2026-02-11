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

# Optional: Load your fine-tuned local model
# from transformers import T5Tokenizer, T5ForConditionalGeneration
# local_tokenizer = T5Tokenizer.from_pretrained("./fine_tuned_sql_model")
# local_model = T5ForConditionalGeneration.from_pretrained("./fine_tuned_sql_model")

# --- Node 1: Planner/SQL Generator ---
def sql_generator_node(state: AgentState):
    print("--- GENERATING SQL ---")
    
    # HYBRID LOGIC: 
    # If it's the first attempt, try the local model (to save Gemini costs)
    # If there's an error, use Gemini 2.0 Flash to "fix" it.
    
    if state.get('iteration_count', 0) == 0:
        print("Using Primary Engine (Gemini/Local)...")
        # Here you would call your local model inference:
        # input_text = f"translate English to SQL: {state['user_query']}"
        # ... generate SQL ...
        # For now, we use Gemini as the primary engine, but you can swap in local model here.
        
    prompt = f"""
    You are an expert PostgreSQL developer. 
    DATABASE SCHEMA:
    {state['db_schema']}
    
    USER QUESTION:
    {state['user_query']}
    
    PREVIOUS ERROR (if any):
    {state.get('error_message', 'None')}
    
    Generate ONLY the SQL query.
    """
    response = llm.invoke(prompt)
    return {"generated_sql": response.content.strip(), "iteration_count": state.get('iteration_count', 0) + 1}

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
