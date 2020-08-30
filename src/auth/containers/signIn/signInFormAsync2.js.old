import React, { useState, useEffect } from "react";


//import { Button, Form, FormGroup, Label, Input } from "reactstrap";

/** Context consumer */
//import { authContext } from "../../contexts/AuthContext";

/** Presentation/UI */
//import { SignUpContainer } from "../../../AppStyles.styles.tw";
//import ErrorMessage from "../../components/ErrorMessage";

/** Custom Hooks */
import useErrorHandler from "../../custom-hooks/ErrorHandler";

/** Utils */
//import * as auth from "../../helpers/auth";
//import { validateForm } from "./helpers";


import { authContext } from "../../contexts/AuthContext";
//import { getValuesFromSession } from '../../cognito/config'

import { useHistory, useLocation, history } from 'react-router-dom';  // added by chris, probably not the best place to put this..
import { Redirect } from "react-router";
import { pushWithProperOrigin, getRouteOrigin, getRouteStateVar } from '../routeHelpers'

import authenticateAsync from '../../cognito/authenticate'
//import { connSignInAsync } from '../../connectedHelpers/connSignIn'


import { R } from '../../routeNames'


import { getValuesFromSession } from '../../cognito/config'
import { resetStoredUserAuth } from '../../cognito/localStorage'

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


  const {
    auth,
    openConfirmationCodeModal,
    setUsername,
    setUserId,
    setTimestamp,
    setAuthStatus,
    setUnauthStatus,
  } = React.useContext(authContext);


  if (auth.authenticated) {

    const routeOrigin = getRouteStateVar({ location, fieldName: 'from' })

    console.log('routeOrigin:', routeOrigin)
    const pushRoute = routeOrigin !== '' && routeOrigin.indexOf(R.SIGNIN_ROUTE) === -1 && routeOrigin.indexOf(R.SIGNUP_ROUTE) === -1 && routeOrigin !== R.PUBLIC_HOME_ROUTE
      ? routeOrigin
      : R.AUTH_ROUTE

    return <Redirect to={pushRoute} />;
  }


  async function doSignIn({ username='', password='', setAuthStatus, setUnauthStatus, setUsername, setUserId, setSession }) {

    // called by the "SignInForm" function below

      console.log('connSignInAsync doSignIn called with username/password:', username, password)

      if (username==='' || password === '') {
        alert('Enter a username and password!')
        return null
      }

      // confirmation code for gukii@yahoo.com 019785

      try {
        const sess = await authenticateAsync({ username, password })
        console.log('connSignInAsync, sucessful sign in:', sess)

        const newAuthObj = { ...getValuesFromSession(sess), username }  // just checks correctness and extracts values from session variable

        //setSession(sess)
        //setCognitoUser(sess)

        // has to be first in list, otherwise authContext token check will throw an error (token expired (the old localstorage tokens..))
        setAuthStatus(newAuthObj) // this also stores to localStorage
        setUsername(username)               // good to have for creating userpools

        // every "set" function prompts a rerender..

        console.log('setUserId:', sess.idToken.payload.sub)
        setUserId(sess.idToken.payload.sub) // also present within "auth"

        // should i store "username" these to localStorage?

        return newAuthObj

      }
      catch(e) {
        console.log('!!! connSignInAsync err:', e)
        alert(!!e.message && !!e.code ? `${e.message} (${e.code})` : JSON.stringify(e))

        setUnauthStatus({ log:"connSignInAsync error"})
        resetStoredUserAuth()
        // where is that error messzge getting shown?

        //console.log('after authObj reset, authObj:', getAuthObj() )
        //code: 'PasswordResetRequiredException'
        return null
      }
      finally {
        console.log('connSignInAsync doSignIn finally..')
      }

  } // dosSignIn Function




  return (
    <div>

      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        onSubmit={ async e => {
          e.preventDefault();
          console.log('onSubmit called..', e)

          const auth = await doSignIn({ username:formUsername, password, setAuthStatus, setUnauthStatus, setUsername, setUserId })

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

        { /*error && <ErrorMessage errorMessage={error} /> */ }

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

*/
