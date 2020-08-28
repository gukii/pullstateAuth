import React, { useState, useEffect } from "react";


//import { Button, Form, FormGroup, Label, Input } from "reactstrap";

/** Context consumer */
//import { authContext } from "../../contexts/AuthContext";

/** Presentation/UI */
//import { SignUpContainer } from "../../../AppStyles.styles.tw";
import ErrorMessage from "../../errorMessage";

/** Custom Hooks */
import useErrorHandler from "../../custom-hooks/ErrorHandler";

/** Utils */
//import * as auth from "../../helpers/auth";
//import { validateForm } from "./helpers";


//import { authContext } from "../../contexts/AuthContext";
//import { getValuesFromSession } from '../../cognito/config'

import { useHistory, useLocation, history } from 'react-router-dom';  // added by chris, probably not the best place to put this..
import { Redirect } from "react-router";
import { pushWithProperOrigin, getRouteOrigin, getRouteStateVar } from '../routeHelpers'

import authenticateAsync from '../../cognito/authenticate'
//import { connSignInAsync } from '../../connectedHelpers/connSignIn'


import { R } from '../../routeNames'


import { getValuesFromSession } from '../../cognito/config'
import { resetStoredUserAuth } from '../../cognito/localStorage'

import { confirmCognitoUserAsync } from '../../cognito/confirmation'

import { setAuthStatus, setUnauthStatus } from '../../custom-hooks/psAuthHandler'
import { AuthStore } from "../../psStore/AuthStore";



import { ConfirmationCodeDialog, PsRenderDialog, psDialogAsync, InputFunction, SimplePrompt, SimpleDialog } from '../modalPortal/modalPortal'


//
// signIn form that uses promisified cognito authenticate function
//

const SignInForm = function() {



  const history = useHistory();    // added by chris
  const location = useLocation()

  const [email, setEmail] = useState("");
  const [formUsername, setFormUsername] = useState("");

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { error, showError } = useErrorHandler(null);

  const [accessTokenExp, setAccessTokenExp] = useState(0)
  //const [firstRender, setFirstRender] = useState(false)
  const SECS_BEFORE = (59*60) // = 59min  // should be about 10, secs before token expires to re-new token while still valid

  const auth = AuthStore.useState(s => s.auth)
  //const auth = AuthStore.auth  

  /*
  const {
    auth,
    openConfirmationCodeModal,
    setUsername,
    setUserId,
    setTimestamp,
    setAuthStatus,
    setUnauthStatus,
  } = React.useContext(authContext);
*/
  /*
    isAuthenticated: false,

    username: null,
    userId: null,

    auth: EMPTY_USER_AUTH,

    userAccountVerified: false,
    attributeVerified: false,
    mfaVerified: false,    
  */


  if (auth.authenticated) {

    // remember the URL the user came from
    const routeOrigin = getRouteStateVar({ location, fieldName: 'from' })
    console.log('auth.authenticated is true, auth:', auth)

    // only redirect the user to his origin URL, if the origin URL is different than signin, signup, or /, otherwise redirect to AUTH_ROUTE (=auth home page)
    console.log('routeOrigin:', routeOrigin)
    const pushRoute = routeOrigin !== '' && routeOrigin.indexOf(R.SIGNIN_ROUTE) === -1 && routeOrigin.indexOf(R.SIGNUP_ROUTE) === -1 && routeOrigin !== R.PUBLIC_HOME_ROUTE
      ? routeOrigin
      : R.AUTH_ROUTE

    return <Redirect to={pushRoute} />;
  }


  // SIGN-IN LOGIC
  async function doSignIn({ username='', password='' }) {

    // triggers all context related functions on successful login or login flow action (e.g. password reset, confirmation code entered, mfa ..)
    // sess = cognitoUser obj returned by cognito sign-in api call
    function doSuccess(sess, log='') {
      console.log(log)

      const newAuthObj = { ...getValuesFromSession(sess), username, authenticated:true }  // just checks correctness and extracts values from session variable
      //setSession(sess)
      //setCognitoUser(sess)
      setAuthStatus(newAuthObj) // this also stores to localStorage

      // setAuthStatus does this:
      //storeUserAuth(userAuth)
      //AuthStore.update(s => { s.auth = newAuthObj })

      // could also set s.authenticated = true
      AuthStore.update([ s => s.username = username, s => s.userId = sess.idToken.payload.sub ])

      console.log('setUserId:', sess.idToken.payload.sub)
      return newAuthObj
    }

    // triggers all context related functions on failure
    function doFailure(log='') {
      console.log(log)
      setUnauthStatus({ log:"connSignInAsync error. "+log })
      showError(log)
      resetStoredUserAuth()
      return null
    }

    // called by the "SignInForm" function below

      console.log('connSignInAsync doSignIn called with username/password:', username, password)

      if (username==='' || password === '') {
        //alert('Enter a username and password!')
        await psDialogAsync({ 
          component: SimpleDialog, 
          title:"Please enter a password", 
          //text:"User sign in not possible. Try again next time.", 
          submitLabel:"Ok", 
          rejectVal:"", 
          alwaysResolve: true 
        })           
        return null
      }

      // confirmation code for gukii@yahoo.com 019785

      try {
        setLoading(true)
        const sess = await authenticateAsync({ username, password })
        setLoading(false)

        return doSuccess(sess, "connSignInAsync, normal login flow success")

      }
      catch(e) {

        setLoading(false)

        switch (e.code) {
          case 'UserNotConfirmedException':
              console.log(e)
              //const confirmationCode = prompt("Please enter confirmation code:", "");
              
              // needs to be in a try() catch(e)...
              const confirmationCode = await psDialogAsync({ 
                component: SimplePrompt, 
                title:"Confirmation Code", 
                text:"Please enter the confirmation code sent to your phone or email.", 
                label:"Code:", 
                submitLabel:"Verify", 
                cancelLabel:"Cancel", 
                rejectVal:"", 
                alwaysResolve: true 
              })


              if (!!e.cognitoUser) {

              } else {
                return doFailure( !!e.code ? e.code : "connSignInAsync, confirmation code flow failure, also no cognitoUser" )
              }

              const cognitoUser = e.cognitoUser
              console.log('cognitoUser:', cognitoUser)
              console.log('entered confirmationCode:', confirmationCode)

              if (confirmationCode === null || confirmationCode === undefined || confirmationCode.length === 0) {
                //alert("Confirmation code not entered")
                await psDialogAsync({ 
                  component: SimpleDialog, 
                  title:"Confirmation Code not entered", 
                  text:"User sign in not possible. Try again next time.", 
                  submitLabel:"Ok", 
                  rejectVal:"", 
                  alwaysResolve: true 
                })                
                return doFailure("connSignInAsync, confirmation code not entered" )
              }

              try {
                setLoading(true)
                const sess = await confirmCognitoUserAsync(cognitoUser, confirmationCode)
                setLoading(false)
                return doSuccess(sess, "connSignInAsync, confirmation code flow success")
              }
              catch (err) {
                setLoading(false)
                // ExpiredCodeException   // err.message: Invalid code provided, please request a code again.
                if (err.code === 'ExpiredCodeException') alert(err.message || "confirmation code expired, request a new one..")
                return doFailure( !!err.code ? err.code : "connSignInAsync, confirmation code flow failure" )
              }
              break

        case 'NotAuthorizedException':

              console.log(e)
              //alert("Password or Username not correct!");
              await psDialogAsync({ 
                component: SimpleDialog, 
                title:"Password incorrect", 
                //text:"User sign in not possible. Try again next time.", 
                submitLabel:"Ok", 
                rejectVal:"", 
                alwaysResolve: true 
              })                 

              return doFailure( !!e.code ? e.code : "connSignInAsync, confirmation code flow failure, also no cognitoUser" )
              break


        case 'PasswordResetRequiredException':

                console.log('cognitoUser.authenticateUser: newPasswordRequired callback!!')

                const newPassword = await psDialogAsync({ component: SimplePrompt, title:"Enter new password", text:"Your password needs to be reset.", label:"Password:", submitLabel:"Send", cancelLabel:"Cancel" })

                //const newPassword = prompt("Please enter new password:","");
                if (newPassword === '') return doFailure("connSignInAsync, password reset flow failure, no password entered" )


                // User was signed up by an admin and must provide new
                // password and required attributes, if any, to complete
                // authentication.

                // the api doesn't accept this field back
                delete e.userAttributes.email_verified;

                // store userAttributes on global variable
                const sessionUserAttributes = e.userAttributes;

                setLoading(true)
                // no promise here..
                const res = e.cognitoUser.completeNewPasswordChallenge(newPassword, sessionUserAttributes)

                setLoading(false)
                
                console.log('completeNewPasswordChallenge result:', res)

                if (res !== undefined) {
                  return doSuccess(res, "connSignInAsync, password reset flow success")
                } else {
                  return doFailure("connSignInAsync, completeNewPasswordChallenge password reset flow failure" )
                }

                break

        case 'InvalidPasswordException':
                //alert('U entered an invalid password!')
                await psDialogAsync({ 
                  component: SimpleDialog, 
                  title:"Password incorrect", 
                  //text:"User sign in not possible. Try again next time.", 
                  submitLabel:"Ok", 
                  rejectVal:"", 
                  alwaysResolve: true 
                })                 
                return doFailure("connSignInAsync, InvalidPasswordException.." )
                break

        // other case parts are listed in authenticate.js, the necessary code can be uncommented and pasted in here..

        default:

            if (!!e.message && !!e.code) {
                alert(`${e.message} (${e.code})`)
                return doFailure('!!! connSignInAsync err:' + !!e.message && !!e.code ? `${e.message} (${e.code})` : JSON.stringify(e))
            }
            //alert(JSON.stringify(e))

      }
    }
    finally {
      console.log('connSignInAsync doSignIn finally..')
    }

  } // dosSignIn Function




  return (
    <div>

      { loading && <div className="loader centered"/> }      
      

      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        onSubmit={ async e => {
          e.preventDefault();
          console.log('onSubmit called..', e)

          const auth = await doSignIn({ username:formUsername, password })

          //console.log('after connSignInAsync, auth.authenticated, auth.username:', auth.authenticated, auth.username)
          // need to wait for context state to be set by connSignInAsync.. will not show right away in the next few lines..!!

          //const res = await connSignInAsync({ username:formUsername, password, setAuthStatus, setUnauthStatus, setUsername, setUserId })
          //if (res === null) return
          //console.log('onSubmit res:', res)

      }}
      >

        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="formUsername">
                Username
            </label>
            <input
              type="text"
              name="formUsername"
              value={formUsername}
              id="formUsername"
              placeholder=""
              onChange={e => setFormUsername(e.target.value)}
            />
        </div>





        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="password">
                Password
            </label>
            <input
              type="password"
              name="password"
              value={password}
              id="password"
              onChange={e => setPassword(e.target.value)}
            />
        </div>


        <br />


        <button type="submit" className="inline-block">
          {loading ? "Loading..." : "Sign In"}
        </button>

        <button onClick={ ()=> { history.push(R.SIGNUP_ROUTE); } } className="inline-block">
          Sign Up
        </button>

        { error && <ErrorMessage errorMessage={error} />  }

      </form>
    </div>
  );
};

export default SignInForm;

/*

        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            name="email"
            value={email}
            id="email"
            placeholder="yourname@entelect.co.za"
            onChange={e => setEmail(e.target.value)}
          />
        </FormGroup>








      { loading && <>
        <div className="animate-spin h-5 w-5 mr-3">ss</div>
        <span class="flex h-3 w-3">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-3 w-3 bg-pink-500"></span>
        </span>        
        Loading...
      </>  }        
*/
