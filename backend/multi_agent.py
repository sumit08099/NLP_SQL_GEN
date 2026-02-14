"""
Multi-Agent System for NL2SQL
Architecture: Supervisor -> Reasoning -> Reflection -> Executor -> Formatter
Using Official Google GenAI SDK (google-genai) for direct model access.
HYBRID APPROACH: Local T5 Model (Primary) + Gemini 2.0 Flash (Expert Architect)
"""
import os
import json
import re
from typing import TypedDict, List, Literal, Annotated
from dotenv import load_dotenv
from google import genai
from langgraph.graph import StateGraph, END
import database
import agent_memory
from transformers import T5Tokenizer, T5ForConditionalGeneration
import torch

load_dotenv()

# Initialize the Official Google GenAI Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Use the model that WE CONFIRMED worked in test_models.py
MODEL_ID = "gemini-2.0-flash" 

# ============================================================================
# LOCAL ML MODEL INITIALIZATION (Hybrid Search)
# ============================================================================
LOCAL_MODEL_READY = False
try:
    print("🤖 Loading Local ML Model (T5-Small)...")
    current_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(current_dir, "fine_tuned_sql_model")
    
    local_tokenizer = T5Tokenizer.from_pretrained(model_path)
    local_model = T5ForConditionalGeneration.from_pretrained(model_path)
    LOCAL_MODEL_READY = True
    print("✅ Local Model Loaded and Ready.")
except Exception as e:
    print(f"⚠️ Local model not loaded: {e}")

# ============================================================================
# STATE DEFINITION
# ============================================================================
class MultiAgentState(TypedDict):
    """Shared state across all agents"""
    user_query: str
    db_schema: str
    available_tables: List[str]
    target_tables: List[str]
    query_type: str
    query_plan: str
    generated_sql: str
    reflection_notes: str
    query_results: List
    query_columns: List[str]
    error_message: str
    iteration_count: int
    final_answer: str
    next_agent: str
    is_ambiguous: bool
    potential_matches: List[str]
    user_id: int
    last_failed_sql: str  # For Error-Aware Retries

# ============================================================================
# AGENT 1: SUPERVISOR
# ============================================================================
def supervisor_agent(state: MultiAgentState) -> MultiAgentState:
    print("🎯 SUPERVISOR: Analyzing query context (Semantic Search)...")
    
    if "No user-uploaded tables found" in state['db_schema']:
        state['final_answer'] = "Protocol Interrupted: No active knowledge base detected. Please upload data so I can initialize your neural data layer."
        state['next_agent'] = END
        return state

    # SEMANTIC PRE-FILTER: Extract all table names and their column headers
    user_tables = re.findall(r"Table:\s*(\w+)", state['db_schema'], re.IGNORECASE)
    
    prompt = f"""You are a SQL Architect Supervisor.
Analyze this request: "{state['user_query']}"
AVAILABLE TABLES: {user_tables}
SCHEMA DETAILS:
{state['db_schema']}

TASK:
1. Identify target tables.
2. Determine if the query is ambiguous.
3. SEMANTIC FILTER: If many tables exist, only select the ones that contain keywords relevant to the query.

Return JSON ONLY:
{{
    "target_tables": ["table1"],
    "query_type": "single|join|aggregation",
    "is_ambiguous": true/false,
    "confidence_score": 0.0-1.0,
    "reasoning": "Brief explanation"
}}
"""
    
    try:
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        text = response.text
        json_match = re.search(r'\{.*\}', text, re.DOTALL)
        data = json.loads(json_match.group(0)) if json_match else {"target_tables": [], "is_ambiguous": True}
        
        state['target_tables'] = data.get("target_tables", [])
        state['query_type'] = data.get("query_type", "single")
        state['is_ambiguous'] = data.get("is_ambiguous", False)

        # FALLBACK: If AI missed it but keywords match, force it
        if not state['target_tables']:
            for table in user_tables:
                if table.lower() in state['user_query'].lower():
                    state['target_tables'] = [table]
                    state['is_ambiguous'] = False
                    break

        if state['is_ambiguous'] and len(user_tables) > 1:
            state['potential_matches'] = user_tables
            state['next_agent'] = "END"
            return state

        # ENHANCE SCHEMA: Strip irrelevant tables from schema to reduce noise (Semantic Schema Search)
        if state['target_tables']:
            filtered_schema = "RELEVANT SCHEMA SECTIONS:\n"
            for t in state['target_tables']:
                # Extract the table block using regex
                match = re.search(f"Table: {t}\n( - .*\n)+", state['db_schema'], re.IGNORECASE)
                if match:
                    filtered_schema += match.group(0) + "\n"
            state['db_schema'] = filtered_schema

        state['next_agent'] = "reasoning"
    except Exception as e:
        print(f"⚠️ Supervisor Error: {e}")
        state['next_agent'] = "reasoning"
    
    return state

# ============================================================================
# AGENT 2: REASONING (Hybrid: Local + Gemini)
# ============================================================================
def reasoning_agent(state: MultiAgentState) -> MultiAgentState:
    print("🧠 REASONING: Building query plan (Two-Step)...")
    
    # Error-Aware Retry Logic
    error_feedback = ""
    if state['error_message']:
        error_feedback = f"""
❌ PREVIOUS ATTEMPT FAILED:
SQL: {state.get('last_failed_sql', 'Unknown')}
ERROR: {state['error_message']}
GUIDANCE: Analyze why the previous SQL failed. Was it a missing column? A syntax error? Correct it now."""

    prompt = f"""You are a Senior SQL Architect. 
TASK: Convert the user's request into a valid PostgreSQL query.

USER REQUEST: {state['user_query']}
TARGET TABLES: {state.get('target_tables', [])}
SCHEMA CONTEXT:
{state['db_schema']}
{error_feedback}

TWO-STEP INSTRUCTIONS:
1. LOGIC PATH: Explain which tables you will join and which columns you will filter.
2. SQL GENERATION: Write the final query. Use double quotes for all identifiers (e.g. "Table_Name"."Column").

Format:
LOGIC_PATH: [Step-by-step logic]
SQL: [Your PostgreSQL Query]
"""

    try:
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        content = response.text
        
        if "SQL:" in content:
            state['query_plan'] = content.split("SQL:")[0].replace("LOGIC_PATH:", "").strip()
            sql_block = content.split("SQL:")[1].strip()
            state['generated_sql'] = re.sub(r'```sql\n?|```', '', sql_block).strip()
        else:
            state['generated_sql'] = content.strip()
            
    except Exception as e:
        print(f"⚠️ Reasoning Error: {e}")
        state['error_message'] = f"Reasoning Error: {str(e)}"
    
    state['next_agent'] = "reflection"
    return state

# ============================================================================
# AGENT 3: REFLECTION
# ============================================================================
def reflection_agent(state: MultiAgentState) -> MultiAgentState:
    print("🔍 REFLECTION: Schema-Obsessed Validation...")
    
    if not state.get('generated_sql'):
        state['next_agent'] = "reasoning"
        return state
        
    prompt = f"""You are a Senior Database Auditor.
TASK: Perform a strict validation of the generated SQL against the actual schema.

USER INTENT: {state['user_query']}
SQL TO VERIFY: {state['generated_sql']}
LEGAL SCHEMA:
{state['db_schema']}

CRITICAL CHECKS:
1. HALLUCINATION CHECK: Are ALL column names present in the LEGAl SCHEMA?
2. TABLE CHECK: Are the table names strictly matching the schema?
3. LOGIC CHECK: Does the SQL actually answer the user query?

Return:
STATUS: APPROVED | NEEDS_REVISION
CRITIQUE: If rejected, explain EXACTLY which column or table name is hallucinated or missing."""

    try:
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        feedback = response.text
        state['reflection_notes'] = feedback
        
        if "NEEDS_REVISION" in feedback and state['iteration_count'] < 3:
            print("🔄 Reflection caught an error. Recycling to reasoning...")
            state['iteration_count'] += 1
            state['error_message'] = f"Reflection Critique: {feedback}"
            state['last_failed_sql'] = state['generated_sql']
            state['next_agent'] = "reasoning"
        else:
            state['next_agent'] = "executor"
    except Exception as e:
        state['next_agent'] = "executor"
        
    return state

# ============================================================================
# AGENT 4: EXECUTOR
# ============================================================================
def executor_agent(state: MultiAgentState) -> MultiAgentState:
    print(f"⚡ EXECUTOR: Running SQL [Attempt {state['iteration_count']+1}]...")
    
    sql = state.get('generated_sql', "").strip()
    if not sql or sql.startswith("--"):
        state['error_message'] = "No valid SQL produced."
        state['next_agent'] = "formatter"
        return state

    try:
        all_res, err = database.execute_query(sql, user_id=state.get('user_id'))
        if all_res is not None:
            # all_res is now a list of {"columns": [], "rows": []}
            state['query_results'] = all_res
            state['error_message'] = ""
            state['next_agent'] = "formatter"
        else:
            # Error feedback loop
            state['error_message'] = err
            state['last_failed_sql'] = sql
            if state['iteration_count'] < 3:
                print(f"❌ Execution failed. Providing feedback for retry.")
                state['iteration_count'] += 1
                state['next_agent'] = "reasoning"
            else:
                state['next_agent'] = "formatter"
    except Exception as e:
        state['error_message'] = str(e)
        state['next_agent'] = "formatter"
        
    return state

# ============================================================================
# AGENT 5: FORMATTER
# ============================================================================
def formatter_agent(state: MultiAgentState) -> MultiAgentState:
    print("📝 FORMATTER: Analytical Storytelling...")
    
    if state['error_message'] and not state['query_results']:
        reasoning_intro = f"Reasoning: {state.get('query_plan', 'Analyzing target tables...')}\n\n"
        state['final_answer'] = f"{reasoning_intro}Database Error: {state['error_message']}"
        state['next_agent'] = "END"
        return state
        
    # Aggregate context from all result sets
    full_context = ""
    for idx, res in enumerate(state['query_results']):
        cols = res.get('columns', [])
        rows = res.get('rows', [])[:50] # Limit sample per set
        data_sample = [dict(zip(cols, r)) for r in rows]
        full_context += f"\nDATASET {idx+1}:\n{str(data_sample)}\n"

    prompt = f"""You are a Pro Data Analyst. 
The user asked: {state['user_query']}
Logical Plan followed: {state['query_plan']}
Available Datasets:
{full_context}

TASK:
1. START WITH REASONING: Briefly explain what you looked for and why (based on the plan).
2. ANALYTICAL STORYTELLING: Identify patterns, outliers, or significant totals across ALL provided datasets.
3. STRUCTURE: Use a clean, point-wise breakdown. 
4. NO BOLD: Strict rule - never use double asterisks (**).

Example Output Style:
Reasoning: I accessed both the history and booking tables to correlate...
Insights:
- Found 4 major clusters...
- In Dataset 1 (Bookings), we see..."""

    try:
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        state['final_answer'] = response.text
    except Exception as e:
        state['final_answer'] = f"Reasoning: {state['query_plan']}\n\nNote: Data formatting failed but datasets are available below."
    
    state['next_agent'] = "END"
    return state

# ============================================================================
# LANGGRAPH ORCHESTRATION
# ============================================================================
def route_next(state: MultiAgentState):
    return state.get('next_agent', 'END')

def create_multi_agent_graph():
    workflow = StateGraph(MultiAgentState)
    
    workflow.add_node("supervisor", supervisor_agent)
    workflow.add_node("reasoning", reasoning_agent)
    workflow.add_node("reflection", reflection_agent)
    workflow.add_node("executor", executor_agent)
    workflow.add_node("formatter", formatter_agent)
    
    workflow.set_entry_point("supervisor")
    
    workflow.add_conditional_edges("supervisor", route_next, {"reasoning": "reasoning", "END": END})
    workflow.add_conditional_edges("reasoning", route_next, {"reflection": "reflection", "END": END})
    workflow.add_conditional_edges("reflection", route_next, {"reasoning": "reasoning", "executor": "executor", "END": END})
    workflow.add_conditional_edges("executor", route_next, {"reasoning": "reasoning", "formatter": "formatter", "END": END})
    workflow.add_conditional_edges("formatter", route_next, {"END": END})
    
    return workflow.compile()

app = create_multi_agent_graph()

def run_multi_agent_query(query: str, schema: str, user_id: int = None) -> dict:
    """Entry point to run the langgraph agent system"""
    initial_state: MultiAgentState = {
        "user_query": query,
        "db_schema": schema,
        "available_tables": [],
        "target_tables": [],
        "query_type": "single",
        "query_plan": "",
        "generated_sql": "",
        "reflection_notes": "",
        "query_results": [],
        "query_columns": [],
        "error_message": "",
        "iteration_count": 0,
        "final_answer": "",
        "next_agent": "supervisor",
        "is_ambiguous": False,
        "potential_matches": [],
        "user_id": user_id,
        "last_failed_sql": ""
    }
    return app.invoke(initial_state)
