import React, { useState } from 'react';
import axios from 'axios';
import { parseStringPromise } from 'xml2js';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);

  const searchLaws = async () => {
    try {
      const res = await axios.get('http://localhost:5000/search', {
        params: { query, nFrag: 5, lFrag: 100 },
      });
      const jsonResponse = await parseStringPromise(res.data);

      const results = jsonResponse.results.doc.map(doc => ({
        title: doc.CIVIX_DOCUMENT_TITLE[0],
        documentId: doc.CIVIX_DOCUMENT_ID[0],
        indexId: doc.CIVIX_INDEX_ID[0],
        text: doc.frag[0],
      }));

      setResults(results);
    } catch (error) {
      console.error('Error fetching laws:', error);
    }
  };

  const summarizeContent = async (documentId, indexId) => {
    try {
      const res = await axios.get('http://localhost:5000/document', {
        params: { documentId, indexId },
      });
      const documentContent = res.data;

      const summaryRes = await axios.post('http://localhost:5000/summarize', { text: documentContent });
      console.log(summaryRes.data)
      setSummary(summaryRes.data.summary);
    } catch (error) {
      console.error('Error summarizing document:', error);
    }
  };

  const fetchDocument = async (documentId, indexId) => {
    try {
      const res = await axios.get('http://localhost:5000/document', {
        params: { documentId, indexId },
      });
      console.log(res.data);
      setSelectedDocument(res.data); 
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  };

  return (
    <div>
      <h1>BC Laws Search</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for legislation"
      />
      <button onClick={searchLaws}>Search</button>

      <h2>Results</h2>
      <ul>
        {results.map((result, index) => (
          <li key={index}>
            <p>{result.title}</p>
            <button onClick={() => fetchDocument(result.documentId, result.indexId)}>View Document (in console)</button>
            <button onClick={() => summarizeContent(result.documentId, result.indexId)}>Summarize</button>
          </li>
        ))}
      </ul>

      {summary && (
        <div>
          <h2>Summary</h2>
          <p>{summary}</p>
        </div>
      )}

    </div>
  );
}

export default App;
