import React, { useEffect } from "react";

// REFACTORING AWAY FROM CONTEXT TO PULLSTATE..
// NEED TO FIGURE OUT A WAY TO IMPLEMENT 
// USE-EFFECT STUFF WITH PULLSTATE SUBSCRIPTION OR REACTIONS


/** Custom types */
//import { UserAuth } from "../custom-types";

/** Custom Hooks */
import useAuthHandler from "../custom-hooks/AuthHandler";
//import useAuthHandler from "../custom-hooks/psAuthHandler";

import { showExpirationTime } from '../cognito/showExpirationTime'
import { connRenewSessionAsync } from '../connectedHelpers/connRenewSession'
import msUntilCognitoTS from '../cognito/msUntilCognitoTS'


/*
import { TRIGGER_TOKEN_RENEW_SECS_BEFORE_EXPIRATION, ALLOW_SESSION_RENEW_SECS_BEFORE_EXPIRATION, EMPTY_USER_AUTH, getCurrentUser, getValuesFromSession, getUserPool } from "../cognito/config";
import { getStoredUserAuth } from "../cognito/localStorage";
import refreshSessionAsync from '../cognito/refreshSession'
import getSessionAsync from '../cognito/getSession'
*/

import { getStoredUserAuth } from "../cognito/localStorage";
import { TRIGGER_TOKEN_RENEW_SECS_BEFORE_EXPIRATION, EMPTY_USER_AUTH } from "../cognito/config";

import { useHistory } from 'react-router-dom'
import { R } from '../routeNames'

import { AuthStore } from "../psStore/AuthStore";


export const authContext = React.createContext({

  confirmUserModalOpened: false,        // for authentication confirmation of user (email or phone)
  setConfirmUserModalOpened: () => {},

  confirmAttributeModalOpened: false,   // for authentication confirmation of OTHER attribute (email or phone), if both email and phone needs to be verified
  setConfirmAttributeModalOpened: () => {},

  confirmMfaModalOpened: false,         // for signin Mfa code confirmation (phone, email or short-term password)
  setConfirmMfaModalOpened: () => {},

  auth: EMPTY_USER_AUTH,
  setAuthStatus: () => {},
  setUnauthStatus: () => {},

  userTimestamp: 0,
  setTimestamp: () => {},

  userId: "",
  setUserId: () => {},

  session: null,
  setSession: () => {},

  username: "",
  setUsername: () => {},

  renewSession: () => {},

  userAccountVerified: false,
  setUserAccountVerified: () => {}, // to confirm cognito account sign up (user or email)

  attributeVerified: false,
  setAttributeVerified: () => {},   // to confirm 2nd cognito user attribute (such as email/phone)

  mfaVerified: false,
  setMfaVerified: () => {},         // to confirm mfa code on signIn

});



const { Provider } = authContext;

const AuthProvider = function({ children }) {

  // context values/functions get stored using these useState hooks:
  const [userTimestamp, setTimestamp] = React.useState(0);
  const [userId, setUserId] = React.useState("");
  const [username, setUsername] = React.useState("");

  //const [cognitoUser, setCognitoUser] = React.useState(null);
  const [session, setSession] = React.useState(null);

  const [confirmUserModalOpened, setConfirmUserModalOpened] = React.useState(false);
  const [confirmMfaModalOpened, setConfirmMfaModalOpened] = React.useState(false);
  const [confirmAttributeModalOpened, setConfirmAttributeModalOpened] = React.useState(false);


  const [userAccountVerified, setUserAccountVerified] = React.useState(false);  // during signUp
  const [attributeVerified, setAttributeVerified] = React.useState(false);      // during signUp
  const [mfaVerified, setMfaVerified] = React.useState(false);                  // during signIn


  // this will try to read from localStorage any time the app is executed and rendered !!
  // not sure, that auth should be read so often, or instantiated so often.. and read from localStorage so often (slow)
  const { auth, setAuthStatus, setUnauthStatus } = useAuthHandler( getStoredUserAuth({ log:"authProvider in AuthContext.js, initial value of useAuthHandler=>auth ", emptyObj: EMPTY_USER_AUTH }) );
  let history = useHistory()


  // wrapper of connRenewSession, so it can be placed into the context, and called from context by context subscribers
  // returns the new session's auth or null (if failed)
  const renewSession = async function(forceUpdate=false) {
    //const auth = AuthStore.currentState.auth
    console.log('programatically called renewSession, forceUpdate: ', forceUpdate)
    const authObj = await connRenewSessionAsync({ setUnauthStatus, setAuthStatus, username:auth.username, auth, forceUpdate, log:'programmatical session renew' })
    return authObj
  }



  // "hack" to bring in the state from pullState into the context (to ensure the rest of the code works)
  // next step will refactor context to pullstate completely, retiring this function.
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
  // TIMER THAT RE-NEWS SESSION BEFORE THEY EXPIRE..
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




/*
  useEffect( ()=> {
    if (!auth.authenticated) return
    if (auth.accessTokenExp === 0) return // only handle session expiration of active/loaded sessions

    console.log('TIMER EFFECT: auth.authenticated:', auth.authenticated, ' auth.accessTokenExp:', auth.accessTokenExp)

    connRenewSessionAsync({ setUnauthStatus, setAuthStatus, username, auth, log:'AuthContext detected accessToken updated' })

  }, [auth.accessTokenExp])
*/



  return (
    <Provider
      value={{
        //confirmationCodeModal,
        //openConfirmationCodeModal,

        confirmUserModalOpened,       // boolean
        setConfirmUserModalOpened,

        confirmAttributeModalOpened,  // boolean
        setConfirmAttributeModalOpened,

        confirmMfaModalOpened,        // boolean
        setConfirmMfaModalOpened,

        auth,
        setAuthStatus,
        setUnauthStatus,

        userAccountVerified,    // to confirm cognito account sign up (user or email)
        setUserAccountVerified,

        attributeVerified,      // to confirm 2nd cognito user attribute (such as email/phone)
        setAttributeVerified,

        mfaVerified,            // to confirm mfa on signIn
        setMfaVerified,

        renewSession,

        username,     // important?
        setUsername,  // important?

        userId,     // important?
        setUserId,  // important?

        session,    // important?
        setSession, // important?

        userTimestamp,  // important?
        setTimestamp,   // important?
      }}
    >
      {children}

    </Provider>
  );
};

export default AuthProvider;

/*


  // (0)
  // TIMER THAT EXPIRES SESSION
  // activates before access token expires, SECS_BEFORE, and tries to request new tokens / session
  useEffect( ()=> {
    console.log('## AuthContext, auth effect.. auth.authenticated:', auth.authenticated)
    if (!auth.authenticated) return
    if (auth.accessTokenExp === 0) return

    // TEST TO EXPIRE THE SESSION WITHIN A MINUTE
    if (auth.accessTokenExp > 0) {
      // we are logged in and have an expiration date of the accessToken
      console.log('access token expiration time:', showExpirationTime(auth.accessTokenExp) )
      console.log('invalidation timer:', showExpirationTime(auth.accessTokenExp-SECS_BEFORE) )

      const timerTS =  (auth.accessTokenExp - SECS_BEFORE)*1000
      const timerDuration = timerTS - Date.now()

      if (timerDuration <= 0) {
        console.log('TOO LATE TO RENEW ACCESS TOKEN, timerDuration:', timerDuration, showExpirationTime(timerDuration/1000) )
        //setReAuthNow(-1)

        //setUnauthStatus({ keepUsername: true })
        setReAuthNow(1) // just trying this. probably just should send user to signIn

        return
      }

      console.log('timerDuration ms:', timerDuration)
      console.log('setting up timer to renew token, will be called at: ', new Date(timerTS).toLocaleTimeString("en-US"))

      const timer = setTimeout( () => {
        console.log('RENEW ACCESS TOKEN PLACEHOLDER, resetting authObj.. ')
        // should call session-renew here !!!

        //setUnauthStatus({ keepUsername: true })
        setReAuthNow(1)
        //resetAuthObj()
        // fwd user to login screen (he ll likely be away from that screen when the access token expires)
        //pushWithProperOrigin(ssetUnauthStatus({ keepUsername: true }) ignInRoute, { jwtToken: '', accessTokenExp } )
        // pushWithProperOrigin({ history, location, pushTo, params={} })
      }, timerDuration );


      // clean up timer on end of effect
      //return () => clearTimeout(timer);


    }
  }, [auth.accessTokenExp])




  // (1)
  // re-authenticate session before expiration (if possible), or after expiration
  useEffect( ()=> {
    //if (auth.authenticated) return
    if (auth.accessTokenExp === 0) return // only handle session expiration of active/loaded sessions
    if (reAuthNow !== 1) return

    // just for informaiton purposes, display time of expiration of auth token
    console.log('access token expiration time:', showExpirationTime(auth.accessTokenExp) )
    console.log('invalidation timer:', showExpirationTime(auth.accessTokenExp-SECS_BEFORE) )


    const timerTS =  auth.accessTokenExp*1000 - SECS_BEFORE*1000
    const timerDuration = timerTS - Date.now()

    if (timerDuration <= 0) {
      console.log('>> RE NEWING SESSION, token already expired, SHOULD WE SIGN-IN, OR JUST RENEW THE SESSION?, timerDuration:', timerDuration, showExpirationTime(timerDuration/1000) )
      console.log('but do nothing..')
      // DO I STILL HAVE A "USER" AFTER EXPIRATION?
      // SHOULD WE SIGN-IN, OR JUST RENEW THE SESSION?

      //setReAuthNow(-1)
      //return
    }

    if (timerDuration < SECS_BEFORE*1000) {
      console.log('>> can re-new token within allowed time, secs:', SECS_BEFORE)
      console.log('>> username:', username)   // has no value..

      if (username === undefined || username.length < 1) {
        console.log('!!!! ERROR, have no username to create cognito user..')
        return
      }

      const userData = {
        Username: username,
        Pool:  getUserPool(),
      }


      const _cognitoUser = new CognitoUser(userData);
      if (_cognitoUser === null) {
        console.log('$$ couldnt get cognitoUser, returning early in AuthContext..')
        return
      }


      //const sess = getCurrentUser()
      console.log('>> after new CognitoUser:', _cognitoUser)
      setCognitoUser(_cognitoUser)

      setReAuthNow(2)

      return
    }

  }, [auth.accessTokenExp, reAuthNow])

  // (2)
  useEffect( ()=> {

    const _refreshSessionAsync = async function(refreshToken, cognitoUser) {
      if (cognitoUser === null) {
        console.log('ERR! cognitoUser is null, can t refresh session..')
        return
      }

      //console.log('_refreshSessionAsync with refreshToken:', auth.refreshToken, ' cognitoUser:', cognitoUser)

      const sess = await refreshSessionAsync(refreshToken, cognitoUser)
      console.log('### _refreshSessionAsync result:', sess)
      //const sess = await getSessionAsync(refreshToken, cognitoUser)

      setSession(sess)
    }


    //if (session !== null) return
    if (reAuthNow !== 2) return
    if (cognitoUser === null) return
    if (!auth.refreshToken) {
      console.log('!!! no refreshToken for refreshSessionAsync:', auth.refreshToken)
      return
    }

    // need to call this, because the stored refreshToken is missing the "getToken" function
    const newRefreshToken = new CognitoRefreshToken({
      RefreshToken: auth.refreshToken
    });

    console.log('useEffect [cognitoUser] ...')
    //_refreshSessionAsync({ token: auth.refreshToken }, cognitoUser)
    _refreshSessionAsync(newRefreshToken, cognitoUser)

    setReAuthNow(3)

  }, [cognitoUser, reAuthNow])


  // (3)
  useEffect( ()=> {
    if (reAuthNow !== 3) return
    if (session === null) return

    console.log('useEffect [session] calling setAuthStatus with:', session)

    const newAuthObj = { ...getValuesFromSession(session), username }  // just checks correctness and extracts values from session variable

    setUsername(username)         // good to have for creating userpools
    setAuthStatus(newAuthObj)     // this stores to localStorage
    setReAuthNow(0)

  }, [session, auth.authenicated, reAuthNow])


*/
