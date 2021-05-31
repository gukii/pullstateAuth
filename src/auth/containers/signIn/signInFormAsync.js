import React, { useState, useEffect } from "react";


//
// modify this to use pullstate async + postActionHook to call authenticate.
//


// when "doSignIn" is called, the username and password are passed in by URI ???
// can t do that!!!
//
// http://localhost:3000/signin?formUsername=hansi&password=2Password%21


//import { Button, Form, FormGroup, Label, Input } from "reactstrap";


/** Presentation/UI */
//import { SignUpContainer } from "../../../AppStyles.styles.tw";
import ErrorMessage from "../../custom-hooks/errorMessage";

/** Custom Hooks */
import useErrorHandler from "../../custom-hooks/ErrorHandler";


import { useHistory, useLocation } from 'react-router-dom';  // added by chris, probably not the best place to put this..
//import { Redirect } from "react-router";
import { getRouteStateVar } from '../routeHelpers'

//import authenticateAsync from '../../cognito/authenticate'
//import { connSignInAsync } from '../../connectedHelpers/connSignIn'


import { R } from '../../routeNames'


import { getValuesFromSession } from '../../cognito/config'
import { resetStoredUserAuth } from '../../connectedHelpers/localStorage'


import { setAuthStatus, setUnauthStatus } from '../../connectedHelpers/authHelper'
//import { AuthStore } from "../../psStore/AuthStore";
//import { createAsyncAction, errorResult, successResult } from "pullstate";


import { ConfirmationCodeDialog, PsRenderDialog, psDialogAsync, psPromptAsync, InputFunction, SimplePrompt, SimpleDialog } from '../modalPortal/modalPortal'
//import { confirmSignUpAsync } from '../signUp/confirmCodeFormAsync'

//import { getRouteStateVar, getRouteOrigin } from '../auth/containers/routeHelpers'

import { routeOnSuccess, authUserAsyncFn, routeOnSuccessNoState } from './logic'


//
// signIn form that uses promisified cognito authenticate function
//
// also verifies confirmation code as last step of sign-up proccess, calling confirmCodeFormAsync.js",
//

const SignInFormAsync = function( props ) {

  const [isMounted, setIsMounted] = useState(false)
  // trying to fix memory leak complaint
  useEffect( ()=> {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [] )

  //const { history, location } = props

  const history = useHistory()    // added by chris
  const location = useLocation()

  const [ email, setEmail] = useState("");
  const [ formUsername, setFormUsername] = useState("");

  const [ password, setPassword] = useState("");
  const [ code, setCode] = useState("");

  const [ loading, setLoading] = useState(false);
  const [ confirming, setConfirming] = useState(false); // for showing input field of cognito confirmation code

  const { error, showError } = useErrorHandler(null);

  // heavy lifting is done with this hook:
  const [ started, finished, result] = authUserAsyncFn.useWatch({ username: formUsername, password, setLoading, history, showError });


  const [ accessTokenExp, setAccessTokenExp] = useState(0)
  //const [firstRender, setFirstRender] = useState(false)
  const SECS_BEFORE = (59*60) // = 59min  // should be about 10, secs before token expires to re-new token while still valid

  //const auth = AuthStore.useState(s => s.auth)



  useEffect( ()=> {
    if (started) {

      if (!finished) {
        setLoading(true)
        console.log('beckon !finished, trying to authentiacte ' + formUsername)

      } else {

        console.log('beckon result:', result)

        if (result.error) {
          //return <div>{result.message}</div>;
          console.log('!! authUserAsyncFn.useWatch error or edge-case:', result)
        }

        //await doSignIn({ username:formUsername, password })
        setLoading(false)


      }
    }

  }, [started, finished, result])


  //if (!isMounted) return <div>signInFormAsync is not mounted..</div>
  if (!isMounted) return null





  const doSignIn = async ({ username, password }) => {
    console.log('doSignIn called..', username, password)

    //const auth = await doSignIn({ username:formUsername, password })


    if (username === '' || password === '') {
      //alert('Enter a username and password!')

      // just a message saying that a username and password r required..
      // await psDialogAsync({
      await psPromptAsync({
        component: SimpleDialog,
        title:"Error",
        text:"Please enter a username and password.",
        submitLabel:"Ok",
        rejectVal:"",
        alwaysResolve: true,

        modalProps:{ screenBgImage:"https://cdn.windowsreport.com/wp-content/uploads/2019/04/PC-error-1962-in-Lenovo-930x620.jpg" },
        //https://cms.enginemailer.com/WebLITE/Applications/blog/uploaded/pics/Blog/2020/May/20200518/email_error_550/email_error_02.jpg
      })

      // shows a red error message below the login button
      showError("Please enter a username and password")
      return
      //return doFailure({ showError, log:"Please enter a username and password" })
    }


    //window.alert('dodoSignIn called..'+ formUsername + ' ' + password)
    const result = await authUserAsyncFn.run( { username, password, setLoading, history, showError } )
    //const result = await authUserAsyncFn.run({ tag }, options);

    if (result.error) {
      console.log('!! authUserAsyncFn.run edge case or error:', result.error)
      //showError('Edge case Auth or error..')  // error should also be shown within authUserAsyncFn..
    }

    if (!result.payload) {
      console.log('!! authUserAsyncFn.run didnt return a payload, returning early..', result)
      return
    }

    console.log('location, history in async doSignIn, before routeOnSuccess call:', location, history)

    routeOnSuccess({ result, username, pushFn:history.push, location, showError })
    //routeOnSuccessNoState({ result, username, history, showError })

  }


  const showConfirmDialog = true

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
                Username:&nbsp;
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
                Password:&nbsp;
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

        { confirming &&

            <div className="fullFormDiv" style={{ marginBottom:"1em" }}>
                <label className="fullFomLabel" htmlFor="code">
                    Confirmation code:&nbsp;
                </label>
                <input
                  type="password"
                  name="code"
                  value={code}
                  id="code"
                  onChange={e => setCode(e.target.value)}
                />
            </div>

        }

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>

            <button type="submit" style={{ display:"flex", alignItems: "center" }}>
              { loading && <div className="loader-supermini" style={{ display:"inline-block", marginRight:".5em" }}/> }
              { loading ? "Loading..." : "Sign In" }
            </button>

            <button onClick={ ()=> { history.push(R.SIGNUP_ROUTE); } }  style={{ display:"inline-block", marginLeft:"1em" }} >
              Sign Up
            </button>

        </div>
        <div  style={{ display:"block" }}>
          { error && <ErrorMessage errorMessage={error} />  }
        </div>

      </form>
    </div>
  ); // render return

};

export default SignInFormAsync;



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
                return doFailure({ showError, log:"Confirmation code not entered" )
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
                  //return doSuccess({ result, "connSignInAsync, confirmation code flow success")


                } else {
                  showError("There was a problem confirming the user");
                  return doFailure({ showError, log:"There was a problem confirming the sign up" )

                }

              }
              catch (err) {
                setLoading(false)
                // ExpiredCodeException   // err.message: Invalid code provided, please request a code again.
                if (err.code === 'CodeMismatchException') {
                  return doFailure({ showError, log:"Confirmation code was not correct." )
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
                      return doFailure({ showError, log:"New confirmation code requested, check your sms or email." )
                    }
                    catch (reqErr) {
                      return doFailure({ showError, log:"Error requesting new confirmation code:", reqErr )
                    }

                    //return doFailure({ showError, log:"New confirmation code requested, check your sms or email." )
                  }
                }
                return doFailure({ showError, log: !!err.code ? err.code : "Confirmation code expired, request a new one." )
              }
              break
*/
