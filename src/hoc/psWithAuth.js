import React from 'react'
import { useLocation } from 'react-router-dom'
import { Redirect } from "react-router";

import { AuthStore } from "../psStore/AuthStore";
import { setUnauthStatus } from '../custom-hooks/psAuthHandler'

import { R } from '../auth/routeNames' // only used for default value of authFailRoute, could be set to '/'
//import { EMPTY_USER_AUTH } from '../auth/cognito/config'
//import { getStoredUserAuth } from '../auth/cognito/localStorage'

// params: authFailRoute (or the one stated in src/auth/routeNames.js will be used), is usually some kind of signIn route


import SignOut from '../auth/containers/signOut'
const withAuth = Component => props => {

  const auth = AuthStore.useState(s => s.auth)
  //const authenticated = AuthStore.useState(s => s.authenticated)
  //const authenticated = AuthStore.useState(s => s.auth.authenticated)  // could use this one as well, but might not reflect timed-out jwt tokens


  const { authFailRoute=R.SIGNIN_ROUTE } = props
  const location = useLocation();
  const currentLocation = location.pathname



  if (auth.authenticated) {

    console.log('withAuth: component is authenticated..')
    return <div><SignOut /><Component { ...props }  /></div>
  }

/*

  const storedUserAuth = getStoredUserAuth({ log:'renewSession (getUsernameCached)', emptyObj: null })
  if (storedUserAuth !== null && storedUserAuth.authenicated ) {
    setAuthStatus(storedUserAuth)
    return null
  }
*/
  console.log('withAuth: component is not authenticated, access not allowed, resetting auth status and redirecting to sign-in!!')
  setUnauthStatus({ keepUsername: true, log: 'withAuth'})

  return <Redirect
    to={{
      pathname: authFailRoute,
      state: { from: currentLocation }
    }}
  />

}

export default withAuth


















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
