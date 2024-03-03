
import './App.css';

function App() {

  let possibleData;

  async function getData(event) {

      let query = event.target.value;

      if(!query) return;

  }

  return (

    <>
    
      <div className="Header">
        <h1 id="title">Deep Passage Retrieval</h1>
      </div>

      <div className="Query">

        <form>
          <input type="text" id="query" name="query" onChange={getData}/>
        </form>
        
      </div>

      {possibleData}
    
    </>

  );

}

export default App;
