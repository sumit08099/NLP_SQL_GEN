"""
Multi-Agent System for NL2SQL
Architecture: Supervisor -> Reasoning -> Reflection
Using Official Google GenAI SDK for maximum reliability.
"""
import os
import json
from typing import TypedDict, List, Literal, Annotated
from dotenv import load_dotenv
from google import genai
from langgraph.graph import StateGraph, END
import database

load_dotenv()

# Initialize the Official Google GenAI Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL_ID = "gemini-1.5-flash" # Verified stable model

# ============================================================================
# STATE DEFINITION
# ============================================================================
class MultiAgentState(TypedDict):
    user_query: str
    db_schema: str
    available_tables: List[str]
    target_tables: List[str]
    query_plan: str
    generated_sql: str
    reflection_notes: str
    query_results: List
    error_message: str
    iteration_count: int
    final_answer: str
    next_agent: str

# ============================================================================
# AGENT 1: SUPERVISOR
# ============================================================================
def supervisor_agent(state: MultiAgentState) -> MultiAgentState:
    print("🎯 SUPERVISOR: Analyzing query context...")
    
    prompt = f"""You are a SQL Query Supervisor. Analyze this request:
USER QUERY: {state['user_query']}
SCHEMA: {state['db_schema']}

Return ONLY a JSON object:
{{
    "target_tables": ["table1", "table2"],
    "query_type": "single|join|aggregation",
    "is_ambiguous": false,
    "clarification_needed": ""
}}"""
    
    try:
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        # Clean potential markdown from JSON
        clean_json = response.text.replace("```json", "").replace("```", "").strip()
        data = json.loads(clean_json)
        state['target_tables'] = data.get("target_tables", [])
        state['next_agent'] = "reasoning"
    except Exception as e:
        print(f"Supervisor Error: {e}")
        state['next_agent'] = "reasoning" # Fallback
    
    return state

# ============================================================================
# AGENT 2: REASONING
# ============================================================================
def reasoning_agent(state: MultiAgentState) -> MultiAgentState:
    print("🧠 REASONING: Building query plan...")
    
    prompt = f"""You are a SQL Architect. Generate a PostgreSQL query.
USER: {state['user_query']}
TABLES: {state.get('target_tables', [])}
SCHEMA: {state['db_schema']}

Format:
PLAN: your reasoning
SQL: the raw sql query"""

    try:
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        content = response.text
        if "SQL:" in content:
            state['query_plan'] = content.split("SQL:")[0].replace("PLAN:", "").strip()
            sql = content.split("SQL:")[1].strip()
            state['generated_sql'] = sql.replace("```sql", "").replace("```", "").strip()
        else:
            state['generated_sql'] = content.strip()
    except Exception as e:
        print(f"Reasoning Error: {e}")
    
    state['next_agent'] = "reflection"
    return state

# ============================================================================
# AGENT 3: REFLECTION
# ============================================================================
def reflection_agent(state: MultiAgentState) -> MultiAgentState:
    print("🔍 REFLECTION: Validating SQL...")
    
    prompt = f"""Validate this SQL: {state['generated_sql']}
Request: {state['user_query']}
Schema: {state['db_schema']}

Return:
STATUS: APPROVED or NEEDS_REVISION
REASON: why"""

    try:
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        feedback = response.text
        state['reflection_notes'] = feedback
        
        if "NEEDS_REVISION" in feedback and state['iteration_count'] < 2:
            state['iteration_count'] += 1
            state['next_agent'] = "reasoning"
        else:
            state['next_agent'] = "executor"
    except Exception:
        state['next_agent'] = "executor"
        
    return state

# ============================================================================
# AGENT 4: EXECUTOR
# ============================================================================
def executor_agent(state: MultiAgentState) -> MultiAgentState:
    print("⚡ EXECUTOR: Running SQL...")
    try:
        results = database.execute_query(state['generated_sql'])
        state['query_results'] = results
        state['error_message'] = ""
        state['next_agent'] = "formatter"
    except Exception as e:
        state['error_message'] = str(e)
        if state['iteration_count'] < 2:
            state['iteration_count'] += 1
            state['next_agent'] = "reasoning"
        else:
            state['next_agent'] = "formatter"
    return state

# ============================================================================
# AGENT 5: FORMATTER
# ============================================================================
def formatter_agent(state: MultiAgentState) -> MultiAgentState:
    print("📝 FORMATTER: Finalizing answer...")
    if state['error_message']:
        state['final_answer'] = f"I couldn't run that query: {state['error_message']}"
    else:
        prompt = f"Question: {state['user_query']}\nData: {state['query_results'][:10]}\nAnswer in normal English:"
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        state['final_answer'] = response.text
    
    state['next_agent'] = "END"
    return state

# ============================================================================
# GRAPH BUILDER
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

def run_multi_agent_query(user_query: str, db_schema: str):
    initial_state = {
        "user_query": user_query,
        "db_schema": db_schema,
        "target_tables": [],
        "query_results": [],
        "error_message": "",
        "iteration_count": 0,
        "final_answer": "",
        "next_agent": "supervisor"
    }
    return app.invoke(initial_state)
