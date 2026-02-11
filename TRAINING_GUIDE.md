# NL2SQL Training Guide & Datasets

To build your own core ML model for NL2SQL, you need high-quality datasets that map English questions to SQL queries.

## 1. Recommended Datasets

### 🏆 Spider Dataset (Gold Standard)
- **Description:** A large-scale, complex, and cross-domain semantic parsing and text-to-SQL dataset. It contains 200 databases with multiple tables.
- **Why use it?** It's the best for teaching a model complex joins and nested queries.
- **Link:** [Spider Dataset Website](https://yale-lily.github.io/spider)

### 📊 WikiSQL
- **Description:** A large dataset based on Wikipedia tables (80,000+ examples).
- **Why use it?** Great for single-table queries and getting started with basic NL2SQL.
- **Link:** [WikiSQL GitHub](https://github.com/salesforce/WikiSQL)

### 🦅 BIRD-SQL
- **Description:** Focuses on efficiency and massive databases. It’s more challenging than Spider.
- **Link:** [BIRD-SQL Benchmark](https://bird-bench.github.io/)

---

## 2. How to Start Training

### Step 1: Choose a Base Model
If you are doing local training, start with a pre-trained "Text-to-Text" or "Text-to-SQL" model:
- **T5 (Base/Large):** Excellent for sequence-to-sequence tasks.
- **Llama-3:** Can be fine-tuned specifically for SQL using QLoRA.
- **CodeLlama:** Already pre-trained on code and SQL.

### Step 2: Use HuggingFace Transformers
You can use the `transformers` and `peft` libraries in Python to fine-tune your model.

**Sample Training Script Logic:**
```python
from transformers import AutoModelForSeq2SeqLM, AutoTokenizer, Trainer

# Load a base model like T5
model_name = "t5-small"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

# Format your data: "translate English to SQL: How many users are active?" -> "SELECT count(*) FROM users WHERE status='active'"
```

---

## 3. Integration with this Project
Once you train your model, you can add a `model_path` variable in `ai_engine.py` and switch between **Gemini 2.0 Flash** and your **Local ML Model**.
