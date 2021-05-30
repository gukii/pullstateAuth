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
} from "react-router-dom";

import { Redirect } from "react-router";


import { AuthStore } from "../psStore/AuthStore";
import { setUnauthStatus } from '../connectedHelpers/authHelper'
import { getRouteStateVar } from '../containers/routeHelpers'

import { R } from '../routeNames' // only used for default value of authFailRoute, could be set to '/'
//import { EMPTY_USER_AUTH } from '../auth/cognito/config'
//import { getStoredUserAuth } from '../auth/connectedHelpers/localStorage'

// params: authFailRoute (or the one stated in src/auth/routeNames.js will be used), is usually some kind of signIn route


import SignOut from '../containers/signOut'
import SignIn from '../containers/signIn'



export const useAuth = () => {

  const { authOk, username } = AuthStore.useState(s => ({
    authOk:   s.auth.authenticated || false,
    username: s.auth.username || null
  }) )

  const location = useLocation()
  const currentLocation = location.pathname

  //console.log('useAuth useState:', authOk, username)

  return authOk
            ? [ authOk, <SignOut />, username ]
            : [ authOk, <Redirect to={{ pathname: R.SIGNIN_ROUTE, state:{ from:currentLocation } }} />, username ]
}

export default useAuth






/*
if (!!!newAuth.authenticated) {
  setUnauthStatus({ keepUsername: true, log: 'withAuth'})
  // useNavigate only in v6 of react router
  //navigate(authFailRoute, { state:{ from: currentLocation } } )
}
*/


// sample call:
//
// const [checkAuth] = useAuth()


/*
export const useAuth = () => {

  const authOk = AuthStore.useState(s => s.auth.authenticated || false)

  //const { authFailRoute=R.SIGNIN_ROUTE } = props
  const location = useLocation()
  // const history = useHistory()
  // use like this: history.push('/sign-in', [state] )

  //const navigate = useNavigate()
  const currentLocation = location.pathname

  // const isAuthOk = () => {
  //   return authOk
  // }


  // if (authOk) {
  //   console.log('withAuth: component is authenticated..')
  //   return [ authOk, <SignOut /> ]
  // }

  // return [ authOk, <SignIn /> ]

  if (authOk) {

  //  // remember the URL the user came from
  //  const routeOrigin = getRouteStateVar({ location, fieldName: 'from' })

  //  // only redirect the user to his origin URL, if the origin URL is different than signin, signup, or /, otherwise redirect to AUTH_ROUTE (=auth home page)
  //  console.log('routeOrigin:', routeOrigin)

  //  const redirectRoute = routeOrigin !== ''
  //        && routeOrigin.indexOf(R.SIGNIN_ROUTE) === -1
  //        && routeOrigin.indexOf(R.SIGNUP_ROUTE) === -1
  //        && routeOrigin !== R.PUBLIC_HOME_ROUTE
  //              ? routeOrigin
  //              : R.AUTH_ROUTE

  //  window.alert('signInFormAsync redirecting from routeOrigin:'+routeOrigin+' to redirectRoute:'+redirectRoute)

  //  //return <Redirect to={redirectRoute} />;
  //  return [ authOk, <Redirect to={redirectRoute} /> ]

    return [ authOk, null ]
  }

  return [ authOk, <Redirect to={R.SIGNIN_ROUTE} /> ]
}

export default useAuth

*/








/*
  // trying to fix memory leak complaint
  useEffect( ()=> {
    console.log('EFFECT, mounting for Reaction withAuth..')

    // not changing the store within the reaction. but can t use subscription, as it only provides NEW values, but not CURRENT value..
    // looks like reaction and subscription have the same problem with current values not showing.. only triggered events.
    const removeSubscription = AuthStore.subscribe(
      s => s.auth,
      newAuth => {

        // why is this not triggering...

        window.alert('subscription fn for s.auth:', JSON.stringify(newAuth) )
        console.log('subscription listener called with newAuth:', JSON.stringify(newAuth) )
        //authRef.current = newAuth
        //setAuthOk(!!newAuthOk ? true : false)

        // this never catches as /signIn page is not wrapped by withAuth HOC !!!
        if (currentLocation !== authFailRoute) {
          console.log('EFFECT: URL is not signin page (but may still render loginPage)..')
        }

        if (!!newAuth && !!newAuth.authenticated) {
          console.log('EFFECT: is authenticated..')
          setAuthOk( true )
          return
        }

        if (!!!newAuth) {
          console.log('EFFECT newAuth is !!!')
        }

        if (!!newAuth && !!!newAuth.authenticated) {
          console.log('EFFECT: withAuth: component is not authenticated (within sub. effect), access not allowed, resetting auth status and redirecting to sign-in!!')
          //setUnauthStatus({ keepUsername: true, log: 'withAuth effect'})
          setAuthOk( false )
          // !!! don t have to push, render below will render the signIn component when authOk is false..
          //history.push( authFailRoute, { from: currentLocation } )
        }

      }
    )

    return () => {
      console.log('unmounting subscription withAuth..')
      removeSubscription()
      //authRef.current = { authenticated: false }
      //setAuthOk( false )
    }

  }, [] )
*/




/*
import { AuthStore } from "../auth/psStore/AuthStore";


console.log('withAuth outside..')

// reacts to changes of auth..
function authReactor() {

  const unsubscribeReaction = AuthStore.createReaction(s => s.auth, (auth, draft) => {
    console.log('authStore reaction called..')
  })

}
authReactor()

*/







//history.push(authFailRoute, { from: currentLocation })
//return null


/*
  useEffect( ()=> {

      if (!showFailed || _firstRun) return

      console.log('showFailed is true, pushing router to '+authFailRoute+' from:', location.pathname)
      history.push(authFailRoute, { from: location.pathname })

  }, [showFailed, _firstRun])
*/
/*



      ... rest of [_userAuth] useEffect


      // check if session got data = is valid
      if (s === null) {
        resetAuthObj()
        setAuthenticated(false)
        setAuthFailed(true)
        return
      }

      console.log('session is !== null:', s)

      const newAuthObj = _getValuesFromSession(s)

      console.log('useAuthObj new authObj:', newAuthObj)

      setAuthFailed(false)
      setAuthenticated(true)
*/




/*
  useEffect( ()=> {

    console.log('authenticated effect')

      if (!authenticated && !_firstRun && authFailed) {
        console.log('withAuth, !authenticated && !firstRun && authFailed, location.pathname:', location.pathname)
        history.push(authFailRoute, { from: location.pathname })
      }

  }, [authenticated, _firstRun, authFailed])
*/



  //console.log('withAuth: props:', props)









/*

  useEffect(() => {
    // TOKEN VALIDATION HAPPENS HERE
    console.log('.withAuth: useEffect2: token changed, do something:', jwtToken)

    if (jwtToken !== "ok" || !authFn()) {
      console.log('setAuthenticated to false..')
      setAuthenticated(false)
      return
    }

    console.log('setAuthenticated to true..')
    setAuthenticated(true)

    // de-authenticated after 4 secs, to see change ripple thru react components (for testing)
    const timer = setTimeout( () => setAuthenticated(false), 4000);

    // clean up timer on end of effect
    return () => clearTimeout(timer);

  }, [jwtToken, authFn])


*/




  /*
        // async get cognito user session, this is the way to do async calls inside useEffect
        const _getSession = async function() {
          try {
            const sess = await getSessionAsync()
            console.log('getSessionAsync() result ok, sess:', sess)
            setSession(sess)
            _setSession(sess)
          }
          catch(e) {

            console.log('_getSession (getSessionAsync fail) triggers showFail..')

            setSession(null)
            _setSession(null)

            setAuthObj(EMPTY_USER_AUTH)
            _setAuthObj(EMPTY_USER_AUTH)

            console.log('setShowFailed(true)')

            setShowFailed(true) // if prev session was null, and i m setting new session to null, ... useEffect [session] below might not trigger..
          }
        }










        /*
          useEffect( ()=> {

              if (_firstRun) return

              const _getValuesFromSession = async function(s) {
                try {
                  const v = await getValuesFromSession(s)

                  if (v.idToken === undefined) {
                    console.log('getValuesFromSession returns undefined, returning early:', v)
                    return
                  }

                  console.log('getValuesFromSession() v:', v)
                  setAuthObj(v)
                  _setAuthObj(v)

                  setAuthenticated(true)

                  console.log('_getValuesFromSession triggers showSucces..')

                  setShowSuccess(true)

                }
                catch(e) {
                  console.log('ERR: _getValuesFromSession triggers showFail..')

                  setAuthObj(EMPTY_USER_AUTH)
                  _setAuthObj(EMPTY_USER_AUTH)

                  setAuthenticated(true)
                  setShowFailed(true)
                }
              }


              console.log('session effect:', _session)

              // check if session got data = is valid
              if (_session === null) {
                console.log('session === null..')
                resetAuthObj()
                setAuthenticated(false)

                return
              }

              console.log('session is !== null:', _session)

              _getValuesFromSession(_session)

          }, [_session], _firstRun)
        */










    /*const [_firstRun, _setFirstRun] = useState(true)

    // for first render
    useEffect(() => {
      _setFirstRun(false)
    }, [])  */


/*

// not really used anymore

// calls a callback once deadline-marginBefore is reached, used to get a new token before the old one expires
export const callAtTime = async function({ deadline=Date.now()+5000, marginBefore=0, callback=()=>null }) {

    const ts = deadline - Date.now() - marginBefore

    if (ts < 0) {
        // deadline passed already
        console.log('deadline-marginBefore passed already, calling callback now..')
        const res = await callback()
        return res
    }

    // call callback once deadline-margin is reached
    // this should be a propper promise... need to fix
    let res
    setTimeout( async() => {
        console.log('calling at end of deadline-marginBefore..')
        res = await callback()
    }, ts)

    return res
}
*/
