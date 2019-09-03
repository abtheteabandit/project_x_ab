import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';



function App() {

  useEffect(
    ()=>{
      console.log("Hello world")
      // Make a request for a user with a given ID
      fetch('http://localhost:8081/hasSession')
        .then(res => console.log(res.text()))
        .catch(err => {
          console.log(err);
        })	
    },[]
  )

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="http://localhost:1600"
          target="_blank"
          rel="noopener noreferrer"
        >
          Back to Banda Bitches!
        </a>
      </header>
    </div>
  );
}

export default App;
