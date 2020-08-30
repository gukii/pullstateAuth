import { Store } from "pullstate";
import { TRIGGER_TOKEN_RENEW_SECS_BEFORE_EXPIRATION, EMPTY_USER_AUTH } from "../cognito/config";
import { getStoredUsername, getStoredUserAuth } from '../cognito/localStorage'


export const AuthStore = new Store({

    isAuthenticated: false,

    username: null, // (is inside auth, username inside auth gets initialized with username from localstorage
    userId: null,

    auth: getStoredUserAuth({ log:"pullstate store init", emptyObj:EMPTY_USER_AUTH }),  // currently mostly dealing with this one, as refactoring from context to pullstate

    userAccountVerified: false,
    attributeVerified: false,
    mfaVerified: false,    

  
})


export const AuthStore2 = new Store({

    userId: 0,
    
    idToken: "",
    accessToken: "",
    refreshToken: "",

    authenticated: false,

    idTokenExp: 0,
    accessTokenExp: 0,

    username: getStoredUsername()
})