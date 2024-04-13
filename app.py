from flask import Flask, render_template, request
from transformers import DPRQuestionEncoder, DPRQuestionEncoderTokenizer
from sklearn.metrics.pairwise import cosine_similarity
import torch
import json

app = Flask(__name__)

# Load DPR model and tokenizer
tokenizer = DPRQuestionEncoderTokenizer.from_pretrained("facebook/dpr-question_encoder-multiset-base")
model = DPRQuestionEncoder.from_pretrained("facebook/dpr-question_encoder-multiset-base")

# Preprocess the data
with open('downloads/data/gold_passages_info/nq_dev.json', 'r') as f:
    json_data = json.load(f)

# Get the contexts from the JSON data
passages = [item["context"] for item in json_data["data"]]

passage_embeddings = []

# Process the data in batches, adjust as needed
batch_size = 100
num_batches = min(10, (len(passages) + batch_size - 1) // batch_size)  # Limit to three batches

for batch_idx in range(num_batches):

    start_idx = batch_idx * batch_size
    end_idx = min((batch_idx + 1) * batch_size, len(passages))
    batch_passages = passages[start_idx:end_idx]

    batch_embeddings = []

    for passage in batch_passages:

        # Tokenize the passage
        encoded_passage = tokenizer.encode_plus(
            passage,
            max_length=512,
            padding="max_length",
            truncation=True,
            return_tensors="pt"
        )

        input_ids = encoded_passage["input_ids"]

        # Pass the encoded passage to the model
        with torch.no_grad():
            embeddings = model(input_ids=input_ids).pooler_output
            batch_embeddings.append(embeddings)

    passage_embeddings.append(torch.stack(batch_embeddings))

passage_embeddings = torch.cat(passage_embeddings)

# Calculate the MRR@100
def calculate_mrr(rankings, true_passage_index):

    for rank, (passage, _) in enumerate(rankings, start=1):

        if passage == true_passage_index:
            score = float('%.3g' % rank)
            return score
        
    return 0.00

@app.route('/', methods=['GET', 'POST'])
def index():

    if request.method == "POST":

        # Get the query
        query = request.form['query']

        # Calculate the similarity scores
        query_input_ids = tokenizer(query, return_tensors="pt")["input_ids"]
        query_embedding = model(query_input_ids).pooler_output

        # Reshape passage_embeddings to have 2 dimensions
        passage_embeddings_flat = passage_embeddings.reshape(-1, passage_embeddings.shape[-1])

        # Calculate the similarity scores
        similarities = cosine_similarity(passage_embeddings_flat.detach().numpy(), query_embedding.detach().numpy())

        # Reshape the similarities back to the original shape
        similarities = similarities.reshape(passage_embeddings.shape[0], -1)
        # Rank the data
        ranked_passages = sorted(zip(passages, similarities), key=lambda x: x[1], reverse=True)

        # Calculate MRR 
        true_passage_index = ranked_passages[0][0]
        mrr = calculate_mrr(ranked_passages, true_passage_index)

        # Get the top 10 passages' content
        top_passages = ranked_passages[:5]

        return render_template('index.html', top_passages=top_passages, mrr=mrr)

    else:

        return render_template('index.html', top_passages=[], mrr=None)
        

if __name__ == '__main__':
    app.run(debug=True)