import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

variations = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-2.0-flash",
]

for v in variations:
    print(f"Testing {v}...")
    try:
        response = client.models.generate_content(model=v, contents="hi")
        print(f"✅ {v} works! Response: {response.text[:10]}...")
        break
    except Exception as e:
        print(f"❌ {v} failed: {e}")
