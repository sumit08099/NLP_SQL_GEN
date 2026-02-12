"""
Multi-Agent System for NL2SQL
Architecture: Supervisor -> Reasoning -> Reflection -> Executor -> Formatter
Using Official Google GenAI SDK (google-genai) for direct model access.
"""
import os
import json
import re
from typing import TypedDict, List, Literal, Annotated
from dotenv import load_dotenv
from google import genai
from langgraph.graph import StateGraph, END
import database

load_dotenv()

# Initialize the Official Google GenAI Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Use the model that WE CONFIRMED worked in test_models.py
MODEL_ID = "gemini-2.0-flash" 

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

# ============================================================================
# AGENT 1: SUPERVISOR
# ============================================================================
def supervisor_agent(state: MultiAgentState) -> MultiAgentState:
    print("🎯 SUPERVISOR: Analyzing query context...")
    
    prompt = f"""You are a SQL Assistant Supervisor.
Analyze this request: "{state['user_query']}"
SCHEMA:
{state['db_schema']}

IMPORTANT:
- Prioritize user-uploaded CSV tables over system tables ('alembic_version', 'dynamic_tables', 'users', 'products', 'orders').
- If the user asks about "data" or "tables", they almost certainly mean their CSV files.

Return JSON ONLY:
{{
    "target_tables": ["table1"],
    "query_type": "single|join|aggregation",
    "is_ambiguous": false,
    "reasoning": "Brief explanation"
}}"""
    
    try:
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        text = response.text
        
        # Robust JSON extraction
        json_match = re.search(r'\{(?:[^{}]|(?R))*\}', text, re.DOTALL)
        if json_match:
            clean_json = json_match.group(0)
        else:
            clean_json = text.replace("```json", "").replace("```", "").strip()
            
        data = json.loads(clean_json)
        state['target_tables'] = data.get("target_tables", [])
        state['query_type'] = data.get("query_type", "single")
        state['next_agent'] = "reasoning"
    except Exception as e:
        print(f"⚠️ Supervisor Error: {e}")
        state['error_message'] = f"Supervisor Error: {str(e)}"
        state['next_agent'] = "reasoning" # Fallback to reasoning
    
    return state

# ============================================================================
# AGENT 2: REASONING
# ============================================================================
def reasoning_agent(state: MultiAgentState) -> MultiAgentState:
    print("🧠 REASONING: Building query plan...")
    
    prompt = f"""You are a Senior SQL Architect. 
Your goal is to generate a correct PostgreSQL query based on the user's request.

USER REQUEST: {state['user_query']}
TARGET TABLES: {state.get('target_tables', [])}
DATABASE SCHEMA:
{state['db_schema']}

INSTRUCTIONS:
1. Write a step-by-step reasoning plan.
2. Generate the PostgreSQL query. 
3. Use proper column names as shown in the schema.
4. If execution failed previously (check error: {state.get('error_message')}), FIX the SQL.

Format:
PLAN: [Describe your steps]
SQL: [Your PostgreSQL query]"""

    try:
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        content = response.text
        
        if "SQL:" in content:
            state['query_plan'] = content.split("SQL:")[0].replace("PLAN:", "").strip()
            sql_block = content.split("SQL:")[1].strip()
            # Clean SQL from markdown
            sql = re.sub(r'```sql\n?|```', '', sql_block).strip()
            state['generated_sql'] = sql
        else:
            # Fallback for unexpected format
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
    print("🔍 REFLECTION: Validating SQL...")
    
    if not state.get('generated_sql'):
        state['next_agent'] = "reasoning"
        return state
        
    prompt = f"""You are a SQL Code Reviewer.
Validate if this PostgreSQL query is correct and matches the user's intent.

USER QUERY: {state['user_query']}
GENERATED SQL: {state['generated_sql']}
SCHEMA: {state['db_schema']}

Criteria:
1. Does it use the correct table and column names?
2. Is the JOIN logic correct (if applicable)?
3. Will it run on PostgreSQL?

Return:
STATUS: [APPROVED or NEEDS_REVISION]
REASONING: [Brief explanation]"""

    try:
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        feedback = response.text
        state['reflection_notes'] = feedback
        
        if "NEEDS_REVISION" in feedback and state['iteration_count'] < 2:
            print("🔄 Reflection suggested revision...")
            state['iteration_count'] += 1
            state['next_agent'] = "reasoning"
        else:
            state['next_agent'] = "executor"
    except Exception as e:
        print(f"⚠️ Reflection Error: {e}")
        state['next_agent'] = "executor"
        
    return state

# ============================================================================
# AGENT 4: EXECUTOR
# ============================================================================
def executor_agent(state: MultiAgentState) -> MultiAgentState:
    print(f"⚡ EXECUTOR: Running SQL [Attempt {state['iteration_count']+1}]...")
    
    sql = state.get('generated_sql', "").strip()
    if not sql:
        state['error_message'] = "No SQL was generated."
        state['next_agent'] = "formatter"
        return state

    try:
        results, columns = database.execute_query(sql)
        if results is not None:
            state['query_results'] = results
            state['query_columns'] = columns
            state['error_message'] = ""
            state['next_agent'] = "formatter"
        else:
            # results being None means execute_query caught an exception and returned (None, error_str)
            state['error_message'] = columns # Error message is in second return value
            if state['iteration_count'] < 2:
                print(f"❌ Execution failed: {state['error_message']}. Turning back to reasoning...")
                state['iteration_count'] += 1
                state['next_agent'] = "reasoning"
            else:
                state['next_agent'] = "formatter"
    except Exception as e:
        print(f"⚠️ Executor Node Error: {e}")
        state['error_message'] = str(e)
        state['next_agent'] = "formatter"
        
    return state

# ============================================================================
# AGENT 5: FORMATTER
# ============================================================================
def formatter_agent(state: MultiAgentState) -> MultiAgentState:
    print("📝 FORMATTER: Creating final answer...")
    
    if state['error_message'] and not state['query_results']:
        state['final_answer'] = f"I'm sorry, I couldn't process your request. Error: {state['error_message']}"
    elif not state['query_results'] and not state['error_message']:
        state['final_answer'] = "The query executed successfully, but no data was returned."
    else:
        # Give the formatter a MUCH larger window (up to 100 rows)
        data_sample = state['query_results'][:100]
        columns = state.get('query_columns', [])
        data_str = str([dict(zip(columns, row)) for row in data_sample])
        
        prompt = f"""You are a Senior Data Analyst. 
The user asked: {state['user_query']}
Data Retrieved: {data_str}

Instruction:
1. Identify and explain the USER'S DATA (the CSV tables).
2. Ignore system tables (alembic, dynamic_tables, users, etc.) unless they are specifically mentioned.
3. Provide a clear, insightful answer."""

        try:
            response = client.models.generate_content(model=MODEL_ID, contents=prompt)
            state['final_answer'] = response.text
        except Exception as e:
            state['final_answer'] = f"The query returned {len(state['query_results'])} rows, but I failed to format a nice answer. Error: {str(e)}"
    
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

def run_multi_agent_query(user_query: str, db_schema: str):
    """Main entry for external calls"""
    # CRITICAL: Initialize EVERY key in the TypedDict to avoid KeyErrors
    initial_state: MultiAgentState = {
        "user_query": user_query,
        "db_schema": db_schema,
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
        "next_agent": "supervisor"
    }
    return app.invoke(initial_state)
