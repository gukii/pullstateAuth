import React, { useState, useEffect } from "react";
import * as validator from "validator"



/** Presentation/UI */
//import { SignUpContainer } from "../../../AppStyles.styles.tw";
//import ErrorMessage from "../../components/ErrorMessage";

/** Custom Hooks */
import useErrorHandler from "../../custom-hooks/ErrorHandler";



import { authContext } from "../../contexts/AuthContext";
//import { getValuesFromSession } from '../../cognito/config'

import { useHistory, useLocation } from 'react-router-dom';  // added by chris, probably not the best place to put this..
//import { Redirect } from "react-router";
//import { getRouteStateVar } from '../routeHelpers'
//import { getValuesFromSession } from '../../cognito/config'
import { resetStoredUserAuth } from '../../cognito/localStorage'

import { getAttributeVerificationCodeAsync } from '../../cognito/verifyAttribute'


import registerAsync from '../../cognito/register'
//import { connSignUpAsync } from '../../connectedHelpers/connSignUp'
import { connNewCognitoUser } from '../../connectedHelpers/connCognitoUser'


import { R } from '../../routeNames'

import { ipLookUp } from './ipLookUp'


//
// signIn form that uses promisified cognito authenticate function
//

const SignUpForm = function() {



  const history = useHistory();    // added by chris
  const location = useLocation()

  const [ name, setName ] = React.useState("");
  const [ email, setEmail ] = React.useState("");
  const [ phone, setPhone ] = React.useState("");

  const [ formUsername, setFormUsername ] = React.useState("");
  //const [ birthdate, setBirthdate ] = React.useState("");


  const [ country, setCountry ] = React.useState();

  const [ password, setPassword ] = React.useState("");
  const [ passwordRetype, setPasswordRetype ] = React.useState("");

  const [ loading, setLoading ] = useState(false);
  const { error, showError } = useErrorHandler(null);   // setError would raise an error: setError is not a function... so i m calling it 'showError' now

  //const [firstRender, setFirstRender] = useState(false)


  useEffect( ()=> {

      const getIpData = async function() {
        //const res = await ipLookUp()
        //setCountry(res.country)
        setCountry('Taiwan')
      }()

  }, [])


  const {
    auth,
    setConfirmUserModalOpened,        // to open modal
    setConfirmAttributeModalOpened,   // to open modal

    setUsername,
    setUserId,
    setTimestamp,
    setAuthStatus,
    setUnauthStatus,
  } = React.useContext(authContext);


  // if user is signed in, sign out and clear all stored user data

  if (auth.authenticated) {
    // cognitoUser.signOu()

    //setUnauthStatus({ log:"doSignUp, a new user is getting signed up.."})
    //resetStoredUserAuth()
  }



  function validateForm({ email='', phone='', password, passwordRetype }, showError ) {

/*  // email is now optional
    // Check for invalid email
    if (!validator.isEmail(email)) {
      showError("Please enter a valid email address.");
      return false;
    }
*/
    // check if passwords match
    if (password !== passwordRetype) {
      showError("The passwords you entered don't match.");
      return false;
    }


    if (phone[0] !== "+" || phone[0] === "0" || phone[0] === "(") {
      showError("Please enter a mobile phone number, starting with + followed by country code, e.g. +88690221222");
      return false
    }

    //if (!validator.isMobilePhone(phone, 'any', regex)) {
    if (!validator.isMobilePhone(phone)) {
      showError("Please enter a valid mobile phone number, e.g. +88690221222");
      return false;
    }

    return true;
  }


  async function doSignUp({ email, name, formUsername, phone, country, password, passwordRetype} ) {

      // as standard/custom attributes as specified in:
      // https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html

      const signupAttributes = [
        { Name: 'email',          Value: email },
        { Name: 'name',           Value: name },
        //{ Name: 'username',       Value: formUsername },
        { Name: 'nickname',       Value: formUsername },
        //{ Name: 'birthdate',      Value: birthdate },
        { Name: 'phone_number',   Value: phone },
        { Name: 'custom:country', Value: country },
        //{ Name: 'custom:line_id', Value: "some line id" },

      ]


      console.log('doSignUp called with username/password/signupAttributes:', formUsername, password, signupAttributes)

      if (!validateForm({ email, phone, password, passwordRetype }, showError )) {
        console.log('error validating form:', error)
        return
      }

      try {

        setLoading(true)
        //         const result = await registerAsync({ loginId:formUsername, password, signupAttributes })
        const result = await registerAsync({ username:phone, password, signupAttributes })
        setLoading(false)


        console.log('doSignUp, sucessful sign up:', result)

        // signup call successful, but user not yet confirmed !!!
        // also no user-session at this point
        if (result && result.user) {

            console.log('doSignUp registerAsync result.user:', result.user)

            // need this username to create a cognitoUser from (userPool + username)
            setUsername(result.user.username);  // this sets username of context, not of localStorage!! need to bring these two together..

            console.log('doSignUp setUserId:', result.userSub)
            setUserId(result.userSub);
            //setTimestamp(+stringUserTimestamp);


            // could use this cognitoUser right here..
            // const cognitoUser = result.user;
          	// console.log('user name is ' + cognitoUser.getUsername());
            // e.g. to confirm userAttributes

            setConfirmUserModalOpened(true);
            // user will not be able to log in without confirmation:
            // when trying to login err.code = "UserNotConfirmedException"

            // WHERE TO TRIGGER CONFIRM ATTRIBUTE MODAL...?
        }



      }
      catch(err) {
        console.log('doSignUp err:', err)

        setLoading(false);
        showError(err.message);
/*
        UserNotFoundException // try logging in with a user that does not exist

        CodeDeliveryFailureException // This exception is thrown when a verification code fails to deliver successfully.

        InvalidPasswordException

        NotAuthorizedException  // user is not authorized

        TooManyRequestsException  // client tried too often

        UsernameExistsException // user already exists
            */

        setUnauthStatus({ log:"doSignUp error"})
        resetStoredUserAuth()

        alert(err.message || JSON.stringify(err))



        // where is that error messzge getting shown?

        //console.log('after authObj reset, authObj:', getAuthObj() )
        //code: 'PasswordResetRequiredException'
        return null
      }
      finally {
        console.log('doSignUp finally..')
      }

  }


  return (
    <div>
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        onSubmit={ (e) => {
          e.preventDefault()
          doSignUp({ email, name, formUsername, phone, country, password, passwordRetype })

          // override input to save time, for testing:

/*
          doSignUp({  email:"gukii@yahoo.com",
                      name: "gukii man",
                      formUsername: "gukii2",
                      phone:"+886952190728",
                      country: "tw",
                      password: "password",
                      passwordRetype: "password"
                    })
          */


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
            <label className="fullFomLabel" htmlFor="name">
                Full Name
            </label>
            <input
              type="text"
              name="name"
              value={name}
              id="name"
              placeholder=""
              onChange={e => setName(e.target.value)}
            />
        </div>

        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="email">
                Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              id="email"
              placeholder=""
              onChange={e => setEmail(e.target.value)}
            />
        </div>
        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="phone">
                Mobile Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={phone}
              id="phone"
              placeholder="+88690221222"
              onChange={e => setPhone(e.target.value)}
            />
        </div>


        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="country">
                Country
            </label>
            <input
              type="text"
              name="country"
              value={country}
              id="country"
              placeholder=""
              onChange={e => setCountry(e.target.value)}
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
        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="passwordRetype">
                Retype Password
            </label>
            <input
              type="password"
              name="passwordRetype"
              value={passwordRetype}
              id="passwordRetype"
              placeholder=""
              onChange={e => setPasswordRetype(e.target.value)}
            />
        </div>



        <br />


        <button type="submit" className="inline-block">
          {loading ? "Loading..." : "Sign Up"}
        </button>

        <button onClick={ ()=> { history.push(R.SIGNIN_ROUTE); } } className="inline-block">
          Sign In
        </button>

        { error && <div>Error: {error}</div>  }

        { /*error && <ErrorMessage errorMessage={error} /> */ }

      </form>
    </div>
  );
};

export default SignUpForm;

/*


// as specified in:
// https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html



 cognito schema:

    if we store user data on cognito:

    how is cognito setup, what is required / allowed to be used for SIGN IN?
    (see alia)

    email [required]          // needs to be confirmed by user, signIn alias?
    password [required]
    phone [required]          // needs to be confirmed by user, signIn alias?
    display name [required]   // is that a cognito custom attribute, or a cognito standard-attribute like cognito's "nickname" attribute, signIn alias? if so, it needs to be called a "preferred_username" in cognito speech.
    country                   // cognito custom attribute
    wechat_id                 // cognito custom attribute
    Whatsapp_id               // cognito custom attribute
    line_id                    // cognito custom attribute,  make that "_id"    as well


    or are we storing somewhere else?



if (err.code.indexOf("UsernameExistsException") > -1) {
  // username already exists.

  // deleting that user

  console.log('trying to delete a AUTHENTICATED user..') // api does not delete unauthenticated ones!!!
  //AdminDeleteUser({ Username, UserPoolId }):
  //  Deletes a user as an administrator. Works on any user.
  //  Calling this action requires developer credentials.


  const _cognitoUser = await connNewCognitoUser({ setUnauthStatus, username:formUsername, log:"for signUpFormAsync" })
  if (_cognitoUser === null) return null

  _cognitoUser.deleteUser(function(err, result) {
    if (err) {
      console.log('delete user err:', err)
      alert(err.message || JSON.stringify(err));
      return;
    }
    console.log('delete user call result: ' + result);
  });

}





        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="birthdate">
                Birthdate
            </label>
            <input
              type="birthdate"
              name="birthdate"
              value={birthdate}
              id="birthdate"
              placeholder=""
              onChange={e => setBirthdate(e.target.value)}
            />
        </div>


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

/*

import * as React from "react";
//import { Button, Form, FormGroup, Label, Input } from "reactstrap";

import { authContext } from "../../contexts/AuthContext";

import { SignUpContainer } from "../../../AppStyles.styles.tw";
import ErrorMessage from "../../components/ErrorMessage";
import SignOut from "../SignOut"

//import { USER_AUTH_KEY } from "../../utils/local-storage";


import useErrorHandler from "../../helpers/custom-hooks/ErrorHandler";

import * as authHelper from "../../helpers/auth";
import { validateForm } from "./helpers";

import { useHistory } from 'react-router-dom';



const SignUpForm = function() {

  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const [name, setName] = React.useState("");
  const [formUsername, setFormUsername] = React.useState("");
  const [birthdate, setBirthdate] = React.useState("");
  const [country, setCountry] = React.useState("");

  const [password, setPassword] = React.useState("");
  const [passwordRetype, setPasswordRetype] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { error, showError } = useErrorHandler(null);

  const {
    openConfirmationCodeModal,
    setUsername,
    setUserId,
    setTimestamp,
    auth,
  } = React.useContext(authContext);

  const history = useHistory();




  return (
    <SignUpContainer>
      <form
        onSubmit={e => {
          e.preventDefault();


          if (validateForm(email, password, passwordRetype, showError)) {

            authHelper.signUp({
              email,
              password,

              name,
              username:formUsername,
              nickname:formUsername,
              birthdate,
              country,
              auth,
              showError:showError,
              setLoading,
              setUsername,
              setUserId,
              setTimestamp,
              openConfirmationCodeModal

            });
          }
        }}
      >

        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="name">
                Name
            </label>
            <input
              type="text"
              name="name"
              value={name}
              id="name"
              placeholder=""
              onChange={e => setName(e.target.value)}
            />
        </div>
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
            <label className="fullFomLabel" htmlFor="birthdate">
                Birthdate
            </label>
            <input
              type="birthdate"
              name="birthdate"
              value={birthdate}
              id="birthdate"
              placeholder=""
              onChange={e => setBirthdate(e.target.value)}
            />
        </div>
        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="country">
                Country
            </label>
            <input
              type="text"
              name="country"
              value={country}
              id="country"
              placeholder=""
              onChange={e => setCountry(e.target.value)}
            />
        </div>
        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="email">
                Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              id="email"
              placeholder=""
              onChange={e => setEmail(e.target.value)}
            />
        </div>
        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="phone">
                Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={phone}
              id="phone"
              placeholder="+88690221222"
              onChange={e => setPhone(e.target.value)}
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
              placeholder=""
              onChange={e => setPassword(e.target.value)}
            />
        </div>
        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="passwordRetype">
                Retype Password
            </label>
            <input
              type="password"
              name="passwordRetype"
              value={passwordRetype}
              id="passwordRetype"
              placeholder=""
              onChange={e => setPasswordRetype(e.target.value)}
            />
        </div>

        <br />
        <div>
          <button type="submit" inline-block>
            {loading ? "Loading..." : "Sign Up"}
          </button>

          <button onClick={ ()=> { history.push("/sign-in"); } } inline-block>
            Sign In
          </button>

          { auth && auth.authenticated  && <SignOut/> }


        </div>

        {error && <ErrorMessage errorMessage={error} />}

      </form>
    </SignUpContainer>
  );
};

export default SignUpForm;

*/
//           { !!window.localStorage.getItem(USER_AUTH_KEY)  && <SignOut/> }
