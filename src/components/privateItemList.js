import React, { useState, useEffect } from 'react'
import '../App.css';

import withAuth from '../hoc/withAuth'
import { R } from '../auth/routeNames'
import { NavLink } from 'react-router-dom'



const PrivateItemList = props => {

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
          Private, PrivateItemList component showing.. { JSON.stringify(props) }
        </p>


        <NavLink
          to={ R.PRIVATE_HOME_ROUTE }
          activeStyle={{
            fontWeight: "bold",
            color: "red"
          }}
        >
          Private Home
        </NavLink>


        <NavLink
          to={ R.PUBLIC_HOME_ROUTE }
          activeStyle={{
            fontWeight: "bold",
            color: "green"
          }}
        >
          Public Home
        </NavLink>

      </header>
    </div>
  )
}

//export default PrivateHome

export default withAuth(PrivateItemList)
