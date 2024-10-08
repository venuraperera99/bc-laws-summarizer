require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get('/search', async (req, res) => {
    const { query, s = 0, e = 20, nFrag = 5, lFrag = 100 } = req.query;
    if (!query) {
        return res.status(400).json({ error: 'Query parameter is required' });
    }

    const searchUrl = `http://www.bclaws.ca/civix/search/complete/fullsearch?q=${encodeURIComponent(query)}&s=${s}&e=${e}&nFrag=${nFrag}&lFrag=${lFrag}`;

    try {
        const response = await axios.get(searchUrl);
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching search results:', error);
        res.status(500).json({ error: 'Failed to fetch search results' });
    }
});

app.get('/document', async (req, res) => {
    const { documentId, indexId } = req.query;   
    if (!documentId || !indexId) {
        return res.status(400).json({ error: 'documentId and indexId are required' });
    }

    const documentUrl = `http://www.bclaws.ca/civix/document/id/complete/${indexId}/${documentId}`;

    try {
        const response = await axios.get(documentUrl);
        console.log(response)

        res.send(response.data);
    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({ error: 'Failed to fetch document' });
    }
});

// Endpoint to summarize the content using OpenAI API
app.post('/summarize', async (req, res) => {
    const { text } = req.body;
  
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that summarizes legal documents."
          },
          {
            role: "user",
            content: `Summarize the following document in a concise paragraph: "${text}"`
          }
        ]
      });
  
      const summary = response.data.choices[0].message.content.trim();
      res.json({ summary });
    } catch (error) {
      console.error('Error summarizing document:', error);
      res.status(500).json({ error: 'Failed to summarize document' });
    }
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
