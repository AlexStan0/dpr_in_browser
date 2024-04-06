import sys
import json
from transformers import DPRQuestionEncoderTokenizer

def tokenize(text):
    tokenizer = DPRQuestionEncoderTokenizer.from_pretrained('facebook/dpr-ctx_encoder-single-nq-base')
    encoded_input = tokenizer(text, return_tensors="pt")
    input_ids = encoded_input['input_ids'].tolist()
    attention_mask = encoded_input['attention_mask'].tolist()

    tokenized_output = {
        'input_ids': input_ids,
        'attention_mask': attention_mask,
    }
    print(json.dumps(tokenized_output))

if __name__ == "__main__":
    # Read the text from the first command line argument
    input_text = sys.argv[1]
    tokenize(input_text)