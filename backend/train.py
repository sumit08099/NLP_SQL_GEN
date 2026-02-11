import os
import torch
from transformers import T5Tokenizer, T5ForConditionalGeneration, Trainer, TrainingArguments
from datasets import load_dataset

# Note: If running on local machine without GPU, this will be slow.
# Recommended to run on Google Colab with T4 GPU.

def train_model():
    # 1. Load the Spider Dataset
    print("🚀 Loading Spider dataset...")
    dataset = load_dataset("spider")

    # 2. Initialize the Model and Tokenizer (T5-Small is lightweight for students)
    model_name = "t5-small"
    tokenizer = T5Tokenizer.from_pretrained(model_name)
    model = T5ForConditionalGeneration.from_pretrained(model_name)

    # 3. Preprocessing the data for NL2SQL
    def preprocess_function(examples):
        inputs = [f"translate English to SQL: {q} | Schema: {s}" for q, s in zip(examples['question'], examples['db_id'])]
        model_inputs = tokenizer(
            inputs, 
            text_target=examples['query'], 
            max_length=128, 
            truncation=True, 
            padding="max_length"
        )
        return model_inputs

    print("📊 Preprocessing data...")
    tokenized_dataset = dataset.map(preprocess_function, batched=True)

    # 4. Training Arguments 
    # Use fp16=True if you have a GPU (like T4 in Colab)
    training_args = TrainingArguments(
        output_dir="./results",
        eval_strategy="epoch", # Fixed: Rename from evaluation_strategy
        learning_rate=3e-5,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        num_train_epochs=3,
        weight_decay=0.01,
        save_total_limit=2,
        fp16=torch.cuda.is_available(), # Auto-detect GPU
        push_to_hub=False,
        report_to="none"
    )

    # 5. Initialize Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenized_dataset["train"],
        eval_dataset=tokenized_dataset["validation"],
    )

    # 6. Start Training
    print(f"🔥 Starting training (GPU Active: {torch.cuda.is_available()})...")
    trainer.train()

    # 7. Save the Model
    output_dir = "./fine_tuned_sql_model"
    model.save_pretrained(output_dir)
    tokenizer.save_pretrained(output_dir)
    print(f"✅ Model saved to folder: {output_dir}")

if __name__ == "__main__":
    train_model()
