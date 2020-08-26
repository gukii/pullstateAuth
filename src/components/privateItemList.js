import React from 'react';
import '../App.css';

import withAuth from '../hoc/withAuth'
import { R } from '../auth/routeNames'
import { NavLink } from 'react-router-dom'



const PrivateItemList = props => {

  return (
    <div className="App">
      <header className="App-header">
        <p>
          Private, PrivateItemList component showing.. { JSON.stringify(props) }
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>

        <NavLink
          to={ R.PRIVATE_HOME_ROUTE }
          activeStyle={{
            fontWeight: "bold",
            color: "red"
          }}
        >
          Private Home
        </NavLink>

      </header>
    </div>
  )
}

//export default PrivateHome

export default withAuth(PrivateItemList)
