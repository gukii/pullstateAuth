import React from 'react';
import '../App.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  //useParams,
  useRouteMatch
} from "react-router-dom";


import withAuth from '../hoc/withAuth'
import { NavLink } from 'react-router-dom'
import { R } from '../auth/routeNames'

import Sparkles from './sparkles'

import { authContext } from '../auth/contexts/AuthContext'



const PrivateHome = props => {

  let { path, url } = useRouteMatch()

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <p>
              <Sparkles>Private</Sparkles> Home, Page1 component showing.. { JSON.stringify(props) }
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
            to={ R.PRIVATE_ITEM_LIST }
            activeStyle={{
              fontWeight: "bold",
              color: "red"
            }}
          >
            Item List
          </NavLink>

          <NavLink
            to={`${url}/more`}
            activeStyle={{
              fontWeight: "bold",
              color: "red"
            }}
          >
            <Sparkles>More</Sparkles>
          </NavLink>

        </header>
      </div>

      <Switch>

        <Route path={`${path}/more`}>
          <MoreComponent />
        </Route>

      </Switch>

    </Router>

  )
}

//export default PrivateHome

export default withAuth(PrivateHome)

export const PrivateHomeNoAuth = PrivateHome



function MoreComponent() {

  const {
    //auth,
    renewSession,
  } = React.useContext(authContext);


  return (
    <div>
      <h2>More stuff, links are invalid</h2>
      <ul>
        <li>
          <Link to={R.PRIVATE_HOME_ROUTE}>Private Home</Link>
        </li>
        <li>
          <Link to={'/'}>Public Home</Link>
        </li>

        <button onClick={ async()=> {
            const newAuthObj = await renewSession(true) // true = forceUpdate of the session, even if the current session has not expired yet
            if (newAuthObj === null) {
              console.log('ERROR, privateHome calling renewSession failed.')
              // the forwarding to signIn only happens for components that are
              // encapsulated by HOC withAuth(), here I d have to forward the user manually to signIn
              // e.g.: history.push(authFailRoute, { from: currentLocation })

              return
            }
            console.log('SUCCESS, privateHome calling renewSession succeeded:', newAuthObj)
        }}>
          Renew Session Now
        </button>

      </ul>


    </div>
  );
}
