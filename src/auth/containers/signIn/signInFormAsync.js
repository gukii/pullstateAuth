import React, { useState, useEffect } from "react";


//import { Button, Form, FormGroup, Label, Input } from "reactstrap";


/** Presentation/UI */
//import { SignUpContainer } from "../../../AppStyles.styles.tw";
import ErrorMessage from "../../errorMessage";

/** Custom Hooks */
import useErrorHandler from "../../custom-hooks/ErrorHandler";


import { useHistory, useLocation } from 'react-router-dom';  // added by chris, probably not the best place to put this..
import { Redirect } from "react-router";
import { getRouteStateVar } from '../routeHelpers'

import authenticateAsync from '../../cognito/authenticate'
//import { connSignInAsync } from '../../connectedHelpers/connSignIn'


import { R } from '../../routeNames'


import { getValuesFromSession } from '../../cognito/config'
import { resetStoredUserAuth } from '../../cognito/localStorage'


import { setAuthStatus, setUnauthStatus } from '../../connectedHelpers/authHelper'
import { AuthStore } from "../../psStore/AuthStore";



import { ConfirmationCodeDialog, PsRenderDialog, psDialogAsync, InputFunction, SimplePrompt, SimpleDialog } from '../modalPortal/modalPortal'
import { confirmSignUpAsync } from '../signUp/confirmCodeFormAsync'

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


    // triggers all pullstate related functions on successful login or login flow action (e.g. password reset, confirmation code entered, mfa ..)
    // sess = cognitoUser obj returned by cognito sign-in api call
    function doSuccess(sess, log='') {
      console.log(log)

      const newAuthObj = { ...getValuesFromSession(sess), username, authenticated:true }  // just checks correctness and extracts values from session variable

      setAuthStatus(newAuthObj) // this also stores to localStorage

      // could also set s.authenticated = true (this is not really used, all data is stored in auth object)
      //AuthStore.update([ s => s.username = username, s => s.userId = sess.idToken.payload.sub ])

      console.log('setUserId:', sess.idToken.payload.sub)
      return newAuthObj
    }



    // triggers all pullstate related functions on failure
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
          title:"Please enter a username and password", 
          //text:"User sign in not possible. Try again next time.", 
          submitLabel:"Ok", 
          rejectVal:"", 
          alwaysResolve: true 
        })           
        return doFailure("Please enter a username and password" )
      }

      // confirmation code for gukii@yahoo.com 019785

      try {
        setLoading(true)
        const sess = await authenticateAsync({ username, password })
        setLoading(false)

        history.push(R.PRIVATE_HOME_ROUTE)
        return doSuccess(sess, "signInFromAsync, signIn ok")


      }
      catch(e) {

        setLoading(false)

        switch (e.code) {
          case 'UserNotConfirmedException':
              console.log(e)
              //const confirmationCode = prompt("Please enter confirmation code:", "");

              if (!!e.cognitoUser) {
              } else {
                return doFailure( !!e.code ? e.code : "connSignInAsync, confirmation code flow failure, also no cognitoUser" )
              }

              // cognitoUser is added to promise reject response in "authenticate.js"
              const cognitoUser = e.cognitoUser
              console.log('cognitoUser:', cognitoUser)


              const confirmed = await confirmSignUpAsync({ cognitoUser, username, setLoading: setLoading, showError: showError })
              console.log('confirmed:', confirmed)

              if (confirmed) { 
                history.push(R.PRIVATE_HOME_ROUTE)
                return doSuccess(cognitoUser, "signInFromAsync, code confirmed")

                //return cognitoUser
              }
              return null


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
              return doFailure("Username or Password not correct" )


        case 'PasswordResetRequiredException':

                console.log('cognitoUser.authenticateUser: newPasswordRequired callback!!')

                const newPassword = await psDialogAsync({ component: SimplePrompt, title:"Enter new password", text:"Your password needs to be reset.", label:"Password:", submitLabel:"Send", cancelLabel:"Cancel" })

                //const newPassword = prompt("Please enter new password:","");
                if (newPassword === '') return doFailure("Password reset failure, no password entered.." )


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
                  return doFailure("CompleteNewPasswordChallenge password reset failure" )
                }

        case 'InvalidPasswordException':
                //alert('U entered an invalid password!')
                await psDialogAsync({ 
                  component: SimpleDialog, 
                  title:"Username or password incorrect", 
                  //text:"User sign in not possible. Try again next time.", 
                  submitLabel:"Ok", 
                  rejectVal:"", 
                  alwaysResolve: true 
                })                 
                return doFailure("Username or password incorrect" )

        case 'UserNotFoundException':
                await psDialogAsync({ 
                  component: SimpleDialog, 
                  title:"Username or password incorrect", 
                  //text:"User sign in not possible. Try again next time.", 
                  submitLabel:"Ok", 
                  rejectVal:"", 
                  alwaysResolve: true 
                })                 
                return doFailure("Username or password incorrect" )    
          
        case 'InvalidParameterException': //(e.g. password left blank)
                await psDialogAsync({ 
                  component: SimpleDialog, 
                  title:"Fields not filled out correctly", 
                  //text:"User sign in not possible. Try again next time.", 
                  submitLabel:"Ok", 
                  rejectVal:"", 
                  alwaysResolve: true 
                })                 
                return doFailure("Fields not filled out correctly" ) 
                                 
        case 'TooManyRequestsException': 
                await psDialogAsync({ 
                  component: SimpleDialog, 
                  title:"Too many requests", 
                  text:"You have tried too often. If you keep trying, you will get blocked. Try again in a few hours.", 
                  submitLabel:"Ok", 
                  rejectVal:"", 
                  alwaysResolve: true 
                })                 
                return doFailure("Too many requests." )                 

        // other case parts are listed in authenticate.js, the necessary code can be uncommented and pasted in here..

        //'TooManyRequestsException'

        default:

                if (JSON.stringify(e) !== '{}') {
                    await psDialogAsync({ 
                        component: SimpleDialog, 
                        title:"SignIn Error", 
                        text: JSON.stringify(e), 
                        submitLabel:"Ok", 
                        rejectVal:"", 
                        alwaysResolve: true 
                    })              
                    return doFailure("SignIn Error:", JSON.stringify(e) )   
                }

                // trying to fix an error returning {} even after successful conirmation code verification..
                return null
                //return doFailure( JSON.stringify(e) )            
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

          //const auth = await doSignIn({ username:formUsername, password })
          doSignIn({ username:formUsername, password })

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
      
      








/*
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
                return doFailure("Confirmation code not entered" )
              }

              try {
                setLoading(true)
                const result = await confirmCognitoUserAsync(cognitoUser, confirmationCode)
                setLoading(false)

                if (result === "SUCCESS") {

                  await psDialogAsync({ 
                    component: SimpleDialog, 
                    title:"SignUp Success", 
                    text:"Your signup was successful and is confirmed.", 
                    submitLabel:"Ok", 
                    rejectVal:"", 
                    alwaysResolve: true 
                  })  
 
          
                  // because userAccountVerified-useEffect above does not catch..
                  history.push(R.SIGNIN_ROUTE)
                  return true
                  //return doSuccess(result, "connSignInAsync, confirmation code flow success")

          
                } else {
                  showError("There was a problem confirming the user");
                  return doFailure("There was a problem confirming the sign up" )

                }

              }
              catch (err) {
                setLoading(false)
                // ExpiredCodeException   // err.message: Invalid code provided, please request a code again.
                if (err.code === 'CodeMismatchException') {
                  return doFailure("Confirmation code was not correct." )
                }
                
                if (err.code === 'ExpiredCodeException') {
                  const res = await psDialogAsync({ 
                    component: SimpleDialog, 
                    title:"Confirmation Code Expired", 
                    text:"Please request a new confirmation code.", 
                    submitLabel:"Request new code", 
                    cancelLabel:"Cancel", 
                    rejectVal:"", 
                    alwaysResolve: true 
                  }) 
                  if (res === "submit") {
                    console.log('request new confirmation code here..')

                    try {
                      await resendConfirmation(cognitoUser)
                      return doFailure("New confirmation code requested, check your sms or email." )
                    }
                    catch (reqErr) {
                      return doFailure("Error requesting new confirmation code:", reqErr )
                    }
    
                    //return doFailure("New confirmation code requested, check your sms or email." )
                  }                   
                }
                return doFailure( !!err.code ? err.code : "Confirmation code expired, request a new one." )
              }
              break
*/      

