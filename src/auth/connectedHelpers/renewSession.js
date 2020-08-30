//import React, { useEffect } from "react";

// REFACTORING AWAY FROM CONTEXT TO PULLSTATE..
// NEED TO FIGURE OUT A WAY TO IMPLEMENT 
// USE-EFFECT STUFF WITH PULLSTATE SUBSCRIPTION OR REACTIONS


/** Custom types */
//import { UserAuth } from "../custom-types";

/** Custom Hooks */
//import useAuthHandler from "../custom-hooks/AuthHandler";
//import useAuthHandler from "../custom-hooks/psAuthHandler";

import { connRenewSessionAsync } from './connRenewSession'

import { setAuthStatus, setUnauthStatus } from './authHelper'


/*
import { TRIGGER_TOKEN_RENEW_SECS_BEFORE_EXPIRATION, ALLOW_SESSION_RENEW_SECS_BEFORE_EXPIRATION, EMPTY_USER_AUTH, getCurrentUser, getValuesFromSession, getUserPool } from "../cognito/config";
import { getStoredUserAuth } from "../cognito/localStorage";
import refreshSessionAsync from '../cognito/refreshSession'
import getSessionAsync from '../cognito/getSession'
*/

import { AuthStore } from "../psStore/AuthStore";



// wrapper of connRenewSession, so it can be placed into the context, and called from context by context subscribers
// returns the new session's auth or null (if failed)

export const renewSession = async function(forceUpdate=false) {
  const auth = AuthStore.currentState.auth
  console.log('programatically called renewSession, forceUpdate: ', forceUpdate)
  const authObj = await connRenewSessionAsync({ setUnauthStatus, setAuthStatus, username:auth.username, auth, forceUpdate, log:'programmatical session renew' })
  return authObj
}


