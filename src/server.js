
import express from 'express';
import cors from 'cors';
import * as tf from '@tensorflow/tfjs-node';
import fs from 'fs';

//create the express server that the website will point to
const app = express();
const port = 8000;
app.use(cors());
app.use(express.json())

// Load MS MARCO data
const loadData = () => {

    const data = JSON.parse(fs.readFileSync('../downloads/data/gold_passages_info/nq_dev.json', 'utf-8'))
    return data;

}

// Retrieve the passages based on query
const retrievePassages = (model, query, passages) => {
    
    const inputTensor = tf.tensor([query]);
    const output = model.predict(inputTensor, inputTensorTwo);
    const scores = output.dataSync();

    const relevantPassages = postProcessScores(scores, passages);
    return relevantPassages;

}

const postProcessScores = (scores, passages) => {

    const sortedPassages = passages.map((passage, index) => ({ passage, score: scores[index]}));
    sortedPassages.sort((a, b) => b.score - a.score);
    const topKPassages = sortedPassages.slice(0, 5);
    return topKPassages;

}

// Make sure it's running 
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Create a route to handle the retrieval 
app.post('/retrieve', async (req, res) => {

    const query = req.body.query;

    // Load the DPR model
    const modelPath = '../models/model.json'; 
    const model = await tf.loadGraphModel(`file://${modelPath}`);

    const data = loadData();

    const scoredPassages = retrievePassages(model, query, data);

    res.json({ passages: scoredPassages })

})

