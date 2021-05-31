import {
    CognitoUser,
  } from "amazon-cognito-identity-js";


import { getUserPool } from "../cognito/config";
import { getStoredUsername } from "./localStorage";


// gets username from "username" prop or stored (on localstorage) username (without hitting aws api)
// clear user auth data, if there s no username

export function connGetCognitoUsername({ setUnauthStatus, username=null, log="" }) {

  if (log.length > 0) console.log(`connGetCognitoUsername, log: ${log}`)


  const knownUsername = username || getStoredUsername()
  console.log(`>> connGetCognitoUsername username:${username}, knownUsername:${knownUsername}`)
  if (knownUsername === null) {
    setUnauthStatus({ keepUsername: true, log: "connGetCognitoUsername, username is null" })
    return null
  }

  return knownUsername
}



// get current active congito user from AWS.
// if there s no active cognito user, clear user auth data.

export async function connNewCognitoUser({ setUnauthStatus, username=null, log="" }) {

        if (log.length > 0) console.log(`connNewCognitoUser, log: ${log}`)

        if (!username) {
          console.log(`error: no username for connNewCognitoUser, returning early..`)
          return
        }

        // could do: setUsername(knownUsername)

        console.log('>> connNewCognitoUser: username:', username)   // has no value..


        const userData = {
          Username: username,
          Pool:  getUserPool(),
        }

        const awsCognitoUser = new CognitoUser(userData);
        if (awsCognitoUser === null) {
          console.log('!!! connNewCognitoUser: ERROR couldnt get cognitoUser, returning early..')
          setUnauthStatus({ keepUsername: true, log: "connNewCognitoUser, cognitoUser error" })
          return null
        }

        console.log('connNewCognitoUser successful:', awsCognitoUser)

        return awsCognitoUser
}
