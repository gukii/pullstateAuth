import React, { useState, useEffect } from "react";
import * as validator from "validator"



//import { SignUpContainer } from "../../../AppStyles.styles.tw";
import ErrorMessage from "../../custom-hooks/errorMessage";


import useErrorHandler from "../../custom-hooks/ErrorHandler";



//import { getValuesFromSession } from '../../cognito/config'

import { useHistory, useLocation } from 'react-router-dom';  // added by chris, probably not the best place to put this..
//import { Redirect } from "react-router";
//import { getRouteStateVar } from '../routeHelpers'
//import { getValuesFromSession } from '../../cognito/config'
import { resetStoredUserAuth } from '../../connectedHelpers/localStorage'



import registerAsync from '../../cognito/register'
//import { connSignUpAsync } from '../../connectedHelpers/connSignUp'


import { R } from '../../routeNames'

import { ipLookUp } from './ipLookUp'



import { getValuesFromSession } from '../../cognito/config'



import { setAuthStatus, setUnauthStatus } from '../../connectedHelpers/authHelper'
import { AuthStore } from "../../psStore/AuthStore";

import { ConfirmationCodeDialog, PsRenderDialog, psDialogAsync, InputFunction, SimplePrompt, SimpleDialog } from '../modalPortal/modalPortal'
import { confirmSignUpAsync } from '../signUp/confirmCodeFormAsync'



import { routeOnSuccess, registerUserAsyncFn } from './logic'


//
// signIn form that uses promisified cognito authenticate function
//

const SignUpForm = function() {


  //const auth = AuthStore.useState(s => s.auth)


  const history = useHistory();    // added by chris
  const location = useLocation()

  const [ name, setName ] = React.useState("");
  const [ email, setEmail ] = React.useState("");
  const [ phone, setPhone ] = React.useState("");
  const [ displayname, setDisplayname ] = React.useState("");

  const [ formUsername, setFormUsername ] = React.useState("");
  //const [ birthdate, setBirthdate ] = React.useState("");


  const [ country, setCountry ] = React.useState();

  const [ password, setPassword ] = React.useState("");
  const [ passwordRetype, setPasswordRetype ] = React.useState("");

  const [ loading, setLoading ] = useState(false);
  const { error, showError } = useErrorHandler(null);   // setError would raise an error: setError is not a function... so i m calling it 'showError' now

  //const [firstRender, setFirstRender] = useState(false)

  // heavy lifting is done with this hook:
  const [ started, finished, result] = registerUserAsyncFn.useWatch({ username: formUsername, password, signupAttributes, setLoading, history, showError });



  useEffect( ()=> {

      const getIpData = async function() {
        //const res = await ipLookUp()
        //setCountry(res.country)
        setCountry('Taiwan')
      }()

  }, [])



  useEffect( ()=> {
      if (started) {

        if (!finished) {
          setLoading(true)
          console.log('beckon !finished, trying to register ' + formUsername)

        } else {

          console.log('beckon result:', result)

          if (result.error) {
            //return <div>{result.message}</div>;
            console.log('!! registerUserAsyncFn.useWatch error or edge-case:', result)
          }

          //await doSignIn({ username:formUsername, password })
          setLoading(false)


        }
      }

  }, [started, finished, result])



  // if user is signed in, sign out and clear all stored user data
/*
  if (auth.authenticated) {
    // cognitoUser.signOu()

    //setUnauthStatus({ log:"doSignUp, a new user is getting signed up.."})
    //resetStoredUserAuth()
  }
*/


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


    // triggers all pullstate related functions on successful login or login flow action (e.g. password reset, confirmation code entered, mfa ..)
    // sess = cognitoUser obj returned by cognito sign-in api call

/*

    function doSuccess(sess, log='') {
      console.log(log)

      const newAuthObj = { ...getValuesFromSession(sess), username:formUsername, authenticated:true }  // just checks correctness and extracts values from session variable
      setAuthStatus(newAuthObj) // this also stores to localStorage

      // could also set s.authenticated = true
      //AuthStore.update([ s => s.username = formUsername, s => s.userId = sess.idToken.payload.sub ])

      console.log('setUserId:', sess.idToken.payload.sub)
      return newAuthObj
    }



    // triggers all pullstate related functions on failure
    function doFailure(log='') {
      console.log(log)
      setUnauthStatus({ log:"signUpFormAsync error. "+log })
      showError(log)
      resetStoredUserAuth()
      return null
    }
*/

      // as standard/custom attributes as specified in:
      // https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-settings-attributes.html
/*
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
*/

/*
      const signupAttributes = [
        //{ Name: 'email',          Value: email },
        //{ Name: 'custom:email',          Value: email },

        //{ Name: 'custom:displayname',           Value: displayname },
        //{ Name: 'username',       Value: formUsername },
        //{ Name: 'name',       Value: name },
        //{ Name: 'birthdate',      Value: birthdate },
        { Name: 'phone_number',   Value: phone },
        //{ Name: 'custom:country', Value: country },
        //{ Name: 'custom:line_id', Value: "some line id" },

      ]
*/
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


      console.log('doSignUp called with username/password/signupAttributes:', formUsername, password, signupAttributes)

      if (!validateForm({ email, phone, password, passwordRetype }, showError )) {
        console.log('error validating form:', error)
        return
      }

      try {

        setLoading(true)
        //         const result = await registerAsync({ loginId:formUsername, password, signupAttributes })
        // const result = await registerAsync({ username:formUsername, password, signupAttributes })

        // calls cognito/register.js
        const result = await registerAsync({ username:formUsername, password, signupAttributes })
        setLoading(false)


        console.log('doSignUp, sucessful sign up:', result)

        // EMAIL sent to "s***@m***.com"
        await psDialogAsync({
          component: SimpleDialog,
          title:"Confirmation code sent",
          text: `${result.codeDeliveryDetails.DeliveryMedium} sent to ${result.codeDeliveryDetails.Destination}`,
          submitLabel:"Ok",
          rejectVal:"",
          alwaysResolve: true
        })


        // signup call successful, but user not yet confirmed !!!
        // also no user-session at this point
        if (result && result.user) {

            console.log('doSignUp registerAsync result.user:', result.user)

            // need this username to create a cognitoUser from (userPool + username)
            // could also write this into auth.username
            //setUsername(result.user.username);  // this sets username of context, not of localStorage!! need to bring these two together..
            const resUsername = result.user.username
            const resUserId = result.userSub

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
            const confirmed = await confirmSignUpAsync({ cognitoUser: result, username: resUsername, setLoading: setLoading, showError: showError })
            console.log('confirmed:', confirmed)

            if (confirmed) {
              history.push(R.SIGNIN_ROUTE)
              return true
            }
            return null
            //doSuccess()


        }



      }
      catch(e) {
        console.log('doSignUp err:', e)

        setLoading(false)

        switch (e.code) {

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

          case 'UsernameExistsException':
                  await psDialogAsync({
                    component: SimpleDialog,
                    title:"Username already exists",
                    text:"Choose a different username",
                    submitLabel:"Ok",
                    rejectVal:"",
                    alwaysResolve: true
                  })
                  return doFailure("Username already exists." )

          default:
                  if (JSON.stringify(e) !== '{}') {
                    await psDialogAsync({
                        component: SimpleDialog,
                        title:"SignUp Error",
                        text: JSON.stringify(e),
                        submitLabel:"Ok",
                        rejectVal:"",
                        alwaysResolve: true
                    })
                    return doFailure("SignUp Error:", JSON.stringify(e) )
                  }

                  // trying to fix a {} error that keeps showing up..
                  return null
                  //return doFailure( JSON.stringify(e) )
        }

      }
      finally {
        console.log('doSignUp finally..')
      }

  }


  return (
    <div>

      { loading && <div className="loader centered"/> }

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
            <label className="fullFomLabel" htmlFor="displayname">
                DisplayName
            </label>
            <input
              type="text"
              name="displayname"
              value={displayname}
              id="displayname"
              placeholder=""
              onChange={e => setDisplayname(e.target.value)}
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

        { /* error && <div>Error: {error}</div> */  }

        { error && <ErrorMessage errorMessage={error} />  }

      </form>
    </div>
  );
};

export default SignUpForm;




/*
        UserNotFoundException // try logging in with a user that does not exist

        CodeDeliveryFailureException // This exception is thrown when a verification code fails to deliver successfully.

        InvalidPasswordException

        InvalidParameterException: // e.g. password not filled out as required (was left empty)

        NotAuthorizedException  // user is not authorized

        TooManyRequestsException  // client tried too often

        UsernameExistsException // user already exists





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


    default:
          if (!!e.message && !!e.code) {
            await psDialogAsync({
              component: SimpleDialog,
              title:"SignUp Error",
              text:`${e.message} (${e.code})`,
              submitLabel:"Ok",
              rejectVal:"",
              alwaysResolve: true
            })
            return doFailure('SignUp Error:' + !!e.message && !!e.code ? `${e.message} (${e.code})` : JSON.stringify(e))
          }




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
