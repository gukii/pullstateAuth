import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  //Link
} from "react-router-dom";



import SignIn from '../auth/containers/signIn'
import SignUp from '../auth/containers/signUp'
import SignOut from '../auth/containers/signOut'

import PublicHome from '../components/publicHome'
import PrivateHome from '../components/privateHome'

import { PrivateHomeNoAuth } from '../components/privateHome'


// import some constants for named routes
import { R } from './routeNames'




// only goes one level deep, due to the map statement. need different loop to go thru deeper nedsted tree
export default function RouterExample() {


  return (
    <Router>
      <div>

        <p>
          main menu (from router)
        </p>

      { /* main menu
        <ul>
          <li>
            <Link to="/tacos">Tacos</Link>
          </li>
          <li>
            <Link to="/sandwiches">Sandwiches</Link>
          </li>
        </ul>
        */ }

        <Switch>



          <Route path={R.SIGNIN_ROUTE}>
            <SignIn />
          </Route>

          <Route path={R.SIGNOUT_ROUTE}>
            <SignOut />
          </Route>

          <Route path={R.SIGNUP_ROUTE}>
            <SignUp />
          </Route>


          { /* dont use "exact" on private routes, because PrivateHome is its own router component, it needs to handle routes below itself */ }
          <Route path={R.PRIVATE_HOME_ROUTE}>
            <PrivateHome  />
          </Route>




          <Route path={R.PUBLIC_HOME_ROUTE} >
            <PublicHome />
          </Route>


        </Switch>
      </div>
    </Router>
  );
}







/*
          <Route exact path={R.PRIVATE_ITEM_LIST}>
            <PrivateItemList/>
          </Route>

          <Route exact path={R.PRIVATE_ITEM} >
            <PrivateItem authFailRoute={R.SIGNIN_ROUTE} />
          </Route>

          <Route exact path={R.PRIVATE_ITEM_HISTORY}>
            <PrivateItemHistory jwtToken="ok" authFn={ ()=> true } />
          </Route>



          <Route exact path={'/double'}>
            <PrivateHomeDouble jwtToken="ok" authFn={ ()=> true } />
          </Route>




          <PrivateRouteWithProps exact path="/protected" authFn={ ()=>true } jwtToken="ok" Component={PrivateHome} authFailRoute={R.SIGNIN_ROUTE}/>


          <PrivateRoute exact path="/protected2" authFn={ ()=>authFn } jwtToken={ jwtToken }>
            <PrivateHomeNoAuth  />
          </PrivateRoute>
*/

/*

// A special wrapper for <Route> that knows how to
// handle "sub"-routes by passing them in a `routes`
// prop to the component it renders.

// only goes one level deep. futher deep will not work
export function RouteWitFailroute(route) {
  console.log('route:', route)
  //       exact={route.exact || false}

  return (
    <Route
      path={route.path}
      render={props => (
        // pass the sub-routes down to keep nesting
        <route.component {...props} routes={route.routes} />
      )}
    />
  );
}

export function fakeAuth(val=true) {
  return val
}



// double protection by router's own authFn check, and HOC's authFn and jwtToken check:

// authFailRoute are used by router and HOC
// authFn only works for the router, but not the HOC (is not passed down), could pass it down as well if i allow it inside the HOC
// jwtToken and authFailRoute r passed down to HOC
function PrivateRouteWithProps({ Component, authFailRoute=R.SIGNIN_ROUTE, authFn=()=>false, jwtToken="", ...rest }) {
  return (
    <Route
      {...rest}
      render={routeProps => (
        authFn() ? (
          <Component {...routeProps} jwtToken={jwtToken} authFn={authFn} authFailRoute={authFailRoute} />
        ) : (
          <Redirect
            to={{
              pathname: authFailRoute,
              state: { from: routeProps.location }
            }}
          />
        )

      )}
    />
  );
}





// single protection by router's own authFn check, no HOC components supported, HOC will not receive authFn NOR jwtToken
// only to be used with components that dont use "withAuth" HOC = but require router auth route security


// A wrapper for <Route> that redirects to the login
// screen if you're not yet authenticated.

// use like this:
//
//<PrivateRoute exact path={path} redirectRoute="/" authFn={ ()=>fakeAuth(false) }>
//  <ProtectedPage />
//</PrivateRoute>
//
// without "exact", and being located near the top of SWITCH statement, the private route will catch even deeper nested routes!!


// this is the only way where react does NOT complain of in-render issues:
// Warning: Cannot update during an existing state transition (such as within `render`). Render methods should be a pure function of props and state.

export function PrivateRoute({ children, jwtToken='', authFn=()=>false, authFailRoute=R.SIGNIN_ROUTE, ...rest }) {
  return (
    <Route
      {...rest}
      render={({ location }) =>

        authFn() && jwtToken ==="ok" ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: authFailRoute,
              state: { from: location }
            }}
          />
        )

      }
    />
  );
}

*/
