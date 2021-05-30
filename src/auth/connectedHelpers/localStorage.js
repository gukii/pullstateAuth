//import { EMPTY_USER_AUTH } from './config'
//import { EMPTY_USER_AUTH } from './config'


export const USER_AUTH_KEY = "UserAuth";

//
// !! stores the complete cognito auth data to localstorage (not safe..!!!)
//

export const getStoredUserAuth = function({ log='', emptyObj=null }) {

  try {

    const auth = window.localStorage.getItem(USER_AUTH_KEY)

    if (auth !== null && auth !== undefined) {
      //console.log('getStoredUserAuth res auth:', auth)
      const json = JSON.parse(auth)

      console.log(`getStoredUserAuth res json ${ log.length > 0 ? ", for " +log : "" }:`, auth)
      return json
    }

  }
  catch(err) {

    return emptyObj;
  }

  return emptyObj;
};



export const resetStoredUserAuth = function(emptyObj=null) {
    window.localStorage.clear()
    if (emptyObj !== null) {
      storeUserAuth(emptyObj)
    }
    // maybe overwrite with a DEFAULT, EMPTY data Ojb
    //storeUserAuth(DEFAULT_USER_AUTH)
}


export const storeUserAuth = function(auth) {
    const res = window.localStorage.setItem(USER_AUTH_KEY, JSON.stringify(auth))
    //const res = window.localStorage.setItem(USER_AUTH_KEY, auth)

    return res
}



export const getStoredUsername = function() {
  console.log('getStoredUsername: getting username from localStorage..')

  const authObj = getStoredUserAuth({ log:'renewSession (getStoredUsername)', emptyObj: null })
  if (authObj === null || authObj.username === null || authObj.username === undefined || authObj.username.length < 1) {
    console.log('!!! no username in localstorage.. to create cognito user for session renewal..')
    return null
  }
  console.log('getStoredUsername:', authObj.username)

  return authObj.username
}



/*
export const getUsernameCached = function(username=null) {
  if (username === null || username === undefined || username.length < 1 ) {
    console.log('getUsernameCached: getting username from localStorage..')

    const authObj = getStoredUserAuth({ log:'renewSession (getUsernameCached)', emptyObj: null })
    if (authObj === null || authObj.username === null || authObj.username === undefined || authObj.username.length < 1) {
      console.log('!!!! ERROR, have no username to create cognito user for session renewal..')
      return null
    }

    return authObj.username
  }

  return username
}
*/


/*
https://stackoverflow.com/questions/42921220/is-any-solution-to-do-localstorage-setitem-in-asynchronous-way-in-javascript/42922083


const asyncLocalStorage = {
    setItem: async function (key, value) {
        await null;
        return localStorage.setItem(key, value);
    },
    getItem: async function (key) {
        await null;
        return localStorage.getItem(key);
    }
};
*/
