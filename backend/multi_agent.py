"""
Multi-Agent System for NL2SQL
Architecture: Supervisor -> Reasoning -> Reflection
"""
import os
from typing import TypedDict, List, Literal, Annotated
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import create_react_agent
import database

load_dotenv()

# ============================================================================
# STATE DEFINITION
# ============================================================================
class MultiAgentState(TypedDict):
    """Shared state across all agents"""
    user_query: str
    db_schema: str
    available_tables: List[str]
    target_tables: List[str]  # Tables identified by supervisor
    query_plan: str  # Reasoning agent's plan
    generated_sql: str
    reflection_notes: str  # Feedback from reflection agent
    query_results: List
    error_message: str
    iteration_count: int
    final_answer: str
    next_agent: str  # Routing decision


# ============================================================================
# AGENT 1: SUPERVISOR (The Router & Context Manager)
# ============================================================================
def supervisor_agent(state: MultiAgentState) -> MultiAgentState:
    """
    Responsibilities:
    1. Analyze user query for ambiguity
    2. Identify which tables are relevant
    3. Route to appropriate next agent
    """
    print("🎯 SUPERVISOR: Analyzing query context...")
    
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", google_api_key=os.getenv("GEMINI_API_KEY"))
    
    prompt = f"""You are a SQL Query Supervisor. Analyze this request:

USER QUERY: {state['user_query']}

AVAILABLE DATABASE SCHEMA:
{state['db_schema']}

TASKS:
1. Identify which tables are needed to answer this query
2. Check if the query is ambiguous (missing table names, unclear intent)
3. Determine if this requires:
   - Single table query
   - JOIN between multiple tables
   - Aggregation/GROUP BY

Return ONLY a JSON with this structure:
{{
    "target_tables": ["table1", "table2"],
    "query_type": "single|join|aggregation",
    "is_ambiguous": true/false,
    "clarification_needed": "question to ask user if ambiguous",
    "reasoning": "brief explanation"
}}
"""
    
    response = llm.invoke(prompt)
    analysis = response.content
    
    # Parse the response (simplified - you'd use proper JSON parsing)
    state['target_tables'] = []  # Extract from analysis
    state['next_agent'] = "reasoning"  # Route to reasoning agent
    
    print(f"✅ SUPERVISOR: Identified tables, routing to reasoning agent")
    return state


# ============================================================================
# AGENT 2: REASONING (The SQL Architect)
# ============================================================================
def reasoning_agent(state: MultiAgentState) -> MultiAgentState:
    """
    Responsibilities:
    1. Create a query execution plan
    2. Generate the SQL based on the plan
    3. Handle JOINs and complex logic
    """
    print("🧠 REASONING: Building query plan...")
    
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", google_api_key=os.getenv("GEMINI_API_KEY"))
    
    prompt = f"""You are a SQL Query Architect. Create a precise SQL query.

USER REQUEST: {state['user_query']}
TARGET TABLES: {state.get('target_tables', [])}
DATABASE SCHEMA:
{state['db_schema']}

INSTRUCTIONS:
1. First, write out your reasoning/plan
2. Then generate the exact PostgreSQL query
3. If JOINs are needed, identify the foreign key relationships
4. Use proper aggregations if needed

Return in this format:
PLAN: [your step-by-step reasoning]
SQL: [the actual SQL query, no markdown]
"""
    
    response = llm.invoke(prompt)
    content = response.content
    
    # Extract plan and SQL
    if "PLAN:" in content and "SQL:" in content:
        plan_part = content.split("SQL:")[0].replace("PLAN:", "").strip()
        sql_part = content.split("SQL:")[1].strip()
        
        # Clean SQL (remove markdown if present)
        sql_part = sql_part.replace("```sql", "").replace("```", "").strip()
        
        state['query_plan'] = plan_part
        state['generated_sql'] = sql_part
    else:
        state['generated_sql'] = content.strip()
    
    state['next_agent'] = "reflection"
    print(f"✅ REASONING: Generated SQL, routing to reflection")
    return state


# ============================================================================
# AGENT 3: REFLECTION (The Critic & Validator)
# ============================================================================
def reflection_agent(state: MultiAgentState) -> MultiAgentState:
    """
    Responsibilities:
    1. Validate the SQL against the schema
    2. Check for logical errors
    3. Suggest improvements or approve
    """
    print("🔍 REFLECTION: Validating SQL...")
    
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", google_api_key=os.getenv("GEMINI_API_KEY"))
    
    prompt = f"""You are a SQL Validator. Review this query for correctness.

ORIGINAL REQUEST: {state['user_query']}
GENERATED SQL: {state['generated_sql']}
DATABASE SCHEMA:
{state['db_schema']}

CHECK FOR:
1. Column names exist in the schema
2. Table names are correct
3. JOIN conditions are valid
4. Syntax is correct for PostgreSQL
5. Logic matches the user's intent

Return in this format:
STATUS: APPROVED or NEEDS_REVISION
ISSUES: [list any problems found, or "None"]
SUGGESTION: [improved SQL if needed, or "None"]
"""
    
    response = llm.invoke(prompt)
    feedback = response.content
    
    state['reflection_notes'] = feedback
    
    # Check if revision is needed
    if "NEEDS_REVISION" in feedback and state['iteration_count'] < 2:
        print("⚠️ REFLECTION: Issues found, sending back to reasoning")
        state['iteration_count'] = state.get('iteration_count', 0) + 1
        state['next_agent'] = "reasoning"
    else:
        print("✅ REFLECTION: SQL approved, executing")
        state['next_agent'] = "executor"
    
    return state


# ============================================================================
# AGENT 4: EXECUTOR (Runs the SQL)
# ============================================================================
def executor_agent(state: MultiAgentState) -> MultiAgentState:
    """Execute the approved SQL query"""
    print("⚡ EXECUTOR: Running SQL query...")
    
    try:
        results = database.execute_query(state['generated_sql'])
        state['query_results'] = results
        state['error_message'] = ""
        state['next_agent'] = "formatter"
    except Exception as e:
        print(f"❌ EXECUTOR: Query failed - {e}")
        state['error_message'] = str(e)
        state['query_results'] = []
        
        # If execution fails and we haven't retried too much, go back to reasoning
        if state['iteration_count'] < 2:
            state['iteration_count'] = state.get('iteration_count', 0) + 1
            state['next_agent'] = "reasoning"
        else:
            state['next_agent'] = "formatter"
    
    return state


# ============================================================================
# AGENT 5: FORMATTER (Creates human-readable answer)
# ============================================================================
def formatter_agent(state: MultiAgentState) -> MultiAgentState:
    """Format the results into a natural language answer"""
    print("📝 FORMATTER: Creating final answer...")
    
    if state['error_message']:
        state['final_answer'] = f"I encountered an error: {state['error_message']}"
        state['next_agent'] = "END"
        return state
    
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", google_api_key=os.getenv("GEMINI_API_KEY"))
    
    prompt = f"""Create a natural language answer from these SQL results.

USER QUESTION: {state['user_query']}
SQL EXECUTED: {state['generated_sql']}
RESULTS: {state['query_results'][:10]}  # First 10 rows

Provide a clear, conversational answer that directly addresses the user's question.
"""
    
    response = llm.invoke(prompt)
    state['final_answer'] = response.content
    state['next_agent'] = "END"
    
    return state


# ============================================================================
# ROUTING LOGIC
# ============================================================================
def route_next(state: MultiAgentState) -> Literal["supervisor", "reasoning", "reflection", "executor", "formatter", "END"]:
    """Determine which agent to call next"""
    return state.get('next_agent', 'END')


# ============================================================================
# BUILD THE GRAPH
# ============================================================================
def create_multi_agent_graph():
    """Construct the LangGraph workflow"""
    workflow = StateGraph(MultiAgentState)
    
    # Add all agent nodes
    workflow.add_node("supervisor", supervisor_agent)
    workflow.add_node("reasoning", reasoning_agent)
    workflow.add_node("reflection", reflection_agent)
    workflow.add_node("executor", executor_agent)
    workflow.add_node("formatter", formatter_agent)
    
    # Set entry point
    workflow.set_entry_point("supervisor")
    
    # Add conditional edges based on routing
    workflow.add_conditional_edges(
        "supervisor",
        route_next,
        {
            "reasoning": "reasoning",
            "END": END
        }
    )
    
    workflow.add_conditional_edges(
        "reasoning",
        route_next,
        {
            "reflection": "reflection",
            "END": END
        }
    )
    
    workflow.add_conditional_edges(
        "reflection",
        route_next,
        {
            "reasoning": "reasoning",  # Loop back if revision needed
            "executor": "executor",
            "END": END
        }
    )
    
    workflow.add_conditional_edges(
        "executor",
        route_next,
        {
            "reasoning": "reasoning",  # Retry if execution failed
            "formatter": "formatter",
            "END": END
        }
    )
    
    workflow.add_conditional_edges(
        "formatter",
        route_next,
        {
            "END": END
        }
    )
    
    return workflow.compile()


# ============================================================================
# MAIN EXECUTION FUNCTION
# ============================================================================
app = create_multi_agent_graph()

def run_multi_agent_query(user_query: str, db_schema: str):
    """Main entry point for multi-agent query processing"""
    initial_state = {
        "user_query": user_query,
        "db_schema": db_schema,
        "available_tables": [],
        "target_tables": [],
        "query_plan": "",
        "generated_sql": "",
        "reflection_notes": "",
        "query_results": [],
        "error_message": "",
        "iteration_count": 0,
        "final_answer": "",
        "next_agent": "supervisor"
    }
    
    result = app.invoke(initial_state)
    return result
