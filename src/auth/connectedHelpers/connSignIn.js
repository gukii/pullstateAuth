//import React, { useState, useEffect } from "react";
/*
import authenticateAsync from '../cognito/authenticate'
import { getValuesFromSession } from '../cognito/config'
import { resetStoredUserAuth } from '../cognito/localStorage'


// called by the "SignInForm" function below

export async function connSignInAsync({ username='', password='', setAuthStatus, setUnauthStatus, setUsername, setUserId, setSession }) {
  console.log('connSignInAsync called with username/password:', username, password)

  if (username==='' || password === '') {
    alert('Enter a username and password!')
    return null
  }

  // 019785

  try {
    const sess = await authenticateAsync({ username, password })
    console.log('connSignInAsync, sucessful sign in:', sess)

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

  }
  catch(e) {
    console.log('connSignInAsync err:', e)
    alert(!!e.message && !!e.code ? `${e.message} (${e.code})` : JSON.stringify(e))




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