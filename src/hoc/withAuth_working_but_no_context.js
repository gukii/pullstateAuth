import React, { useEffect, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

import { R } from '../auth/routeNames' // only used for default value of authFailRoute, could be set to '/'
import { getAuthObj, setAuthObj, validateAuthObj, authObjValid, resetAuthObj, getValuesFromSession, getCurrentUserSession, setCurrentUserSession, EMPTY_USER_AUTH } from '../auth/cognito/config'

import { getStoredUserAuth } from '../auth/cognito/localStorage'
import { jwtExpired, jwtToJson, cognitoTSexpired } from '../auth/cognito/validate'
import getSessionAsync from '../auth/cognito/getSession'

const getSession = getCurrentUserSession
const setSession = setCurrentUserSession

// params: jwtToken
// params: authFailRoute
// params: authFn (function that authenticates based on jwtToken or whatever..)

// both jwtToken AND authFn need to be correct (jwtToken === ok) authFn returns TRUE to be autenticated
// or whatever the code within the HOC stimpulates..


const withAuth = Component => props => {


  const [_authObj, _setAuthObj] = useState()

  //const [showFailed, setShowFailed] = useState(false)  // show failed auth logic (render) = redirect to login
  const [showSucces, setShowSuccess] = useState(false) // show successful auth logic (render) = child component

  const { authFailRoute=R.SIGNIN_ROUTE  } = props

  // prevents first render to default to redirect to authFailRoute
  const [ _firstRun, _setFirstRun ] = useState(true)

  let history = useHistory();
  let location = useLocation();



  useEffect(() => {
/*
    async function _getAuthObjAsync() {
      console.log('_getAuthObjAsync before call..')
      const authObj = await getAuthObj({ ifEmptyCheckStore: true, makeStoreObjGlobalIfGood: true, log:'withAuth async _getAuthObj ' })
      console.log('_getAuthObjAsync after call:', authObj)

      _setAuthObj(authObj)
    }

    _getAuthObjAsync()
*/
    console.log('withAuth first render..')
    /*
    console.log('.withAuth: useEffect1: load session from file')
    console.log('.withAuth: useEffect1: if session valid, use it')
    console.log('.withAuth: useEffect1: if session invalid, update or create new')
    console.log('.withAuth: useEffect1: maybe start timer for auto-token-update')
    */
    _setFirstRun(false)

  }, [])



  useEffect( () => {

      if (_firstRun) return
      if (_authObj === undefined) return

      //const retrivedAuthObj = getAuthObj({ ifEmptyCheckStore: true, makeStoreObjGlobalIfGood: true })

      console.log('useAuthObj effect, _authObj:', _authObj)

    // check if global authObj (located in config.js) is valid
    //  const isValid = authObjValid(retrivedAuthObj)
      const isValid = authObjValid(_authObj)
      if (!isValid) {

        console.log('authObj: is NOT valid, isValid (validateAuthObj) is false..')
        resetAuthObj()
        history.push(authFailRoute, { from: location.pathname })

        //setAuthFailed(true)
        return
      }

      console.log('authObj: isValid (validateAuthObj) is true..:', _authObj)
      setShowSuccess(true)

  }, [_authObj, _firstRun])


  // rendering.....

  if (showSucces) {

    console.log('withAuth: component is authenticated..')
    return <Component { ...props } authenticated={ true } />
  }

  console.log('withAuth: component is not authenticated, access not allowed!!')
  return <div><p>Access not allowed without autentication!!</p>(no authFailRoute specified)</div>
}

export default withAuth




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
