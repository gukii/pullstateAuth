//import React, { useState, useEffect } from "react";

import authenticateAsync from '../cognito/authenticate'
//import { authContext } from "../contexts/AuthContext";
import { getValuesFromSession } from '../cognito/config'
import { resetStoredUserAuth } from '../cognito/localStorage'

import { confirmCognitoUserAsync } from '../cognito/confirmation'


// called by the "SignInForm" function below

export async function connSignInAsync({ username='', password='', setAuthStatus, setUnauthStatus, setUsername, setUserId, setSession }) {

  // triggers all context related functions on successful login or login flow action (e.g. password reset, confirmation code entered, mfa ..)
  function doSuccess(sess, log='') {
    console.log(log)
    const newAuthObj = { ...getValuesFromSession(sess), username }  // just checks correctness and extracts values from session variable
    //setSession(sess)
    //setCognitoUser(sess)
    setAuthStatus(newAuthObj) // this also stores to localStorage
    setUsername(username)               // good to have for creating userpools
    console.log('setUserId:', sess.idToken.payload.sub)
    setUserId(sess.idToken.payload.sub) // also present within "auth"
    return newAuthObj
  }

  // triggers all context related functions on failure
  function doFailure(log='') {
    console.log(log)
    setUnauthStatus({ log:"connSignInAsync error. "+log })
    resetStoredUserAuth()
    return null
  }



  console.log('connSignInAsync called with username/password:', username, password)

  if (username==='' || password === '') {
    alert('Enter a username and password!')
    return null
  }

  // confirmation code for gukii@yahoo.com 019785

  try {
    const sess = await authenticateAsync({ username, password })
    //onsole.log('connSignInAsync, sucessful sign in:', sess)

    return doSuccess(sess, "connSignInAsync, normal login flow success")
/*

    const newAuthObj = { ...getValuesFromSession(sess), username }  // just checks correctness and extracts values from session variable

    //setSession(sess)
    //setCognitoUser(sess)

    setUsername(username)               // good to have for creating userpools
    setAuthStatus(newAuthObj) // this also stores to localStorage

    // every "set" function prompts a rerender..

    console.log('setUserId:', sess.idToken.payload.sub)
    setUserId(sess.idToken.payload.sub) // also present within "auth"

    // should i store "username" these to localStorage?

    return newAuthObj
*/
  }
  catch(e) {
    console.log('connSignInAsync err:', e)
    alert(!!e.message && !!e.code ? `${e.message} (${e.code})` : JSON.stringify(e))


    if (e.code) {

      switch(e.code) {

        case 'UserNotConfirmedException':

            const confirmationCode = prompt("Please enter confirmation code:", "");
            console.log('cognitoUser:', cognitoUser)
            console.log('entered confirmationCode:', confirmationCode)

            if (confirmationCode === null || confirmationCode === undefined || confirmationCode.length === 0) return doFailure("connSignInAsync, confirmation code not entered" )

            try {
              const sess = await confirmCognitoUserAsync(cognitoUser, code)
              return doSuccess(sess, "connSignInAsync, confirmation code flow success")
            }
            catch (err) {
              return doFailure( !!err.code ? err.code : "connSignInAsync, confirmation code flow failure" )
            }
            break

        case 'newPasswordRequired': function(userAttributes, requiredAttributes) {

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

              const sess = cognitoUser.completeNewPasswordChallenge(newPassword, sessionUserAttributes)

              console.log('completeNewPasswordChallenge result:', res)

              if (sess !== undefined) {
                return doSuccess(sess, "connSignInAsync, completeNewPasswordChallenge flow success")
              } else {
                return doFailure( !!err.code ? err.code : "connSignInAsync, completeNewPasswordChallenge flow failure" )
              }

            }
            break

        case 'mfaRequired': function(codeDeliveryDetails) {
              console.log('cognitoUser.authenticateUser: mfaRequired callback!!!')
              // MFA is required to complete user authentication.
              // Get the code from user and call

              const confirmationCode = prompt("Please enter confirmation code:", "");
              console.log('cognitoUser:', cognitoUser)
              console.log('entered confirmationCode:', confirmationCode)

              if (confirmationCode === '') reject('Error, no confirmation code entered!')


              const sess = cognitoUser.sendMFACode(confirmationCode, {
                onSuccess: function (result) {
                    console.log('sendMFACode success:', result)
                    return doSuccess(result, "connSignInAsync, sendMFACode flow success")
                },
                onFailure: function(err) {
                  return doFailure( !!err.code ? err.code : "connSignInAsync, sendMFACode flow failure" )
                }
              })

              console.log('sendMFACode result:', sess)

            }
            break

        default: doFailure(e.code+" didn t catch in connSignInAsync, maybe a new error code?")
      } // end of switch
    } // end of if err.code
  } // end of catch

  finally {
    console.log('connSignInAsync finally..')
  }
}
