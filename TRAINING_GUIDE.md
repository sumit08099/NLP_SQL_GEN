# 🧠 NL2SQL Model Training Guide

This guide details how to fine-tune a custom Machine Learning model for converting Natural Language to SQL, specifically designed for this project's **Hybrid AI Architecture**.

## 📊 1. Recommended Datasets

### 🏆 Spider Dataset (Primary)
- **Description:** A large-scale, cross-domain semantic parsing dataset with 200 databases and 10,000+ questions.
- **Why we use it:** It is the "Gold Standard" for training models on complex joins, aggregations, and multi-table relationships.
- **Download:** Automatically handled by `train.py` via HuggingFace Datasets.

### � WikiSQL (Beginner)
- **Description:** 80,000+ simple English questions mapped to single-table SQL queries.
- **Use case:** Good for faster training if you only need very basic single-table support.

---

## 🛠️ 2. Training Workflow (Google Colab Recommended)

Since local training on a CPU is slow, we use Google Colab's free T4 GPU.

### Step 1: Notebook Setup
1. Open [Google Colab](https://colab.research.google.com/).
2. Create a **New Notebook**.
3. Go to **Runtime -> Change runtime type** and select **T4 GPU**.

### Step 2: Installation
Run this in the first cell:
```python
!pip install transformers[torch] datasets sentencepiece
```

### Step 3: Execute Training
Copy the code from this project's `train.py` into a cell and run it. The script is configured to:
- Auto-detect the T4 GPU.
- Load the Spider dataset.
- Fine-tune **T5-Small** for 3 epochs.
- Zip the final model for download.

---

## 🧠 3. Model Architecture: Why T5-Small?

For student projects and budget-conscious development, we use **T5-Small** (Text-to-Text Transfer Transformer):
- **Size:** ~60 Million parameters (very efficient).
- **Latency:** Fast inference even on standard laptop CPUs.
- **Accuracy:** When fine-tuned on Spider, it successfully handles 70-85% of standard SQL queries.
- **Safety:** We complement this model with Gemini 2.0 Flash in `multi_agent.py` to handle the remaining complex cases.

---

## 📉 4. Understanding Training Results

Look for these markers in your logs to ensure a "Perfect Training":
- **Training Loss:** Should drop significantly (e.g., from >1.0 into the 0.3-0.5 range).
- **Validation Loss:** Should decrease alongside training loss. If it starts going up, stop training (Overfitting).
- **Final Metrics:** A loss around **0.4** is the "sweet spot" for this specific project.

---

## 🔌 5. Integration

Once training is complete:
1. Download `fine_tuned_sql_model.zip` from Colab.
2. Unzip it into the project root.
3. The `multi_agent.py` script will automatically detect the folder and load the weights.

**Note:** The model folder is ignored by Git in this project to prevent repository bloat, as the weights are ~250MB.
