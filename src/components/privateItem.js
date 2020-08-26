import React from 'react';
import '../App.css';

import withAuth from '../hoc/withAuth'



const PrivateItem = props => {

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Private, PrivateItem component showing.. { JSON.stringify(props) }
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  )
}

//export default PrivateHome

export default withAuth(PrivateItem)
