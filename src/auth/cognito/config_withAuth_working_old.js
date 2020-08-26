import React, { Component } from 'react'
import {
    CognitoUserPool,
    CognitoUser,
    CognitoRefreshToken
  } from "amazon-cognito-identity-js";

import { jwtExpired, jwtToJson, cognitoTSexpired } from './validate'
import getSessionAsync from './getSession'
import { getStoredUserAuth, storeUserAuth, resetStoredUserAuth, USER_AUTH_KEY } from './localStorage'
import refreshSessionAsync from './refreshSession'


const USER_POOL_ID = process.env.REACT_APP_COGNITO_USER_POOL_ID
const APP_CLIENT_ID = process.env.REACT_APP_COGNITO_CLIENT_ID

const POOL_DATA = {
    UserPoolId: USER_POOL_ID,
    ClientId: APP_CLIENT_ID
};


/** Default user auth object */

// used by authentication components


export const EMPTY_USER_AUTH = Object.freeze({
    userId: 0,
    idToken: "",
    accessToken: "",
    refreshToken: "",

    authenticated: false,

    idTokenExp: 0,
    accessTokenExp: 0
});


//console.log('POOL_DATA:', POOL_DATA)

let userPool = new CognitoUserPool(POOL_DATA);
let userSession = null  // is this now handles within the useAuthObj hook? check where else it is used..

// temp global auth state obj
let authObj = EMPTY_USER_AUTH

/*
export const useAuthObj( initialAuthObj=EMPTY_USER_AUTH, storeToDisk=false ) {

  const [authObj, setAuthObj] = useState(initialAuthObj)
  const [session, setSession] = useState(null)


  useEffect( () => {

    console.log('useAuthObj effect:', authObj)


    // async get cognito user session, this is the way to do async calls inside useEffect
    const _getSession = async() => {
      try {
        const session = await getSessionAsync()
        setSession(session)
      }
      catch(e) {
        setSession(null)
      }
    }



    // check if authObj is valid
    const isValid = validateAuthObj()
    if (!isValid) {
      resetAuthObj()
      return
    }

    _getSession()

    // check if session got data = is valid
    if (session === null) {
      resetAuthObj()
      return
    }

    const newAuthObj = getValuesFromSession(session)
    console.log('useAuthObj new authObj:', newAuthObj)

    setAuthObj(newAuthObj)


  }, [authObj, session])



  return [authObj, setAuthObj, checkValid: validateAuthObj, resetAuthObj]
}
*/




// pulls out all needed values from the session object
export function getValuesFromSession(result=null) {

    if (result === null) return EMPTY_USER_AUTH
    //if (result === null) return null


    console.log('getValuesFromSession from this session:', result)

    if (result.idToken === undefined) {
      return EMPTY_USER_AUTH
    }

    //const newIdToken = result.idToken.getJwtToken()
    //const newAccessToken = result.accessToken.getJwtToken()

    return {
        userId: result.idToken.payload.sub,

        idToken: result.idToken.jwtToken,
        idTokenExp: result.idToken.payload.exp,

        accessToken: result.accessToken.jwtToken, //result.getAccessToken().getJwtToken(),   // maybe have to explicitely get the jwt tokens: result.getAccessToken().getJwtToken();
        accessTokenExp: result.accessToken.payload.exp, //result.accessToken.payload.exp,     // not sure there is a .exp for the accessToken

        refreshToken: result.refreshToken.token,

        //timestamp: +result.idToken.payload["custom:timestamp"] || 0,
        authenticated: true
    }
}

// async get cognito user session, this is the way to do async calls inside useEffect
// and set the global session variable in config.js (not really used anywhere else)
export const getSessionAsyncGlobal = async function() {

  try {
    console.log('calling getSessionAsync with:', userSession)
    const sess = await getSessionAsync(userSession, 'from getSessionAsyncGlobal')
    console.log('getSessionAsyncGlobal, getSessionAsync() result ok, sess:', sess)
    setCurrentUserSession(sess)
    return sess
  }
  catch(e) {

    console.log('getSessionAsyncGlobal (getSessionAsync fail) failed:', e)
    setCurrentUserSession(null)
    return null

  }
}

// called from getAuthObj
// update session with new tokens, validate and return userAuth obj (full, or empty with default values)
export const updateSessionAndUserAuth = async function() {

  //const sess = await getSessionAsyncGlobal()
  //const sess = await refreshJwtAsync()
  const newAuthObj = await refreshJwtAsync()
  return newAuthObj
  /*
  setCurrentUserSession(sess) // done already in Global

  const newSessUserAuth = getValuesFromSession(sess)
  if (authObjValid(newSessUserAuth)) {
    console.log('updateSessionAndUserAuth valid..')
    setAuthObj(newSessUserAuth)
    storeUserAuth(newSessUserAuth)
    return newSessUserAuth
  }

  console.log('updateSessionAndUserAuth NOT valid..')
  setAuthObj(EMPTY_USER_AUTH)
  return EMPTY_USER_AUTH
  */
}





export const getAuthObj = async ({ ifEmptyCheckStore=false, makeStoreObjGlobalIfGood=false, log='' }) => {
  //return getStoredUserAuth()

  if (log.length > 0) console.log('log, ',log)

  const valid = authObjValid(authObj)

  if (valid) return authObj

  if (ifEmptyCheckStore) {
    const storedObj = getStoredUserAuth()

    if ( authObjValid(storedObj) ) {

      if ( makeStoreObjGlobalIfGood ) setAuthObj(storedObj)
      return storedObj
    }

    // auth obj was not valid, check new session with AWS, it will update tokens
    let sessionObj = await updateSessionAndUserAuth()
    return sessionObj

  }


  return EMPTY_USER_AUTH
}


export const setAuthObj = (obj) => {
  authObj = obj
  //storeUserAuth(obj)
}


// RESET auth obj
export const resetAuthObj = () => {
  setAuthObj(EMPTY_USER_AUTH)
  resetStoredUserAuth(EMPTY_USER_AUTH)
}


export const authObjValid = (obj) => {
  if (    (obj.idToken === undefined)
      ||  (obj.accessToken === undefined)
      ||  (obj.idToken.length === 0)
      ||  (obj.accessToken.length === 0)
//      ||  (jwtExpired(obj.idToken))
//      ||  (jwtExpired(obj.accessToken))
      ||  (cognitoTSexpired(obj.idTokenExp))
      ||  (cognitoTSexpired(obj.accessTokenExp))
  ) {
    return false
  }
  return true
}

// VALIDATE authObj (idToken, accessToken, expiration dates..)
export const validateAuthObj = (triggerReset=false) => {

  if ( !authObjValid(authObj) ) {
    if (triggerReset) {
      resetAuthObj()
      //setSession(false)
    }
    return false
  }

  // could do a
  return true
}

/////////////////////////////// will s approach below..

//let appConfig // not used

function decodedAccessToken(jwtAccess) {
  if (jwtAccess && jwtAccess.split('.').length > 1) {
    return JSON.parse(atob(jwtAccess.split('.')[1]));
  }
  return false;
}


async function generateCognitoUser(oldAccessToken = null) {
  const atoken = oldAccessToken ? oldAccessToken : userSession.accessToken

  const decodedAtoken = decodedAccessToken(atoken.jwtToken)

  console.log('username (decoded):', decodedAtoken.username)
  console.log('username (atoken):', atoken.payload.username)

  if (!atoken) return null

  const userData = {
    Username: atoken.payload.username,
    Pool:  getUserPool(),
  }

  const newCognitoUser = await new CognitoUser(userData);
  return newCognitoUser
}



export async function refreshJwtAsync(currentUser=null) {
  /*
  We need the username to make the connection to CognitoUser.
  For the purpose of this example, we are extracting that from
  the access token. But in a real application, it can probably
  parse it from a different source, so the access token won't
  be necessary
  */

  console.log('refreshJwtAsync..')

  const currentSess = getCurrentUserSession()
  console.log('refreshJwtAsync userSession:', currentSess)
  const currentRefreshToken = currentSess.refreshToken

  // refreshToken will get "lost" when a new cognitoUser is "generated"
  const cognitoUser = currentUser ? currentUser : await generateCognitoUser()


  console.log('currentRefreshToken:', currentRefreshToken)
  //console.log('newRefreshToken:', cognitoUser.refreshToken.token)

  console.log('refreshJwtAsync congitoUser:', cognitoUser)
  console.log('userSession:', currentSess)
/*
  const refreshToken = new CognitoRefreshToken({
    RefreshToken:  cognitoUser.refreshToken.token //currentRefreshToken //authObj.refreshToken
  })
*/
  try {
    const refreshedSess = await refreshSessionAsync(currentRefreshToken, cognitoUser)
    console.log('refreshSession data:',refreshedSess);

    setCurrentUserSession(refreshedSess) // done already in Global

    const refreshedUserAuth = getValuesFromSession(refreshedSess)

    if ( authObjValid(refreshedUserAuth) ) {
      console.log('jwt .. updateSessionAndUserAuth valid..')
      setAuthObj(refreshedUserAuth)
      storeUserAuth(refreshedUserAuth)
      return refreshedUserAuth
    } else {

      return EMPTY_USER_AUTH
    }

    //return sess


  /*
    setCurrentUserSession(sess)

    console.log('refreshSession data:',sess);
    const authObj = getValuesFromSession(sess)
    setAuthObj(authObj)
    storeUserAuth(authObj)
    return authObj
    */
    //parseJwtResponse(sess);

  } catch (err) {
    console.log(err, err.stack); // an error occurred
  }


}

function parseJwtResponse(r) {
  const accessToken = r.getAccessToken().getJwtToken();
  const refreshToken = r.getRefreshToken().getToken();
  const idToken = r.getIdToken().getJwtToken();
  /*
  this.jwtAccess = accessToken;
  this.jwtRefresh = refreshToken;
  this.jwtId = idToken;
  */
}

////////////////////////////////////////////



export const getUserPool = () => {
  return userPool
}

export const setUserPool = (pool) => {
  userPool = pool
}



export const getCurrentUser = () => {

  return getCurrentUserSession()

/*
  const decodedAccess = decodedAccessToken(userSession.accessToken)
  console.log('decodedAccess:', decodedAccess)
  if (!decodedAccess) return null

  const userData = {
    Username: decodedAccess.username,
    Pool:  getUserPool(),
  }

  const cognitoUser = new CognitoUser(userData);

  return cognitoUser
*/

/*
    const userPool = getUserPool()
    let user = userPool.getCurrentUser()

    if (user === null) {
      refreshJwt()
    }

    return user
*/

  // maybe .getCurrentUser does not work because I don t use an identity pool inside my CognitoUserPool..??

}


// these two functions should be obsolute due to new authObjHook, which takes care of sessions
export const setCurrentUserSession = (user = null) => {
  userSession = user
}

export const getCurrentUserSession = () => {
  return userSession
}
