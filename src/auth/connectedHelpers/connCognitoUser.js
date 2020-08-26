import {
    CognitoUser,
  } from "amazon-cognito-identity-js";


import { getValuesFromSession, getUserPool } from "../cognito/config";
import { getStoredUsername } from "../cognito/localStorage";



export function connGetCognitoUsername({ setUnauthStatus, username=null, log="" }) {

  if (log.length > 0) console.log(`connGetCognitoUsername, log: ${log}`)


  const _username = username || getStoredUsername()
  console.log(`>> connGetCognitoUsername username:${username}, _username:${_username}`)
  if (_username === null) {
    setUnauthStatus({ keepUsername: true, log: "connGetCognitoUsername, username is null" })
    return null
  }

  return _username
}



export async function connNewCognitoUser({ setUnauthStatus, username=null, log="" }) {

        if (log.length > 0) console.log(`connNewCognitoUser, log: ${log}`)


        if (!username) return

        // could do: setUsername(_username)

        console.log('>> connNewCognitoUser: username:', username)   // has no value..


        const userData = {
          Username: username,
          Pool:  getUserPool(),
        }

        const _cognitoUser = new CognitoUser(userData);
        if (_cognitoUser === null) {
          console.log('!!! connNewCognitoUser: ERROR couldnt get cognitoUser, returning early in AuthContext..')
          setUnauthStatus({ keepUsername: true, log: "connNewCognitoUser, cognitoUser error" })
          return null
        }

        console.log('connNewCognitoUser successful:', _cognitoUser)

        return _cognitoUser
}
