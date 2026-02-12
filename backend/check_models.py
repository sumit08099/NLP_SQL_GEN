"""
Script to check available Gemini models
"""
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

# Initialize client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

print("🔍 Checking available Gemini models...\n")

try:
    # List all available models
    models = client.models.list()
    
    print("✅ Available Models:")
    print("-" * 80)
    
    for model in models:
        # Only show generative models
        if hasattr(model, 'name'):
            print(f"📦 {model.name}")
            if hasattr(model, 'display_name'):
                print(f"   Display Name: {model.display_name}")
            if hasattr(model, 'description'):
                print(f"   Description: {model.description[:100]}...")
            print()
    
    print("-" * 80)
    print("\n💡 Recommended models for NL2SQL:")
    print("   - gemini-2.0-flash-001 (Latest stable)")
    print("   - gemini-1.5-flash (Fallback)")
    print("   - gemini-1.5-pro (For complex reasoning)")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("\n💡 Common model names to try:")
    print("   - gemini-2.0-flash-001")
    print("   - gemini-1.5-flash")
    print("   - gemini-1.5-flash-latest")
    print("   - gemini-1.5-pro")
    print("   - gemini-1.5-pro-latest")
