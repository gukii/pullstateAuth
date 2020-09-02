//import React, { useEffect, useState } from "react";
import {
    //CognitoUser,
    CognitoRefreshToken,
  } from "amazon-cognito-identity-js";


import { showExpirationTime } from '../cognito/showExpirationTime'

import { ALLOW_SESSION_RENEW_SECS_BEFORE_EXPIRATION, getValuesFromSession, getUserPool } from "../cognito/config";
//import { getStoredUsername } from "../connectedHelpers/localStorage";
import refreshSessionAsync from '../cognito/refreshSession'
import msUntilCognitoTS from '../cognito/msUntilCognitoTS'

import { connNewCognitoUser, connGetCognitoUsername } from './connCognitoUser'

//import getSessionAsync from '../cognito/getSession'





// renews session, ONLY SETS auth object ON SUCCESS, NO OTHER context such as variables (username, cognitoUser, session ... )
export async function connRenewSessionAsync({ setUnauthStatus, setAuthStatus, username=null, auth, setUsername=null, forceUpdate=false, log="initialValue" }) {

      if (log.length > 0) console.log(`connRenewSession, log: ${log}`)

      if (!!!auth.refreshToken || (!!auth.refreshToken && auth.refreshToken.length === 0)) {
        console.log('connRenewSessionAsync has no refreshToken, returning null', auth)
        setUnauthStatus({ keepUsername: false, log: "renewSession, refreshSessionAsync has no refreshToken" })

        return null
      }


      // just for informaiton purposes, display time of expiration of auth token
      console.log('renewSession: access token expiration time:', showExpirationTime(auth.accessTokenExp) )
      console.log('renewSession: renew session before deadline:', showExpirationTime(auth.accessTokenExp-ALLOW_SESSION_RENEW_SECS_BEFORE_EXPIRATION) )

      const timerDuration = msUntilCognitoTS({ cognitoTS: auth.accessTokenExp, margin: ALLOW_SESSION_RENEW_SECS_BEFORE_EXPIRATION })


      // session expired
      if (timerDuration <= 0) {
        console.log('>> renewSession: RE NEWING SESSION, token already expired, SHOULD WE SIGN-IN, OR JUST RENEW THE SESSION?, timerDuration:', timerDuration, showExpirationTime(timerDuration/1000) )
        console.log('>> renewSession: SSE will have a problem with this.. ')
        console.log('>> renewSession: for now, do nothing, user will get un-authenticated if any of the renewSession steps fail..')
        // DO I STILL HAVE A "USER" AFTER EXPIRATION?
        // SHOULD WE SIGN-IN, OR JUST RENEW THE SESSION?

        forceUpdate = true

        // setUnauthStatus({ keepUsername: true, log: "renewSession, token already expired" })
      }


      // renew session before it expires
      if ( (timerDuration < ALLOW_SESSION_RENEW_SECS_BEFORE_EXPIRATION*1000) || forceUpdate) {


        const _username = connGetCognitoUsername({ setUnauthStatus, username, log:"for connRenewSession username" })
        if (_username === null) return null

        const _cognitoUser = await connNewCognitoUser({ setUnauthStatus, username, log:"for connRenewSession cognitoUser" })
        if (_cognitoUser === null) return null


        // need to call this, because the stored refreshToken is missing the "getToken" function
        const newRefreshToken = new CognitoRefreshToken({
          RefreshToken: auth.refreshToken
        });

        const newSession = await refreshSessionAsync(newRefreshToken, _cognitoUser)
        if (newSession === null) {
          console.log('!!! renewSession: ERROR refreshSessionAsync didn t return a session, calling setUnauthStatus, sending user to signIn..')
          setUnauthStatus({ keepUsername: true, log: "renewSession, refreshSessionAsync result error" })
          return null
        }



        const newAuthObj = { ...getValuesFromSession(newSession), username: _username }  // just checks correctness and extracts values from session variable
        console.log('renewSession: got newAuthObj')

        //setCognitoUser(_cognitoUser)

        if (setUsername !== null) setUsername(_username)

        setAuthStatus(newAuthObj)     // this stores to localStorage
        return newAuthObj
      }

      console.log('connRenewSession didnt do a thing because of timerDuration:', timerDuration)
      return null
}
