import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js'

import { getUserPool } from './config'



export default function({ username, password }) {

  const authenticationData = {
    Username: username,
    Password: password
  }

  const authenticationDetails = new AuthenticationDetails(authenticationData)
  console.log('authenticationDetails:', authenticationDetails)

  const userPool = getUserPool()
  console.log('userPool:', userPool)

  const userData = {
    Username: username,
    Pool: userPool
  }

  const cognitoUser = new CognitoUser(userData)
  console.log('cognitoUser:', cognitoUser)


  return new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: function(result) {
        //setCurrentUserSession(cognitoUser) // tmp

        // console.log('authenticate getCurrentUser:', userPool.getCurrentUser() )  // works with this "kind" of user pool, not the other, general kind without a username..
        resolve(result)
      },
      onFailure: function(err) {

        // trying to handle this exception in parent component
        reject({ ...err, cognitoUser })

        if (err.code === 'UserNotConfirmedException') {

          const confirmationCode = prompt("Please enter confirmation code:", "");
          console.log('cognitoUser:', cognitoUser)
          console.log('entered confirmationCode:', confirmationCode)

          if (confirmationCode === null || confirmationCode === undefined || confirmationCode.length === 0) reject('Confirmation code error!')

          cognitoUser.confirmRegistration(confirmationCode, true, function(err, result) {
            if (err) {
              reject(err)
            } else {
              // can t set context's userAccountVerified boolean var
              resolve(result)
            }
          })

        }
        reject(err)
      },
      newPasswordRequired: function(userAttributes, requiredAttributes) {

        console.log('cognitoUser.authenticateUser: newPasswordRequired callback!!')

        const newPassword = prompt("Please enter new password:","");
        if (newPassword === '') reject('Error, no new password entered!')

        // User was signed up by an admin and must provide new
        // password and required attributes, if any, to complete
        // authentication.

        // the api doesn't accept this field back
        delete userAttributes.email_verified;

        // store userAttributes on global variable
        const sessionUserAttributes = userAttributes;

        const res = cognitoUser.completeNewPasswordChallenge(newPassword, sessionUserAttributes)

        console.log('completeNewPasswordChallenge result:', res)

        if (res !== undefined) {
          resolve(res)
        } else {
          console.log('completeNewPasswordChallenge problem')
          reject(res)
        }

        /*
        reject({
          cognitoUser,
          code: 'PasswordResetRequiredException',
          message: 'New Password Required',
          newPasswordRequired: true
        })
        */
      },
      mfaRequired: function(codeDeliveryDetails) {
        console.log('cognitoUser.authenticateUser: mfaRequired callback!!!')
        // MFA is required to complete user authentication.
        // Get the code from user and call

        const confirmationCode = prompt("Please enter confirmation code:", "");
        console.log('cognitoUser:', cognitoUser)
        console.log('entered confirmationCode:', confirmationCode)

        if (confirmationCode === '') reject('Error, no confirmation code entered!')


        const res = cognitoUser.sendMFACode(confirmationCode, {
          onSuccess: function (result) {
              console.log('sendMFACode success:', result)
              resolve(result)
          },
          onFailure: function(err) {
              console.log('sendMFACode confirmation problem:', err)
              reject(err)
          }
        })

        console.log('sendMFACode result:', res)



        // sendMFACode(confirmationCode, callback, mfaType, clientMetadata) {
        /*
        reject({
          cognitoUser,
          code: 'sendMFACodeException', // my own exception
          message: 'a MFA code was sent to your account, please verify',
          mfaRequired: true
        })
        */
        //cognitoUser.sendMFACode(mfaCode, this)

      }
    })
  })
}
