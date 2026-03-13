---
language:
- en
license: mit
tags:
- text-to-sql
- t5
- nlp2sql
- agentic-ai
- postgresql
datasets:
- spider
metrics:
- accuracy
model-index:
- name: T5-NL2SQL-Gen
  results: []
---

# 🤖 T5-NL2SQL-Gen Specialist

This model is a fine-tuned **T5-Small** architecture specialized for converting Natural Language questions into precise PostgreSQL queries. It serves as the primary "Reasoning Specialist" within the **NLP2SQL Autonomous Intelligence Layer**.

## 🚀 Model Details
- **Architecture**: T5 (Text-to-Text Transfer Transformer)
- **Specialization**: PostgreSQL Query Generation
- **Training Data**: Fine-tuned on SQL-specific datasets (Spider/WikiSQL) and custom schema-mapped samples.
- **Project Role**: Acts as the initial SQL Generator in a Hybrid Agentic loop.

## 🔄 Hybrid Agentic Flow
This model is designed to work in tandem with Large Language Models (like Gemini 2.0 Flash) in a structured multi-agent workflow:
1. **Local ML (T5)**: Generates the initial high-speed SQL draft.
2. **Gemini Auditor**: Validates the draft against the actual schema, adds double-quotes, and fixes hallucinations.
3. **Self-Healing Loop**: If execution fails, the agents use this model's logic to refine the plan.

## 🔗 Project Context
This model is the engine for the **NLP2SQL Platform**.
- **GitHub Repository**: [sumit08099/NLP_SQL_GEN](https://github.com/sumit08099/NLP_SQL_GEN)
- **Frontend**: React 19 / Vite
- **Backend**: FastAPI / LangGraph

## 🛠 Usage (Hugging Face Transformers)
```python
from transformers import T5Tokenizer, T5ForConditionalGeneration

model_name = "Karan6124/t5-nl2sql-gen"
tokenizer = T5Tokenizer.from_pretrained(model_name)
model = T5ForConditionalGeneration.from_pretrained(model_name)

input_text = "translate English to SQL: How many users signed up in the last 30 days? \n Context: Table users (id, username, created_at)"
inputs = tokenizer(input_text, return_tensors="pt")
outputs = model.generate(**inputs, max_length=512)

print(tokenizer.decode(outputs[0], skip_special_tokens=True))
```

## 👥 Lead Engineers
Developed and optimized by **Sumit** & **Karan**.
