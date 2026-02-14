import database
import os
from dotenv import load_dotenv

load_dotenv("../.env")

sql = 'SELECT * FROM "users" LIMIT 1; SELECT * FROM "users" LIMIT 1;'
try:
    results, err = database.execute_query(sql)
    print(f"RESULTS: {len(results)} datasets found.")
    for i, r in enumerate(results):
        print(f"Dataset {i+1}: {len(r['rows'])} rows")
    if err:
        print(f"ERROR: {err}")
except Exception as e:
    import traceback
    print(f"EXCEPTION: {str(e)}")
    traceback.print_exc()
