import { useState } from 'react';
import './App.css';

function App() {
  const [passages, setPassages] = useState([]);

  const retrievePassages = async (query) => {
    const fetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    };

    try {
      const response = await fetch('http://localhost:8000/retrieve', fetchOptions);

      if (!response.ok) {
        throw new Error(`HTTP Error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      setPassages(responseData.passages);
    } catch (error) {
      console.error('Error retrieving passages:', error);
    }
  };

  return (
    <div>
      <div className="Header">
        <h1 id="title">Deep Passage Retrieval</h1>
      </div>

      <div className="Query">
        <form>
          <input type="text" id="query" name="query" onChange={(e) => retrievePassages(e.target.value)} />
        </form>
      </div>

      <div>
        <ul>
          {/* Map through passages and render each passage */}
          {passages.map((passage, index) => (
            <li key={index}>
              <strong>Score:</strong> {passage.score.toFixed(4)} - <strong>Passage:</strong> {passage.passage}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;