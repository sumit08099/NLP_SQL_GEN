import os
import sys
from sqlalchemy import create_url, create_engine, inspect
from dotenv import load_dotenv

# Add current directory to path
sys.path.append(os.getcwd())

load_dotenv()

DB_URL = os.getenv("DIRECT_URL")
if not DB_URL:
    print("DIRECT_URL not found in .env")
    sys.exit(1)

engine = create_engine(DB_URL)
inspector = inspect(engine)

try:
    columns = inspector.get_columns('users')
    print("Columns in 'users' table:")
    for col in columns:
        print(f"- {col['name']} ({col['type']})")
except Exception as e:
    print(f"Error inspecting 'users' table: {e}")
