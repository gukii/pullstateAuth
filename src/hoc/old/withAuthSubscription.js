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


/*
if (!!!newAuth.authenticated) {
  setUnauthStatus({ keepUsername: true, log: 'withAuth'})
  // useNavigate only in v6 of react router
  //navigate(authFailRoute, { state:{ from: currentLocation } } )
}
*/


const withAuth = Component => props => {

  //const [isMounted, setIsMounted] = useState(false)
  //const [authOk, setAuthOk] = useState(false)

  const [authOk, setAuthOk] = useState(null)


  //const authRef = useRef({ authenticated: false })
  //const authRef = useRef( AuthStore.useState( s => s.auth ) )

  //const auth = useStoreState( AuthStore, s => s.auth )
  //const auth = AuthStore.useState(s => isMounted ? s.auth : { ...s.auth, s.authenticated} )
  //const authenticated = AuthStore.useState(s => s.authenticated)
  //const authenticated = AuthStore.useState(s => s.auth.authenticated)  // could use this one as well, but might not reflect timed-out jwt tokens


  const { authFailRoute=R.SIGNIN_ROUTE } = props
  const location = useLocation()
  const history = useHistory()

  //const navigate = useNavigate()
  const currentLocation = location.pathname
  // this never is /signIn ... but alsoway /private ... not sure why...
  // because the /signIn page is not wrapped in withAuth HOC !!


  // trying to fix memory leak complaint
  useEffect( ()=> {
    //setIsMounted(true)
    console.log('EFFECT, mounting withAuth..')

    const unsubscribeFromAuth = AuthStore.subscribe(
      s => s.auth,
      newAuth => {
        window.alert('subscribed fn for s.auth:', JSON.stringify(newAuth) )
        console.log('subscribe listener called with newAuth:', JSON.stringify(newAuth) )
        //authRef.current = newAuth
        //setAuthOk(!!newAuthOk ? true : false)

        // this never catches as /signIn page is not wrapped by withAuth HOC !!!
        if (currentLocation !== authFailRoute) {
          console.log('EFFECT: not on signin page..')
        }

        if (newAuth && newAuth.authenticated) {
          console.log('EFFECT: is authenticated..')
          setAuthOk( true )

        }

        if (!!!newAuth) {
          console.log('EFFECT newAuth is !!!')
        }

        if (!!newAuth && !!!newAuth.authenticated) {
          console.log('EFFECT: withAuth: component is not authenticated (within sub. effect), access not allowed, resetting auth status and redirecting to sign-in!!')
          //setUnauthStatus({ keepUsername: true, log: 'withAuth effect'})
          setAuthOk( false )
          history.push( authFailRoute, { from: currentLocation } )
        }

      }
    )

    return () => {
      unsubscribeFromAuth()
      //authRef.current = { authenticated: false }
      setAuthOk( false )
      //setIsMounted(false)
    }

  }, [] )


  // because subscription only returns NEW values, but not current value..
  // there got to be a better way to do this.. ==> use a "Reactions" rather than a "Subscription"
  const a = AuthStore.useState(s => s.auth)
  if (authOk === null) {
    console.log('a:', a)
    setAuthOk( !!a.authenticated )
  }


  // if (!isMounted) return <div>withAuth is not mounted..</div>


/*
  useEffect( ()=> {

    // remember the URL the user came from
    const routeOrigin = getRouteStateVar({ location, fieldName: 'from' })
    console.log('routeOrigin:', routeOrigin)

    const pushRoute = routeOrigin !== ''
          && routeOrigin.indexOf(R.SIGNIN_ROUTE) === -1
          && routeOrigin.indexOf(R.SIGNUP_ROUTE) === -1
          && routeOrigin !== R.PUBLIC_HOME_ROUTE
                ? routeOrigin
                : R.AUTH_ROUTE
    console.log('pushRoute:', pushRoute)



    if (!!!authOk) {

      // this never catches as /signIn page is not wrapped by withAuth HOC !!!

      // if not authenciated, and not on SIGNIN / SIGNUP page, push router to SIGNIN page

      console.log('currentLocation !== authFailRoute:', currentLocation !== authFailRoute, currentLocation, authFailRoute)

      console.log('EFFECT2, not authed and not on signinPage, kicking to authFailRoute..')
      window.alert('withAuth EFFECT2 redirecting from routeOrigin:'+routeOrigin+' to pushRoute:'+pushRoute)

      //history.push( authFailRoute, { from: currentLocation } )
      history.push( authFailRoute, { from: pushRoute } )

    } else {
      console.log('EFFECT2, authed OR on signin page..')


      //history.push( pushRoute, { from: routeOrigin } )

    }

  }, [authOk])
*/

  // trying to fix memory leak complaint
  // if (!isMounted) return null


  //if (authRef.current && authRef.current.authenticated) {
  if (!!authOk ) {

    console.log('withAuth: component is authenticated..')
    return <div><SignOut /><Component { ...props }  /></div>
  }

  return (<div><p>!! not authenticated !!</p><SignIn /></div>)


  //console.log('withAuth NOT authenticated, authOk:', authRef.current)
  //return null



  //return (<div>not authenticated</div>)



  //console.log('withAuth: component is not authenticated, access not allowed, resetting auth status and redirecting to sign-in!!')
  //setUnauthStatus({ keepUsername: true, log: 'withAuth'})


  return <Redirect
    to={{
      pathname: authFailRoute,
      state: { from: currentLocation }
    }}
  />


}

export default withAuth













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
