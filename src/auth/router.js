import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  //Redirect,
  //Link,
} from "react-router-dom";



import SignIn from '../auth/containers/signIn'
import SignUp from '../auth/containers/signUp'
import SignOut from '../auth/containers/signOut'

import PublicHome from '../components/publicHome'
import PrivateHome from '../components/privateHome'

import PrivateItem from '../components/privateItem'

import PrivateItemList from '../components/privateItemList'
import PrivateItemListWithHook from '../components/privateItemListWithHook'


//import { PrivateHomeNoAuth } from '../components/privateHome'


// import some constants for named routes
import { R } from './routeNames'




// only goes one level deep, due to the map statement. need different loop to go thru deeper nedsted tree
export default function RouterExample() {


  return (
    <Router>
      <>

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

          <Route exact path={R.PUBLIC_HOME_ROUTE} component={PublicHome} />

          <Route exact path={R.SIGNIN_ROUTE} component={SignIn} />

          <Route exact path={R.SIGNOUT_ROUTE} component={SignOut} />

          <Route exact path={R.SIGNUP_ROUTE} component={SignUp} />

          <Route exact path={R.PRIVATE_ITEM_LIST} component={PrivateItemListWithHook} />

          <Route exact path={R.PRIVATE_ITEM} component={PrivateItem} />


          { /* dont use "exact" on private routes, because PrivateHome is its own router component, it needs to handle routes below itself */ }
          <Route path={R.PRIVATE_HOME_ROUTE} component={PrivateHome} />

          <Route path={R.AUTH_ROUTE} component={PrivateHome} />

          <Route path={R.PUBLIC_HOME_ROUTE} component={PublicHome} />

        </Switch>

      </>
    </Router>
  );
}

/* this way SignOut does not automatically get history, location, .. props from react router:

          <Route exact path={R.SIGNOUT_ROUTE}>
            <SignOut />
          </Route>
*/





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













import { AuthStore } from "./psStore/AuthStore";

import { showExpirationTime } from './cognito/showExpirationTime'
import { connRenewSessionAsync } from './connectedHelpers/connRenewSession'
import msUntilCognitoTS from './cognito/msUntilCognitoTS'
import { TRIGGER_TOKEN_RENEW_SECS_BEFORE_EXPIRATION } from "./cognito/config";
import { setAuthStatus, setUnauthStatus } from './connectedHelpers/authHelper'



/* this just got moved to psStore/AuthStore, still testing how well it works there
  WORKS

  //////////////////////////////////////////////////////////////
  // FUNCTIONALITY TO AUTO-RENEW SESSIONS BEFORE THEY EXPIRE (SO SERVER-SENT-EVENTS ALWAYS HAVE A VALID JWT TOKEN)
  // maybe should put this somewhere else..
  //

  const auth = AuthStore.useState(s => s.auth)

  useEffect( ()=> {
    console.log('main router effect called, auth:', auth)
    if (!auth.authenticated && !!auth.username && auth.username.length > 0) {
      console.log('got username, but not authenticated. trying to renew session..', auth)
      connRenewSessionAsync({ setUnauthStatus, setAuthStatus, username:auth.username, setUsername:null, auth, forceUpdate:false, log:'called by ROUTER' })

    }
  },[auth])




  useEffect( ()=> {
    if (!auth.authenticated) return
    if (auth.accessTokenExp === 0) return

    console.log('TIMER EFFECT: auth.authenticated:', auth.authenticated, ' auth.accessTokenExp:', auth.accessTokenExp)


    if (auth.accessTokenExp > 0) {
      // we are logged in and have an expiration date of the accessToken
      console.log('TIMER EFFECT: access token expiration time:', showExpirationTime(auth.accessTokenExp) )
      console.log('TIMER EFFECT: sessionRenew trigger set at:', showExpirationTime(auth.accessTokenExp-TRIGGER_TOKEN_RENEW_SECS_BEFORE_EXPIRATION) )

      const timerDuration = msUntilCognitoTS({ cognitoTS: auth.accessTokenExp, margin: TRIGGER_TOKEN_RENEW_SECS_BEFORE_EXPIRATION })

      console.log('TIMER EFFECT: duration until sessionRenew trigger in ms:', timerDuration, ' in secs:', timerDuration/1000, ' in mins:', timerDuration/1000/60)

      const timer = setTimeout( () => {
        console.log('TIMER EFFECT: RENEW ACCESS TOKEN PLACEHOLDER, resetting authObj.. ')
        connRenewSessionAsync({ setUnauthStatus, setAuthStatus, username:auth.username, setUsername:null, auth, forceUpdate:false, log:'called by TIMER EFFECT' })
      }, timerDuration );

      // clean up timer on unmount of effect
      return () => clearTimeout(timer);

    }

    //console.log('accessToken is 0, not setting TIMER EFFECT to renew session')

  }, [auth])
*/


/* // THIS IS NOW DONE WITHIN connectedHelpers/connRenewSession.js
   //

  // check access token / id token expiration time any time the access token (and its related accessTokenExp) gets updated
  // e.g. after session re-newal before token expires..
  // sign the user out, once the session is expired

  useEffect( ()=> {

    const timeUntilAccessTokenExpiration = msUntilCognitoTS({ cognitoTS: auth.accessTokenExp, margin: 0 })
    const timeUntilIdTokenExpiration = msUntilCognitoTS({ cognitoTS: auth.idTokenExp, margin: 0 })

    // session expired
    if (timeUntilAccessTokenExpiration <= 0 || timeUntilIdTokenExpiration <= 0) {

      console.log('session expiration time check, session expired, trying to connRenewSession..')
      connRenewSessionAsync({ setUnauthStatus, setAuthStatus, username:auth.username, auth, log:'connRenew detected access/id token expired' })

    } else {
      console.log('session not expired yet..')
    }

  }, [auth])


///////////////////////////////////////////////// END OF SESSION-RENEW FUNCTIONALITY //







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
