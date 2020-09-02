
import { storeUserAuth, resetStoredUserAuth } from "../connectedHelpers/localStorage";

import { EMPTY_USER_AUTH } from "../cognito/config";
import { AuthStore } from "../psStore/AuthStore";


//
// sets and unset the pullstate auth store
//


export const setAuthStatus = (userAuth) => {

  storeUserAuth(userAuth)
  //setAuth(userAuth);

  AuthStore.update(s => {
    s.auth = userAuth
  })   
  
};


// keepUsername: keeps the usernam when "auth" gets reset/overwritten by the values of EMPTY_USER_AUTH
// log: just a log message that can be written out to console
// newUsername: injects a new username into the empty auth object (e.g. used at signUp to remember new username, for creating cogntioUser)
export const setUnauthStatus = ({ keepUsername=false, log='', props=null }) => {

  console.log('AuthStore:', AuthStore)
  //const auth = AuthStore.useState(s => s.auth)

  const auth = AuthStore.currentState.auth

  console.log('setUnauthStatus, log:', log, ' keepUsername:', keepUsername, ' auth.username:', auth.username)
  const emptyObj = keepUsername && !!auth.username && auth.username.length > 0 
                    ? !!props 
                        ? { ...EMPTY_USER_AUTH, ...props, username: auth.username } 
                        : { ...EMPTY_USER_AUTH, username: auth.username }
                    : !!props 
                        ? { ...EMPTY_USER_AUTH, ...props } 
                        : EMPTY_USER_AUTH

  resetStoredUserAuth( emptyObj )
  //setAuth( emptyObj );

  AuthStore.update(s => {
    s.auth = emptyObj
  })    

};













/*

// subscribes to AuthStore and watches expiration of tokens
// triggers token renewal before tokens expire
// or sends user to login once they do expire
export const authTokenWatcher = () => {


  useEffect(() => {
    
    console.log('AuthStore subscription ON')
    const unsubscribeFromAuth = AuthStore.subscribe(
      s => s.auth,
      newAuth => {
        setAuthStatus(newAuth)
      }
    );
    
    return () => {
      console.log('AuthStore Auth subscription OFF')

      unsubscribeFromAuth();
    };
  }, [setAuthStatus]);



  
  //
  // if username is stored in localStorage, this will ALSO instantiate a session (including renewal timer), even if the user visits a public route..
  // the whole app is listening on AuthContext, the useEffect triggers affect all routes, public and private once user is logged in
  //


  // (0)
  // TIMER THAT RE-NEWS SESSION BEFORE THEY EXPIRE.. (could be called after successful authentication + sessionRenewal)
  // activates before access token expires, SECS_BEFORE, and tries to request new tokens / session
  //
  // see /src/auth/cognito/config.js for test settings that will re-new sessions 20 secs after session creation.
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
        connRenewSessionAsync({ setUnauthStatus, setAuthStatus, username, setUsername, auth, forceUpdate:false, log:'called by TIMER EFFECT' })
      }, timerDuration );

      // clean up timer on unmount of effect
      return () => clearTimeout(timer);

    }

    //console.log('accessToken is 0, not setting TIMER EFFECT to renew session')

  }, [auth, setAuthStatus, setUnauthStatus, username])



  // check access token / id token expiration time any time the access token (and its related accessTokenExp) gets updated
  // sign the user out, once the session is expired

  useEffect( ()=> {


    const timeUntilAccessTokenExpiration = msUntilCognitoTS({ cognitoTS: auth.accessTokenExp, margin: 0 })
    const timeUntilIdTokenExpiration = msUntilCognitoTS({ cognitoTS: auth.idTokenExp, margin: 0 })

    // session expired
    if (timeUntilAccessTokenExpiration <= 0 || timeUntilIdTokenExpiration <= 0) {

      console.log('AuthContext session expiration time check, session expired, trying to connRenewSession..')
      const res = connRenewSessionAsync({ setUnauthStatus, setAuthStatus, username, auth, log:'AuthContext detected access/id token expired' })

    }
    //setUnauthStatus({ keepUsername: true, log: "AuthContext session expiration time check, session expired.. "})

  }, [auth, setAuthStatus, setUnauthStatus, username])


}

*/



