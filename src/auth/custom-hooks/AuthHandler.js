import * as React from "react";

/** Custom types */
//import { UserAuth } from "../../custom-types";

/** Utils */
import { storeUserAuth, resetStoredUserAuth } from "../cognito/localStorage";

//import { USER_AUTH_KEY } from "../local-storage";
import { EMPTY_USER_AUTH } from "../cognito/config";
import { setUnauthStatus as psSetUnauthStatus } from "./psAuthHandler"


const useAuthHandler = (initialState) => {

  const [auth, setAuth] = React.useState(initialState);



  const setAuthStatus = (userAuth) => {

    storeUserAuth(userAuth)
    setAuth(userAuth);
  };


  // keepUsername: keeps the usernam when "auth" gets reset/overwritten by the values of EMPTY_USER_AUTH
  // log: just a log message that can be written out to console
  const setUnauthStatus = ({ keepUsername=false, log='' }) => {

    console.log('setUnauthStatus, log:', log, ' keepUsername:', keepUsername, ' auth.username:', auth.username)
    const emptyObj = keepUsername && !!auth.username && auth.username.length > 0 ? { ...EMPTY_USER_AUTH, username: auth.username } : EMPTY_USER_AUTH

    resetStoredUserAuth( emptyObj )
    psSetUnauthStatus( emptyObj )
    setAuth( emptyObj );

  };



  return {
    auth,
    setAuthStatus,
    setUnauthStatus,
  };
};

export default useAuthHandler;
