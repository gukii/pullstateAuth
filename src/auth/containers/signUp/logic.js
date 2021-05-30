import React, { useState, useEffect } from "react";
//import * as validator from "validator"


import ErrorMessage from "../../custom-hooks/errorMessage";

/** Custom Hooks */
import useErrorHandler from "../../custom-hooks/ErrorHandler";


import { useHistory, useLocation } from 'react-router-dom';  // added by chris, probably not the best place to put this..
//import { Redirect } from "react-router";
import { getRouteStateVar } from '../routeHelpers'

import registerAsync from '../../cognito/register'
//import { connSignInAsync } from '../../connectedHelpers/connSignIn'


import { R } from '../../routeNames'


import { getValuesFromSession } from '../../cognito/config'
import { resetStoredUserAuth } from '../../connectedHelpers/localStorage'


import { setAuthStatus, setUnauthStatus } from '../../connectedHelpers/authHelper'
//import { AuthStore } from "../../psStore/AuthStore";
import { createAsyncAction, errorResult, successResult } from "pullstate";


import { ConfirmationCodeDialog, PsRenderDialog, psDialogAsync, psPromptAsync, InputFunction, SimplePrompt, SimpleDialog } from '../modalPortal/modalPortal'
import { confirmSignUpAsync } from '../signUp/confirmCodeFormAsync'

//import { getRouteStateVar, getRouteOrigin } from '../auth/containers/routeHelpers'

/*
const signupAttributes = [
  { Name: 'email',          Value: email },   // remove again
  //{ Name: 'custom:email',          Value: email },

  //{ Name: 'custom:displayname',           Value: displayname },
  //{ Name: 'username',       Value: formUsername },
  { Name: 'name',       Value: name },        // remove again
  //{ Name: 'birthdate',      Value: birthdate },
//        { Name: 'phone_number',   Value: phone }, // reinstate again
  //{ Name: 'custom:country', Value: country },
  //{ Name: 'custom:line_id', Value: "some line id" },

]
*/

export const registerUserAsyncFn = createAsyncAction(
  async ({ username, password, signupAttributes, setLoading=null, history=null, showError=null }) => {
    // const history = useHistory()
    try {
      console.log('about to call registerAsync with username, password:', username, password)
      setLoading(true)

      // registerAsync props: username, password, signupAttributes=[{ Name: "email", Value: "noemail" }]
      const sess = await registerAsync({ username, password, signupAttributes })
      console.log('got result, sess:', sess)
      return successResult(sess)  // standard result (e.g. is authenticated) ..
    }
    catch (e) {
      console.log('authUserAsyncFn throws, we have an SignUp edge case or an error, e:', e)
      // other results (e.g. password reset request, user needs confirmation, ...)
      return errorResult( ['SignUp edge case..'], { e } )
      //return handleEdgeCases({ e, username, password, setLoading })
    }
    finally {
      console.log('authUserAsyncFn finally..')
    }


    //return errorResult([], `Couldn't get pictures: ${result.errorMessage}`);
  },
  {
    postActionHook: async ({ args, result, stores }) => {

        args.setLoading(false)

        if (result.error) {
          console.log('result.message:', result )   // should have .e
          handleEdgeCases({   e:result.message.e,   // might be result.error   or   result.payload
                              ...args,  // all args the asyncAction was called with, should cover the fields below:
                              /*
                              username:args.username,
                              password:args.password,
                              setLoading:args.setLoading,
                              history:args.history,
                              showError:args.showError
                              */

                          })     // not sure this will be returned as fn result
          return // its a hook, return early
        }

        console.log('postActionHook authenticateAsync res:', result )   // result.payload.accessToken / idToken / refreshToken /

        window.alert('postActionHook authenticateAsync res:'+ JSON.stringify(result) )


        // signup call successful, but user not yet confirmed !!!
        // also no user-session at this point

        const res = result.payload || false

        if (res && res.user) {

            console.log('doSignUp registerAsync result.user:', res.user)

            // need this username to create a cognitoUser from (userPool + username)
            // could also write this into auth.username
            //setUsername(result.user.username);  // this sets username of context, not of localStorage!! need to bring these two together..
            const resUsername = res.user.username
            const resUserId = res.userSub

            // resets auth object and inject username + userId into new auth object, writes this object into localStorage
            //setUnauthStatus({ props: {username: resUsername, userId: resUserId}, log:"signUp Ok before confirmCode" })
            setUnauthStatus({ props: {username: resUsername}, log:"signUp Ok before confirmCode" })

            console.log('doSignUp setUserId:', resUserId)
            //setUserId(result.userSub);
            //setTimestamp(+stringUserTimestamp);


            // could use this cognitoUser right here..
            // const cognitoUser = result.user;
          	// console.log('user name is ' + cognitoUser.getUsername());
            // e.g. to confirm userAttributes

            // if cognito is setup to demand verification of email or phone number:
            args.setLoading(true)
            const confirmed = await confirmSignUpAsync({ cognitoUser: res, username: resUsername, setLoading: args.setLoading, showError: args.showError })
            args.setLoading(false)

            console.log('confirmed:', confirmed)

            if (confirmed) {
              doSuccess({ sess:res.payload, username:args.username, log:"signUpFormAsync, signUp ok"  })  // not sure this will be returned as fn result

              args.history.push(R.SIGNIN_ROUTE)
              return true
            }

            return null
            //doSuccess()

        }

    },  // postActionHook
  }
)




// both of doSuccess and doFailure are identical to signIn versions of these functions.. (except for cosole.log s )


// triggers all pullstate related functions on successful login or login flow action (e.g. password reset, confirmation code entered, mfa ..)
// sess = cognitoUser obj returned by cognito sign-in api call
export function doSuccess({ sess, username='', log='' }) {
  console.log(log)

  const newAuthObj = { ...getValuesFromSession(sess), username, authenticated:true }  // just checks correctness and extracts values from session variable
  console.log('signUpFormAsync doSuccess, newAuthObj:', newAuthObj)

  setAuthStatus(newAuthObj) // this also stores to localStorage

  // could also set s.authenticated = true (this is not really used, all data is stored in auth object)
  //AuthStore.update([ s => s.username = username, s => s.userId = sess.idToken.payload.sub ])

  //console.log('setUserId:', sess.idToken.payload.sub)
  return newAuthObj
}



// triggers all pullstate related functions on failure
export function doFailure({ log='', showError=null }) {
  console.log(log)
  setUnauthStatus({ log:"signUpFormAsync doFailure log: "+log })
  showError(log)
  resetStoredUserAuth()
  return null
}




// handles edge cases outside standard login flow (e.g. username not available, pasword wrong, ...)
async function handleEdgeCases({ e, username, password, setLoading=null, showError=null, history=null }) {

// username and password are actually not used..

    console.log('doSignUp exeception:', e)

    switch (e.code) {

        case 'InvalidParameterException': //(e.g. password left blank)
                await psPromptAsync({
                  component: SimpleDialog,
                  title:"Fields not filled out correctly",
                  //text:"User sign in not possible. Try again next time.",
                  submitLabel:"Ok",
                  rejectVal:"",
                  alwaysResolve: true
                })
                return doFailure({ showError, log:"Fields not filled out correctly" })

        case 'TooManyRequestsException':
                await psPromptAsync({
                  component: SimpleDialog,
                  title:"Too many requests",
                  text:"You have tried too often. If you keep trying, you will get blocked. Try again in a few hours.",
                  submitLabel:"Ok",
                  rejectVal:"",
                  alwaysResolve: true
                })
                return doFailure({ showError, log:"Too many requests." })

        case 'UsernameExistsException':
                await psPromptAsync({
                  component: SimpleDialog,
                  title:"Username already exists",
                  text:"Choose a different username",
                  submitLabel:"Ok",
                  rejectVal:"",
                  alwaysResolve: true
                })
                return doFailure({ showError, log:"Username already exists." })

        //
        // the following 3 exceptions are handled within "confirmCodeFormAsync.js", which is called during the sign-in flow
        //

        case 'ExpiredCodeException':

        case 'CodeMismatchException': // This exception is thrown if the provided code does not match what the server was expecting

        case 'CodeDeliveryFailureException':

        default:
                if (JSON.stringify(e) !== '{}') {
                  await psPromptAsync({
                      component: SimpleDialog,
                      title:"SignUp Error",
                      text: JSON.stringify(e),
                      submitLabel:"Ok",
                      rejectVal:"",
                      alwaysResolve: true
                  })
                  return doFailure({ showError, log:"SignUp Error:"+JSON.stringify(e) })
                }

                // trying to fix a {} error that keeps showing up..
                return null
                //return doFailure( JSON.stringify(e) )
    }

}
