//import React, { useState, useEffect } from "react";
/*
import registerAsync from '../cognito/register'
import { getValuesFromSession } from '../cognito/config'
import { resetStoredUserAuth } from '../cognito/localStorage'

import { connNewCognitoUser, connGetCognitoUsername } from './connCognitoUser'
import { confirmCognitoUserAsync } from './cognito/confirmation'

// NOT REALLY USED, I M TRYING TO DO ALL OF THIS IN  "containers/signUp/signUpFormAsync"

// called by the "SignInForm" function below

export async function connSignUpAsync({ loginId='', // = username, email, phonenumber (anything that is setup to be used for login)
                                        password='',
                                        signupAttributes=[{ Name: "email", Value: email }],
                                        setAuthStatus,
                                        setUnauthStatus,
                                        log='',
                                        setUsername,
                                        setUserId,
                                        openConfirmationCodeModal
                                      }) {

  if (log.length > 0) console.log(`connSignUpAsync, log: ${log}`)
  console.log('connSignInAsync called with username/password/signupAttributes:', loginId, password, signupAttributes)

  if (username==='' || password === '') return null

  try {

    setLoading(true)

    const result = await registerAsync({ loginId, password, signupAttributes })

    setLoading(false)


    console.log('connSignInAsync, sucessful sign in:', result)

    const newAuthObj = { ...getValuesFromSession(result), username }  // just checks correctness and extracts values from session variable



    setUsername(loginId)               // good to have for creating userpools
    setAuthStatus(newAuthObj) // this also stores to localStorage

    // every "set" function prompts a rerender..

    console.log('setUserId:', result.idToken.payload.sub)
    setUserId(result.userSub) // also present within "auth"

    //setTimestamp(+stringUserTimestamp);
    openConfirmationCodeModal(true);

    // should i store "username" these to localStorage?

    return newAuthObj

  }
  catch(e) {
    console.log('connSignInAsync err:', e)

    //setLoading(false);
    //setError(err.message);

    setUnauthStatus({ log:"connSignInAsync error"})
    resetStoredUserAuth()
    // where is that error messzge getting shown?

    //console.log('after authObj reset, authObj:', getAuthObj() )
    //code: 'PasswordResetRequiredException'
    return null
  }
  finally {
    console.log('connSignInAsync finally..')
  }
}
*/