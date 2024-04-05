import express from 'express';
import cors from 'cors';
import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs';
import { spawn } from 'node:child_process';

//create the express server that the website will point to
const app = express();
const port = 8000;
app.use(cors());
app.use(express.json())

// Load Gold Passages data
const loadData = () => {
    const data = JSON.parse(fs.readFileSync('../downloads/data/gold_passages_info/nq_dev.json', 'utf-8'))
    return data;
}

function tokenize(text, callback) {
  const pythonProcess = spawn('python', ['tokenizer.py', text]);
  pythonProcess.stdout.on('data', (data) => {
    callback(null, data.toString());
  });
  pythonProcess.stderr.on('data', (data) => {
    callback(data.toString());
  });
}

//Retrieve the passages based on query
const retrievePassages = async (model, inputIds, attentionMask, passages) => {
    const inputTensorIds = tf.tensor2d(inputIds); 
    const inputTensorMask = tf.tensor2d(attentionMask); 

    inputTensorIds.cast("int32");
    inputTensorMask.cast("int32");

    const output = await model.predict({ input_ids: inputTensorIds, attention_mask: inputTensorMask });
    const scores = output.dataSync();
    return postProcessScores(scores, passages);
};

const postProcessScores = (scores, passages) => {
    const sortedPassages = passages.map((passage, index) => ({ passage, score: scores[index] }));
    sortedPassages.sort((a, b) => b.score - a.score);
    return sortedPassages.slice(0, 5);
}

// Make sure it's running 
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

app.post('/retrieve', async (req, res) => {

    const query = req.body.query;

    //Load the DPR model
    const modelPath = '../models/model.json'; 
    const model = await tf.loadGraphModel(`file://${modelPath}`);
    const passageData = loadData();

    // Flag to track if response has been sent
    let responseSent = false;

    tokenize(query, async (error, data) => {

        // Check if response has already been sent
        if (responseSent) return;

        if (error) {

            // Handle error
            console.error('Error during tokenization:', error);
            res.status(500).json({ error: 'An error occurred during tokenization' });

        } else {

            // Send response
            let parsedData = JSON.parse(data);
            const scoredPassages = await retrievePassages(model, parsedData['input_ids'], parsedData['attention_mask'], passageData);
            console.log(scoredPassages)
            
        }

        // Set responseSent flag to true
        responseSent = true;

    });

    tokenize(query, async (error, data) => {})

});