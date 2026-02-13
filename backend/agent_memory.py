import json
import os
from datetime import datetime

MEMORY_FILE = os.path.join(os.path.dirname(__file__), "agent_memory.json")

def load_memory():
    if not os.path.exists(MEMORY_FILE):
        return {"corrections": [], "successful_patterns": []}
    try:
        with open(MEMORY_FILE, "r") as f:
            return json.load(f)
    except:
        return {"corrections": [], "successful_patterns": []}

def save_memory(memory):
    with open(MEMORY_FILE, "w") as f:
        json.dump(memory, f, indent=4)

def add_correction(query, failed_sql, error, corrected_sql):
    memory = load_memory()
    memory["corrections"].append({
        "timestamp": datetime.now().isoformat(),
        "query": query,
        "failed_sql": failed_sql,
        "error": error,
        "corrected_sql": corrected_sql
    })
    # Keep only last 50 corrections
    memory["corrections"] = memory["corrections"][-50:]
    save_memory(memory)

def get_relevant_memory(query):
    memory = load_memory()
    # Simple semantic proxy: find past queries with similar keywords
    keywords = set(query.lower().split())
    relevant = []
    for entry in memory["corrections"]:
        entry_keywords = set(entry["query"].lower().split())
        if len(keywords.intersection(entry_keywords)) > 2:
            relevant.append(entry)
    return relevant[:3]
