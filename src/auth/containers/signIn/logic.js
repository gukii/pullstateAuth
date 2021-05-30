import React, { useState, useEffect } from "react";


import ErrorMessage from "../../custom-hooks/errorMessage";

/** Custom Hooks */
import useErrorHandler from "../../custom-hooks/ErrorHandler";


import { useHistory, useLocation } from 'react-router-dom';  // added by chris, probably not the best place to put this..
//import { Redirect } from "react-router";
import { getRouteStateVar } from '../routeHelpers'

import authenticateAsync from '../../cognito/authenticate'
//import { connSignInAsync } from '../../connectedHelpers/connSignIn'


import { R } from '../../routeNames'


import { getValuesFromSession } from '../../cognito/config'
import { resetStoredUserAuth } from '../../connectedHelpers/localStorage'


import { setAuthStatus, setUnauthStatus } from '../../connectedHelpers/authHelper'
//import { AuthStore } from "../../psStore/AuthStore";
import { createAsyncAction, errorResult, successResult } from "pullstate";


import { ConfirmationCodeDialog, PsRenderDialog, psDialogAsync, psPromptAsync, InputFunction, SimplePrompt, SimpleDialog } from '../modalPortal/modalPortal'
import { confirmSignUpAsync } from '../signUp/confirmCodeFormAsync' // called when user is not yet confirmed with confirmation code..

//import { getRouteStateVar, getRouteOrigin } from '../auth/containers/routeHelpers'



export const authUserAsyncFn = createAsyncAction(

  async ({ username, password, setLoading=null, history=null, showError=null }) => {
    // const history = useHistory()
    try {
      console.log('about to call authenticateAsync with username, password:', username, password)
      setLoading(true)

      const sess = await authenticateAsync({ username, password })
      console.log('got result, sess:', sess)
      return successResult(sess)  // standard result (e.g. is authenticated) ..
    }
    catch (e) {
      console.log('authUserAsyncFn throws, we have an Authentication edge case or an error, e:', e)
      // other results (e.g. password reset request, user needs confirmation, ...)
      return errorResult( ['Authentication edge case..'], { e } )
      //return handleEdgeCases({ e, username, password, setLoading })
    }
    finally {
      console.log('authUserAsyncFn finally..')
    }


    //return errorResult([], `Couldn't get pictures: ${result.errorMessage}`);
  },
  {
    postActionHook: async ({ args, result, stores }) => {

        args.setLoading(false)   // args.setLoading(false) ???

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
          return // its a hook
        }

        console.log('postActionHook authenticateAsync res:', result )   // result.payload.accessToken / idToken / refreshToken /

        window.alert('postActionHook authenticateAsync res:'+ JSON.stringify(result) )
        doSuccess({ sess:result.payload, username:args.username, log:"signInFormAsync, signIn ok"  })  // not sure this will be returned as fn result



        console.log('react router history:', args.history)
        // if withAuth is not pushing to login, then i don t have to push the user to the initial target component (conditional render done by withAuth)
        // args.history.push(R.PRIVATE_HOME_ROUTE)
        //  !!!! why am i not pushing to the initial private route the user wanted to go to..?

        // its a hook, no point in returning stuff here..
    },
  }
)



// triggers all pullstate related functions on successful login or login flow action (e.g. password reset, confirmation code entered, mfa ..)
// sess = cognitoUser obj returned by cognito sign-in api call
export function doSuccess({ sess, username='', log='' }) {
  console.log(log)

  const newAuthObj = { ...getValuesFromSession(sess), username, authenticated:true }  // just checks correctness and extracts values from session variable
  console.log('signInFormAsync doSuccess, newAuthObj:', newAuthObj)

  setAuthStatus(newAuthObj) // this also stores to localStorage

  // could also set s.authenticated = true (this is not really used, all data is stored in auth object)
  //AuthStore.update([ s => s.username = username, s => s.userId = sess.idToken.payload.sub ])

  //console.log('setUserId:', sess.idToken.payload.sub)
  return newAuthObj
}



// triggers all pullstate related functions on failure
export function doFailure({ log='', showError=null }) {
  console.log(log)
  setUnauthStatus({ log:"signInFormAsync doFailure log: "+log })
  showError(log)
  resetStoredUserAuth()
  return null
}




// handles edge cases outside standard login flow (e.g. password wrong, pasword needs reset, confirm user, ...)
async function handleEdgeCases({ e, username, password, setLoading=null, showError=null, history=null }) {

    switch (e.code) {
        case 'UserNotConfirmedException':
            console.log(e)
            //const confirmationCode = prompt("Please enter confirmation code:", "");

            if (!!e.cognitoUser) {
            } else {
              return doFailure({ showError, log:!!e.code ? e.code : "connSignInAsync, confirmation code flow failure, also no cognitoUser" })
            }

            // cognitoUser is added to promise reject response in "authenticate.js"
            const cognitoUser = e.cognitoUser
            console.log('cognitoUser:', cognitoUser)

            // this could throw!
            try {
              const confirmed = await confirmSignUpAsync({ cognitoUser, username, setLoading: setLoading, showError: showError })
              console.log('confirmed:', confirmed)

              if (confirmed) {
                history.push(R.PRIVATE_HOME_ROUTE)
                return doSuccess({ sess:cognitoUser, username, log:"signInFormAsync, code confirmed" })

                //return cognitoUser
              }
            } catch(e) {

              return doFailure({ showError, log:"Error, user not confirmed: "+ JSON.stringify(e) })
            }
            return null


      case 'NotAuthorizedException':

            console.log(e)
            //alert("Password or Username not correct!");
            // psDialogAsync does the same as a html "alert" prompt.
            await psPromptAsync({
              component: SimpleDialog,
              title:"Error",
              text:"Username or password incorrect or user not authorized.",
              submitLabel:"Ok",
              rejectVal:"",
              alwaysResolve: true,

              modalProps:{ screenBgImage:"https://cms.enginemailer.com/WebLITE/Applications/blog/uploaded/pics/Blog/2020/May/20200518/email_error_550/email_error_02.jpg" },

            })
            return doFailure({ showError, log:"Username or Password not correct" })


      case 'PasswordResetRequiredException':

              console.log('cognitoUser.authenticateUser: newPasswordRequired callback!!')

              // maybe should be "psPromptAsync"
              const newPassword = await psDialogAsync({ component: SimplePrompt, title:"Enter new password", text:"Your password needs to be reset.", label:"Password:", submitLabel:"Send", cancelLabel:"Cancel" })

              //const newPassword = prompt("Please enter new password:","");
              if (newPassword === '' || newPassword.length < 2) return doFailure({ showError, log:"Password reset failure, no password entered.." })


              // User was signed up by an admin and must provide new
              // password and required attributes, if any, to complete
              // authentication.

              // the api doesn't accept this field back
              delete e.userAttributes.email_verified;

              // store userAttributes on global variable
              const sessionUserAttributes = e.userAttributes;

              setLoading(true)
              // no promise here..
              // this could thow? maybe..
              const res = e.cognitoUser.completeNewPasswordChallenge(newPassword, sessionUserAttributes)

              setLoading(false)

              console.log('completeNewPasswordChallenge result:', res)

              if (res !== undefined) {
                return doSuccess({ sess:res, username, log:"connSignInAsync, password reset flow success" })
              } else {
                return doFailure({ showError, log:"CompleteNewPasswordChallenge password reset failure" })
              }

      case 'InvalidPasswordException':
              //alert('U entered an invalid password!')
              await psPromptAsync({
                component: SimpleDialog,
                title:"Error",
                text:"Username or password incorrect",
                submitLabel:"Ok",
                rejectVal:"",
                alwaysResolve: true,

                //modalProps:{ screenBgImage:"https://cms.enginemailer.com/WebLITE/Applications/blog/uploaded/pics/Blog/2020/May/20200518/email_error_550/email_error_02.jpg" },

              })
              return doFailure({ showError, log:"Username or password incorrect" })

      case 'UserNotFoundException':
              await psPromptAsync({
                component: SimpleDialog,
                title:"Error",
                text:"Username or password incorrect",
                submitLabel:"Ok",
                rejectVal:"",
                alwaysResolve: true
              })
              return doFailure({ showError, log:"Username or password incorrect" })

      case 'InvalidParameterException': //(e.g. password left blank)
              await psPromptAsync({
                component: SimpleDialog,
                title:"Error",
                text:"Fields not filled out correctly",
                submitLabel:"Ok",
                rejectVal:"",
                alwaysResolve: true
              })
              return doFailure({ showError, log:"Fields not filled out correctly" })

      case 'TooManyRequestsException':
              await psPromptAsync({
                component: SimpleDialog,
                title:"Error",
                text:"Too many requests, wait a few minutes before trying again.",
                submitLabel:"Ok",
                rejectVal:"",
                alwaysResolve: true
              })
              return doFailure({ showError, log:"Too many requests." })


      // other case parts are listed in authenticate.js, the necessary code can be uncommented and pasted in here..

      //'TooManyRequestsException'

      default:

              if (JSON.stringify(e) !== '{}') {
                  await psPromptAsync({
                      component: SimpleDialog,
                      title:"SignIn Error",
                      text: JSON.stringify(e),
                      submitLabel:"Ok",
                      rejectVal:"",
                      alwaysResolve: true
                  })
                  return doFailure({ showError, log:"SignIn Error:"+ JSON.stringify(e) })
              }

              // trying to fix an error returning {} even after successful conirmation code verification..
              return null
              //return doFailure({ showError, log: JSON.stringify(e) )
    }
}



//
// signIn form that uses promisified cognito authenticate function
//

// pushes the react router to the proper login route (router state variable "from", if present)
// if token expired, send user to login screen
export function routeOnSuccess({ result, username, pushFn, location, showError }) {

        console.log('dodoSignIn authUserAsyncFn.run resolved, result:', result)

        const accTokenData = result.payload.accessToken.payload
        // remember the URL the user came from
        const routeOrigin = getRouteStateVar({ location, fieldName: 'from' })
        //getRouteOrigin

        if (accTokenData.auth_time < accTokenData.exp && accTokenData.username === username) {


            console.log('auth.authenticated is true, auth:', result.authenticated)

            // only redirect the user to his origin URL, if the origin URL is different than signin, signup, or /, otherwise redirect to AUTH_ROUTE (=auth home page)
            console.log('routeOrigin:', routeOrigin)

            const pushRoute = routeOrigin !== ''
                  && routeOrigin.indexOf(R.SIGNIN_ROUTE) === -1
                  && routeOrigin.indexOf(R.SIGNUP_ROUTE) === -1
                  && routeOrigin !== R.PUBLIC_HOME_ROUTE
                        ? routeOrigin
                        : R.AUTH_ROUTE

            console.log('pushRoute:', pushRoute)


            //return <Redirect to={pushRoute} />;

            pushFn({ pathname: pushRoute,
                      state: { from: routeOrigin }
                    })
        } else {

            console.log('token expired, login again:', accTokenData)
            showError("Token expired, login again please..")
            pushFn({ pathname: R.SIGNIN_ROUTE,
                      state: { from: routeOrigin }
                    })

        }
  }



// testing this out... some edge case is not so great..
// not sure why this is not working, on re-renders i m getting REPLACE events that make location /
// retiring this function for now..

  // pushes the react router to the proper login route (without router "state" variable "from")
  // if token expired, send user to login screen
  export function routeOnSuccessNoState({ result, username, history, showError }) {

          const location = history.location

          console.log('dodoSignIn authUserAsyncFn.run resolved, result:', result)

          const accTokenData = result.payload.accessToken.payload
          // remember the URL the user came from
          //const routeOrigin = getRouteStateVar({ location, fieldName: 'from' })


          if (accTokenData.auth_time < accTokenData.exp && accTokenData.username === username) {


              console.log('auth.authenticated is true, auth:', result.authenticated)
              console.log('signin logic, history:', history.length, history)

              if (history.length > 0) {
                console.log('signin, router going back..')
                history.goBack()              // go back one level (where the user initially wanted to go..)
              } else {
                console.log('signin, router going to auth_route..')
                history.push( R.AUTH_ROUTE )  // = the page to go after successful authentication
              }

          } else {

              console.log('token expired, login again:', accTokenData)
              showError("Token expired, login again please..")

              if (history.location.pathname !== R.SIGNIN_ROUTE) {
                history.push( R.SIGNIN_ROUTE )
              }


          }
    }
