import { useState } from 'react';
import './App.css';

function App() {

  const [passages, setPassages] = useState([]);
  let typingTimer; 
  const doneTypingInterval = 500;

  const handleInputChange = (e) => {

      clearTimeout(typingTimer); // Clear the previous timer

      // Start a new timer to call retrievePassages after a delay
      typingTimer = setTimeout(() => {
          retrievePassages(e.target.value);
      }, doneTypingInterval);

  };

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
              <input type="text" id="query" name="query" onChange={handleInputChange} />
          </form>
      </div>

    </div>
  );
}

export default App;