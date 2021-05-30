import React, { useState, useEffect } from 'react';
import '../App.css';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  //useParams,
  useRouteMatch
} from "react-router-dom";

//import { Redirect } from "react-router";


import withAuth from '../hoc/withAuth'
import { NavLink } from 'react-router-dom'
import { R } from '../auth/routeNames'


import { renewSession } from "../auth/connectedHelpers/renewSession"
//import { AuthStore } from "../auth/psStore/AuthStore";




//import PublicHome from './publicHome'



// CAN T ROUTE BACK TO PUBLIC_HOME, NOT SURE WHY... SEEMS A ROUTER ISSUE.
// NON OF THE ROOT ROUTER ROUTES WORK IN THE SUB-ROUTER..
//
// THE URL CHANGES, BUT PUBLIC_HOME DOES NOT GET RENDERED, PRIVATE HOME DOES GET RENDERED INSTEAD


  // The `path` lets us build <Route> paths that are
  // relative to the parent route, while the `url` lets
  // us build relative links.
const PrivateHome = props => {
  let { path, url } = useRouteMatch();


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
        <ul>
          <li>
            <Link to={R.PRIVATE_ITEM_LIST}>Private Item List</Link>
          </li>
          <li>
          <Link to={R.PUBLIC_HOME_ROUTE}>Public Home</Link>
          </li>
          <li>
          <Link to={`${url}/more`}>More</Link>
          </li>
          <li>
            <Link to={`/`}>Home</Link>
          </li>
        </ul>

        <NavLink
          to={ R.PRIVATE_ITEM_LIST }
          activeStyle={{
            fontWeight: "bold",
            color: "white"
          }}
        >
          Item List
        </NavLink>

        <Switch>
          <Route exact path={path}>
            <h3>Please select a topic.</h3>
          </Route>

          <Route path={`${path}/more`}>
            <MoreComponent />
          </Route>

        </Switch>
      </header>
    </div>
  );
}

//export default PrivateHome

export default withAuth(PrivateHome)

export const PrivateHomeNoAuth = PrivateHome


///////////////////////////////////

function MoreComponent() {  // check access token / id token expiration time any time the access token (and its related accessTokenExp) gets updated
  // sign the user out, once the session is expired

  return (
    <div>
      <h2>More stuff, links are invalid</h2>
      <ul>
        <li>
          <Link to={R.PRIVATE_HOME_ROUTE}>Private Home</Link>
        </li>
        <li>
          <Link to={R.PUBLIC_HOME_ROUTE}>Public Home</Link>
        </li>
        <li>
          <Link to={R.PRIVATE_ITEM_LIST}>Private Item List</Link>
        </li>
        <li>
          <Link to={R.SIGNIN_ROUTE}>Sign In</Link>
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
