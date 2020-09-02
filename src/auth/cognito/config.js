//import React, { Component } from 'react'
import {
    CognitoUserPool,
    //CognitoUser,
    //CognitoRefreshToken
  } from "amazon-cognito-identity-js";

import { cognitoTSexpired } from './validateToken'
import { getStoredUsername } from '../connectedHelpers/localStorage'

// TO TEST THE AUTO-SESSION-RENEWAL, SET EXPIRATION TIMER TO: (59*60)+50   // THIS WILL RE-NEW THE SESSION AFTER 10 SECS
// 1 hour - 1 minute, in seconds: (59*60) seconds
export const TRIGGER_TOKEN_RENEW_SECS_BEFORE_EXPIRATION = (59*60)+50 // = 59min // normal accessTokens are valid for one hour, setting to 59*60, allows the set timeout check 1 minute after token receival   // should be about 10, secs before token expires to re-new token while still valid
export const ALLOW_SESSION_RENEW_SECS_BEFORE_EXPIRATION = TRIGGER_TOKEN_RENEW_SECS_BEFORE_EXPIRATION / 2

//export const TRIGGER_TOKEN_RENEW_SECS_BEFORE_EXPIRATION = 20 // this will re-new session 20 secs before token expiration
//export const ALLOW_SESSION_RENEW_SECS_BEFORE_EXPIRATION = 3  // this will allow session renewal 3 secs before token expiration


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
    accessTokenExp: 0,

    username: getStoredUsername()   // username is good to have for creating cognitoUsers (could also extract them from id jwt token..)
});


// global var for userPool
let userPool = new CognitoUserPool(POOL_DATA);



// !!!!! 
// getting userPool.getCurrentUser() is sketchy:
//
// this only works with sessions enabled in amaon-cognito-identity-js library
// which likely requires the use of an identity pool (i currently dont use identity pools)
// !!!!



// pulls out all needed values from the session object
export function getValuesFromSession(result=null) {

    if (result === null) return EMPTY_USER_AUTH

    //console.log('getValuesFromSession from this session:', result)

    if (result.idToken === undefined) {
      return EMPTY_USER_AUTH
    }

    //const newIdToken = result.idToken.getJwtToken()           // string
    //const newAccessToken = result.accessToken.getJwtToken()   // string

    return {
        userId: result.idToken.payload.sub,

        idToken: result.idToken.jwtToken,
        //idToken: newIdToken,
        idTokenExp: result.idToken.payload.exp,

        accessToken: result.accessToken.jwtToken,
        //accessToken: newAccessToken,   // maybe have to explicitely get the jwt tokens: result.getAccessToken().getJwtToken();
        accessTokenExp: result.accessToken.payload.exp, //result.accessToken.payload.exp,     // not sure there is a .exp for the accessToken

        refreshToken: result.refreshToken.token,

        //timestamp: +result.idToken.payload["custom:timestamp"] || 0,
        authenticated: true

    }
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
export const validateAuthObj = (authObj) => {

  return authObjValid(authObj)

}





export const getUserPool = () => {
  return userPool
}

export const setUserPool = (pool) => {
  userPool = pool
}


// !!!!! 
// getting userPool.getCurrentUser() is sketchy:
//
// this only works with sessions enabled in amaon-cognito-identity-js library
// which likely requires the use of an identity pool (i currently dont use identity pools)
// !!!!

export const getCurrentUser = ({ log="" }) => {

  console.log(`getCurrentUser called ${ log.length>0? ", log:"+log : ''}, userPool:`, userPool)
  return userPool.getCurrentUser()

}







/*
/////////////////////////////// will s approach below..

//let appConfig // not used

// takes the token string and splits it into objects. this will result into token.username,
// ... not into token.payload.username (as in the result of cognito auth/session functions)
export function decodedCognitoToken(jwtAccess) {
  if (jwtAccess && jwtAccess.split('.').length > 1) {
    return JSON.parse(atob(jwtAccess.split('.')[1]));
  }
  return false;
}


async function generateCognitoUser(oldAccessToken = null) {
  const atoken = oldAccessToken ? oldAccessToken : userSession.accessToken

  const decodedAtoken = decodedCognitoToken(atoken.jwtToken)

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



function parseJwtResponse(r) {
  const accessToken = r.getAccessToken().getJwtToken();
  const refreshToken = r.getRefreshToken().getToken();
  const idToken = r.getIdToken().getJwtToken();

  return { accessToken, idToken, refreshToken }

}
*/

////////////////////////////////////////////
