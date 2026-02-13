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

# ============================================================================
# AGENT 1: SUPERVISOR
# ============================================================================
def supervisor_agent(state: MultiAgentState) -> MultiAgentState:
    print("🎯 SUPERVISOR: Analyzing query context...")
    
    # Short-circuit if no knowledge base exists
    if "No user-uploaded tables found" in state['db_schema']:
        state['final_answer'] = "Protocol Interrupted: No active knowledge base detected. Please upload an Excel or CSV file in the 'Data Ingestion' zone so I can initialize your neural data layer."
        state['next_agent'] = END
        state['is_ambiguous'] = False
        return state

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
    "is_ambiguous": true/false,
    "reasoning": "Brief explanation"
}}

STRICT RULE: If the request is generic (e.g. "show 5 rows", "summary") and multiple tables exist in the schema, you MUST set "is_ambiguous": true and leave "target_tables" empty. DO NOT GUESS. Only set "target_tables" if you are 95% sure which one the user means based on keywords.
"""
    
    try:
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        text = response.text
        json_match = re.search(r'\{(?:[^{}]|(?R))*\}', text, re.DOTALL)
        if json_match:
            clean_json = json_match.group(0)
        else:
            clean_json = text.replace("```json", "").replace("```", "").strip()
            
        data = json.loads(clean_json)
        state['target_tables'] = data.get("target_tables", [])
        state['query_type'] = data.get("query_type", "single")
        state['is_ambiguous'] = data.get("is_ambiguous", False)
        
        # INCREASED ROBUSTNESS: Get list of all user tables from schema string
        # More inclusive regex for table detection
        all_user_tables = re.findall(r"Table:\s*(\w+)", state['db_schema'], re.IGNORECASE)
        print(f"📊 Supervisor detected tables in schema: {all_user_tables}")
        
        # Filter out system tables if possible for potential_matches
        system_tables = ['alembic_version', 'dynamic_tables', 'users', 'products', 'orders']
        all_user_tables = [t for t in all_user_tables if t.lower() not in system_tables]
        print(f"📊 User-specific tables: {all_user_tables}")

        # 1. AUTO-ASSIGN IF ONLY ONE TABLE: If user didn't specify but there's only one choice, use it.
        if not state.get('target_tables') and len(all_user_tables) == 1:
             state['target_tables'] = all_user_tables
             print(f"🎯 Defaulting to only available user table: {all_user_tables[0]}")

        # 2. STRENGTHEN AMBIGUITY: If generic query and > 1 table, force ambiguity
        if (not state.get('target_tables') or state.get('is_ambiguous')) and len(all_user_tables) > 1:
            state['is_ambiguous'] = True
            state['potential_matches'] = all_user_tables
            state['next_agent'] = END
            return state

        # 3. FINAL VALIDATION: If we still have no tables after everything, and user mentioned one, 
        # try to find it in the query text as a fallback.
        if not state.get('target_tables'):
            for t in all_user_tables:
                if t.lower() in state['user_query'].lower():
                    state['target_tables'] = [t]
                    break

        state['potential_matches'] = []
        
        # SMARTER UNDERSTANDING: Fetch data profile for target tables
        profile_context = ""
        for table in state['target_tables']:
            # Verify table exists in schema to avoid hallucinatory profile calls
            if table in all_user_tables or table.lower() in [t.lower() for t in all_user_tables]:
                profile = database.get_table_profile(table)
                if profile:
                    profile_context += f"\nData Profile (Table: {table}):\n{profile}\n"
        
        if profile_context:
            state['db_schema'] += f"\n\nACTUAL DATA SAMPLES BY SUPERVISOR:{profile_context}"
            print(f"📊 Supervisor enhanced context for {state['target_tables']}")

        state['next_agent'] = "reasoning"
    except Exception as e:
        print(f"⚠️ Supervisor Error: {e}")
        state['error_message'] = f"Supervisor Error: {str(e)}"
        state['next_agent'] = "reasoning"
    
    return state

# ============================================================================
# AGENT 2: REASONING (Hybrid: Local + Gemini)
# ============================================================================
def reasoning_agent(state: MultiAgentState) -> MultiAgentState:
    print("🧠 REASONING: Building query plan...")
    
    # HYBRID STEP: Use Local Model first if on first iteration
    local_suggestion = ""
    if state['iteration_count'] == 0 and LOCAL_MODEL_READY:
        try:
            input_text = f"translate English to SQL: {state['user_query']} | Schema: {state['db_schema']}"
            inputs = local_tokenizer(input_text, return_tensors="pt", max_length=512, truncation=True)
            with torch.no_grad():
                outputs = local_model.generate(**inputs, max_length=512)
            local_suggestion = local_tokenizer.decode(outputs[0], skip_special_tokens=True)
            print(f"📡 Local Model Suggested: {local_suggestion}")
        except Exception:
            pass

    # LEARNING STEP: Check memory for similar past issues
    relevant_memories = agent_memory.get_relevant_memory(state['user_query'])
    memory_context = ""
    if relevant_memories:
        print(f"💡 Learning from {len(relevant_memories)} past experiences...")
        memory_context = "\nPAST LESSONS (Avoid these mistakes):\n"
        for m in relevant_memories:
            memory_context += f"- For query '{m['query']}', '{m['failed_sql']}' failed with error '{m['error']}'. Correct fix was: '{m['corrected_sql']}'\n"

    prompt = f"""You are a Senior SQL Architect. 
Your goal is to generate a correct PostgreSQL query based on the user's request.

USER REQUEST: {state['user_query']}
TARGET TABLES: {state.get('target_tables', [])}
DATABASE SCHEMA:
{state['db_schema']}

{f'LOCAL MODEL SUGGESTION: {local_suggestion}' if local_suggestion else ''}
{memory_context}

INSTRUCTIONS:
1. Write a step-by-step reasoning plan.
2. Generate the PostgreSQL query. 
3. IMPORTANT: Always wrap table names and column names in double quotes (e.g., "table_name") to handle special characters.
4. Use proper column names as shown in the schema.
5. If a local suggestion or past lesson is provided, incorporate those insights.
6. STRICTURE: Only use tables listed in "TARGET TABLES". If TARGET TABLES is empty, wait for supervisor instructions. DO NOT GUESS a table if it is not in the target list.

Format:
PLAN: [Describe your steps]
SQL: [Your PostgreSQL query]"""

    try:
        response = client.models.generate_content(model=MODEL_ID, contents=prompt)
        content = response.text
        
        if "SQL:" in content:
            state['query_plan'] = content.split("SQL:")[0].replace("PLAN:", "").strip()
            sql_block = content.split("SQL:")[1].strip()
            sql = re.sub(r'```sql\n?|```', '', sql_block).strip()
            state['generated_sql'] = sql
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
    
    # SECURITY: Check if SQL is actually executable (not just comments or notes)
    is_pure_comment = sql.startswith("--") and "\n" not in sql.strip()
    is_note = "Waiting for supervisor" in sql or "specify the table" in sql
    
    if not sql or is_pure_comment or is_note:
        state['error_message'] = "I identified the task, but I'm not sure which table to use. Please specify the table name."
        state['next_agent'] = "formatter"
        return state

    try:
        results, columns = database.execute_query(sql, user_id=state.get('user_id'))
        if results is not None:
            # If we succeeded after a previous error, save the correction to memory
            if state['iteration_count'] > 0 and state.get('error_message'):
                 print("💾 Recording successful correction into agent memory...")
                 agent_memory.add_correction(
                     state['user_query'],
                     "PREVIOUS_FAILED_SQL", # We could track the exact failing one if we stored it in state
                     state['error_message'],
                     sql
                 )
            
            state['query_results'] = results
            state['query_columns'] = columns
            state['error_message'] = ""
            state['next_agent'] = "formatter"
        else:
            state['error_message'] = columns
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
        
        prompt = f"""You are a helpful Data Analyst. 
The user asked: {state['user_query']}
Data Retrieved: {data_str}

Instruction:
1. Provide a clear, simple, and point-wise answer. Use a bulleted list format.
2. Cover all relevant information from the data simply.
3. DO NOT use bold formatting (strict rule: no double asterisks like **text**).
4. Avoid long paragraphs. Keep the structure clean and minimalist."""

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
        "user_id": user_id
    }
    return app.invoke(initial_state)
