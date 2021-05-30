import React, { useEffect, useState, useRef } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  NavLink,
  useHistory,
  useLocation,
  // useNavigate, // only in v6 of react router
  //useParams,
  useRouteMatch
} from "react-router-dom";import { Redirect } from "react-router";

import { AuthStore } from "../auth/psStore/AuthStore";
import { setUnauthStatus } from '../auth/connectedHelpers/authHelper'
import { getRouteStateVar } from '../auth/containers/routeHelpers'


import { R } from '../auth/routeNames' // only used for default value of authFailRoute, could be set to '/'
//import { EMPTY_USER_AUTH } from '../auth/cognito/config'
//import { getStoredUserAuth } from '../auth/connectedHelpers/localStorage'

//
//
// params: authFailRoute (or the one stated in src/auth/routeNames.js will be used), is usually some kind of signIn route
// ANY components encapsulated with "withAuth" HOC requires authentication.
// ANY component without "withAuth" does NOT require authentication, but can display: signIn, signUp compnents
//
//

import SignOut from '../auth/containers/signOut'
import SignIn from '../auth/containers/signIn'



const withAuth = Component => props => {

  const { authOk, username } = AuthStore.useState(s => ({
    authOk:   s.auth.authenticated || false,
    username: s.auth.username || null
  }) )

  // props include react router's history, location
  // const location = { props } // however, this will not bring the state variable (from) along, and forget where the user came from..
  const location = useLocation()  // this works

  console.log('withAuth props:', props)

  const { authFailRoute=R.SIGNIN_ROUTE } = props
  const currentLocation = location.pathname

  // const navigate = useNavigate()  // only in newest react router
  // navigate(authFailRoute, { state:{ from: currentLocation } } )

  return authOk
            ? <><SignOut /><Component { ...props }  /></>
            : <Redirect to={{ pathname: R.SIGNIN_ROUTE, state:{ from:currentLocation } }} />


  // return authOk
  //           ? <><SignOut /><Component { ...props }  /></>
  //           : <><p>!! not authenticated !!</p><SignIn /></>

}

export default withAuth


// below is the previous, more complex iteration of this HOC:

/*

// if (!!!newAuth.authenticated) {
//   setUnauthStatus({ keepUsername: true, log: 'withAuth'})
//   // useNavigate only in v6 of react router
//   //navigate(authFailRoute, { state:{ from: currentLocation } } )
// }


const withAuth = Component => props => {

  const [ isMounted, setIsMounted] = useState(false)
  //const [authOk, setAuthOk] = useState(false)

  //const [ authOk, setAuthOk] = useState(null)
  const authOk = AuthStore.useState(s => s.auth.authenticated || false)


  const { authFailRoute=R.SIGNIN_ROUTE } = props

  const location = useLocation()  // one of these two should be enough..
  const history = useHistory()

  //const navigate = useNavigate()
  const currentLocation = location.pathname
  // this never is /signIn ... but also /private ... not sure why...
  // >> because the render function below renders the signIn component with authOk is false..!!

  // because the /signIn page is not wrapped in withAuth HOC !!


//  useEffect( ()=> {
//    console.log('EFFECT, mounting withAuth..')
//    setIsMounted(true)
//    return () => setIsMounted(false)
//  }, [] )




//  // trying to fix memory leak complaint
//  useEffect( ()=> {
//    console.log('EFFECT, mounting for Reaction withAuth..')
//
//    // not changing the store within the reaction. but can t use subscription, as it only provides NEW values, but not CURRENT value..
//    // looks like reaction and subscription have the same problem with current values not showing.. only triggered events.
//    const removeSubscription = AuthStore.subscribe(
//      s => s.auth,
//      newAuth => {
//
//        // why is this not triggering...
//
//        window.alert('subscription fn for s.auth:', JSON.stringify(newAuth) )
//        console.log('subscription listener called with newAuth:', JSON.stringify(newAuth) )
//        //authRef.current = newAuth
//        //setAuthOk(!!newAuthOk ? true : false)
//
//        // this never catches as /signIn page is not wrapped by withAuth HOC !!!
//        if (currentLocation !== authFailRoute) {
//          console.log('EFFECT: URL is not signin page (but may still render loginPage)..')
//        }
//
//        if (!!newAuth && !!newAuth.authenticated) {
//          console.log('EFFECT: is authenticated..')
//          setAuthOk( true )
//          return
//        }
//
//        if (!!!newAuth) {
//          console.log('EFFECT newAuth is !!!')
//        }
//
//        if (!!newAuth && !!!newAuth.authenticated) {
//          console.log('EFFECT: withAuth: component is not authenticated (within sub. effect), access not allowed, resetting auth status and redirecting to sign-in!!')
//          //setUnauthStatus({ keepUsername: true, log: 'withAuth effect'})
//          setAuthOk( false )
//          // !!! don t have to push, render below will render the signIn component when authOk is false..
//          //history.push( authFailRoute, { from: currentLocation } )
//        }
//
//      }
//    )
//
//    return () => {
//      console.log('unmounting subscription withAuth..')
//      removeSubscription()
//      //authRef.current = { authenticated: false }
//      //setAuthOk( false )
//    }
//
//  }, [] )





//  // because subscription only returns NEW values, but not current value..
//  // there got to be a better way to do this.. ==> use "Reactions" rather than a "Subscription", even thou we only read values..
//
//  const a = AuthStore.useState(s => s.auth)
//  if (authOk === null) {
//    console.log('a:', a)
//    setAuthOk( !!a.authenticated )
//  }




  //if (!isMounted) return null

  if (authOk) {
    console.log('withAuth: component is authenticated..')
    return <div><SignOut /><Component { ...props }  /></div>
    //return [ authOk, <SignOut />, "authenticated" ]
  }

  return <div><p>!! not authenticated !!</p><SignIn /></div>
  //return [ authOk, <SignIn />, "not authenticated" ]



}

export default withAuth
*/
