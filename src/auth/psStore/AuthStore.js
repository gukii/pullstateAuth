import { Store } from "pullstate";
import { TRIGGER_TOKEN_RENEW_SECS_BEFORE_EXPIRATION, EMPTY_USER_AUTH } from "../cognito/config";
import { getStoredUserAuth } from '../connectedHelpers/localStorage'

import { showExpirationTime } from '../cognito/showExpirationTime'
import { connRenewSessionAsync } from '../connectedHelpers/connRenewSession'
import msUntilCognitoTS from '../cognito/msUntilCognitoTS'
import { setAuthStatus, setUnauthStatus } from '../connectedHelpers/authHelper'


export const AuthStore = new Store({

    auth: getStoredUserAuth({ log:"pullstate store init", emptyObj:EMPTY_USER_AUTH }),

})

/* auth object contains:

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

*/




let unsubscribeFromAuthStore = null
let timer = null


if (unsubscribeFromAuthStore !== null) unsubscribeFromAuthStore()

unsubscribeFromAuthStore = AuthStore.subscribe(
    s => s.auth,
    auth => {

        // got username from localStorage (during store initialization), trying to auto-login
        if (!auth.authenticated && !!auth.username && auth.username.length > 0) {
            console.log('got username, but not authenticated. trying to renew session..', auth)
            connRenewSessionAsync({ setUnauthStatus, setAuthStatus, username:auth.username, setUsername:null, auth, forceUpdate:false, log:'called by ROUTER' })
            return
        }



        // auto-renew session by before auth token expires (for server sent events and APIs having a valid tokens)
        if (auth !== null && auth.username !== null) {

            if (!auth.authenticated) return
            if (auth.accessTokenExp === 0) return

            console.log('TIMER EFFECT: auth.authenticated:', auth.authenticated, ' auth.accessTokenExp:', auth.accessTokenExp)


            if (auth.accessTokenExp > 0) {
              // we are logged in and have an expiration date of the accessToken
              console.log('TIMER EFFECT: access token expiration time:', showExpirationTime(auth.accessTokenExp) )
              console.log('TIMER EFFECT: sessionRenew trigger set at:', showExpirationTime(auth.accessTokenExp-TRIGGER_TOKEN_RENEW_SECS_BEFORE_EXPIRATION) )

              const timerDuration = msUntilCognitoTS({ cognitoTS: auth.accessTokenExp, margin: TRIGGER_TOKEN_RENEW_SECS_BEFORE_EXPIRATION })

              console.log('TIMER EFFECT: duration until sessionRenew trigger in ms:', timerDuration, ' in secs:', timerDuration/1000, ' in mins:', timerDuration/1000/60)

              if (timer !== null) clearTimeout(timer)

              timer = setTimeout( () => {
                console.log('TIMER EFFECT: RENEW ACCESS TOKEN PLACEHOLDER, resetting authObj.. ')
                connRenewSessionAsync({ setUnauthStatus, setAuthStatus, username:auth.username, setUsername:null, auth, forceUpdate:false, log:'called by TIMER EFFECT' })
              }, timerDuration );

              // clean up timer on unmount of effect (only works within useEffect)
              //return () => clearTimeout(timer);

            }


        }
    }
)


/*
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
*/
