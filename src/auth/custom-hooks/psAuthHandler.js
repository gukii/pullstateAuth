import * as React from "react";

/** Custom types */
//import { UserAuth } from "../../custom-types";

/** Utils */
import { storeUserAuth, resetStoredUserAuth } from "../cognito/localStorage";

//import { USER_AUTH_KEY } from "../local-storage";
import { EMPTY_USER_AUTH } from "../cognito/config";
import { AuthStore } from "../psStore/AuthStore";



export const setAuthStatus = (userAuth) => {

  storeUserAuth(userAuth)
  //setAuth(userAuth);

  AuthStore.update(s => {
    s.auth = userAuth
  })    
};


// keepUsername: keeps the usernam when "auth" gets reset/overwritten by the values of EMPTY_USER_AUTH
// log: just a log message that can be written out to console
export const setUnauthStatus = ({ keepUsername=false, log='' }) => {

  console.log('AuthStore:', AuthStore)
  //const auth = AuthStore.useState(s => s.auth)

  const auth = AuthStore.currentState.auth

  console.log('setUnauthStatus, log:', log, ' keepUsername:', keepUsername, ' auth.username:', auth.username)
  const emptyObj = keepUsername && !!auth.username && auth.username.length > 0 ? { ...EMPTY_USER_AUTH, username: auth.username } : EMPTY_USER_AUTH

  resetStoredUserAuth( emptyObj )
  //setAuth( emptyObj );

  AuthStore.update(s => {
    s.auth = emptyObj
  })    

};

