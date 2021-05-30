import React, { useState, useEffect } from 'react'
import '../App.css';

import withAuth from '../hoc/withAuth'



const PrivateItem = props => {

  const [isMounted, setIsMounted] = useState(false)
  // trying to fix memory leak complaint
  useEffect( ()=> {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [] )
  // if (!isMounted) return <div>withAuth is not mounted..</div>

  if (!isMounted) return <div>withAuth is not mounted..</div>


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
