import { CognitoUser } from 'amazon-cognito-identity-js'
import { getUserPool } from './config'

// THERE ARE TWO VERSIONS FOR CONFIRMATION IN THIS FILE !!! BOTH DO THE SAME, WITH DIFFERENT PARAMETERS


// username = even if a different loginId is set, it needs the username.
// code = confirmation code
// !! userPool imported from config!!
export default function(username, code) {

  const userData = {
    Username: username,
    Pool: getUserPool()
  }

  return new Promise((resolve, reject) => {

    const cognitoUser = new CognitoUser(userData)
    if (!cognitoUser) reject('no cogntioUser for confirmRegistration')

    cognitoUser.confirmRegistration(code, true, function(err, result) {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })
    reject('cognitoUser error in confirmation.js')
  })
}


// cognitoUser = valid cognitoUser
// code = confirmation code

export function confirmCognitoUserAsync(cognitoUser, code=null) {

  return new Promise((resolve, reject) => {

    if (!cognitoUser) reject('confirmCognitoUserAsync:no cogntioUser for confirmRegistration')
    if (!code) reject('confirmCognitoUserAsync: no verification code')

    cognitoUser.confirmRegistration(code, true, function(err, result) {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })

  })
}
