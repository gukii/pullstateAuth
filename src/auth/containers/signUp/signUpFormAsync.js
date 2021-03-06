import React, { useState, useEffect } from "react";
import * as validator from "validator"



//import { SignUpContainer } from "../../../AppStyles.styles.tw";
import ErrorMessage from "../../custom-hooks/errorMessage";


import useErrorHandler from "../../custom-hooks/ErrorHandler";



//import { getValuesFromSession } from '../../cognito/config'

//import { useHistory, useLocation } from 'react-router-dom';  // added by chris, probably not the best place to put this..
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



import { registerUserAsyncFn } from './logic' // validateForm moved from "logic.js" to this file..


import SignOut from '../../containers/signOut'




//
// signIn form that uses promisified cognito authenticate function
//
// confirmation code verification flow happens during sign-in flow, calling "confirmCodeFormAsync.js"
//

const SignUpForm = (props) => {

  const { history, location } = props
  const [isMounted, setIsMounted] = useState(false)
  // trying to fix memory leak complaint
  useEffect( ()=> {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [] )

  const { authOk, username } = AuthStore.useState(s => ({
    authOk:   s.auth.authenticated || false,
    username: s.auth.username || null
  }) )

  const currentLocation = location.pathname

  // the fields of "Name", "Value" are stated in AWS way for signupAttributes
  // "nonAttribute" refers to fields that should not be part of signUpAttributes
  // username and password are submitted outside signUpAttributes by the api call, hence they r also marked as nonAttributes
  // "msg" are field specific error messages set during form validation
  // "ok" is a flag that form validation ok = true
  // initial values of msg/ok: msg:null, ok:true
  //
  // the hash id is just for internal use within the form and validate function, could be named anything as long as its consistent during usage
  //
  const inDataInitial = {
    "username":       { Label:"Username",         Name:"username",            Value:"",   nonAttribute:true,    msg:null, ok:true },
    "password":       { Label:"Password",         Name:"password",            Value:"",   nonAttribute:true,    msg:null, ok:true },
    "passwordRetype": { Label:"Retype Password",  Name:"passwordRetype",      Value:"",   nonAttribute:true,    msg:null, ok:true },

    // these are all AWS signupAttributes:
    "name":           { Label:"Full Name",        Name:"name",                Value:"",   msg:null, ok:true },
    "email":          { Label:"Email",            Name:"email",               Value:"",   msg:null, ok:true },
    "phone_number":   { Label:"Phone",            Name:"phone_number",        Value:"",   msg:null, ok:true },
    "displayName":    { Label:"DisplayName",      Name:"custom:displayname",  Value:"",   msg:null, ok:true },
    "country":        { Label:"Country",          Name:"custom:country",      Value:"",   msg:null, ok:true },
  }
  const [inData, setInData] = useState( inDataInitial )


  const [ loading, setLoading ] = useState(false);
  const { error, showError } = useErrorHandler(null);   // setError would raise an error: setError is not a function... so i m calling it 'showError' now



  // sets the form state Value of one field, identified by its Name (e.g. "custom:country")
  function setFieldData( key, newVal, msg=null, ok=null ) {
    //const idx = inData.findIndex( (item) => item.Name === Name )
    //const updated = { ...inData[key], Value: newVal }
    //const newData = { ...inData, [key]: updated }
    setInData( prevState => ({ ...prevState, [key]: { ...prevState[key],
                                                      Value: newVal,
                                                      ok: ok !== null ? ok : prevState[key].ok,
                                                      msg: msg !== null ? msg : prevState[key].msg
                                                    } }) )
  }


  // resets inData's ok and msg fields to initial values.
  function resetFormMsgs() {

    const newObj = Object.keys( inData ).reduce( function( obj, key ) {
      obj[ key ] = { ...inData[ key ], ok: true, msg: null }
      return obj
    }, {} )

    setInData( newObj )
  }

  // gets the form state Value of one field, identified by its Name (e.g. "custom:country")
  function getField( key ) {
    //return inData.filter( (item) => item.Name === Name )
    return inData[ key ]
  }


  //export function validateForm({ email='', phone='', username, password, passwordRetype }, showError ) {
  function validateForm( inData, showError ) {

      resetFormMsgs()

      const signUpAttributes = Object.values(inData).filter( item => !!!item.nonAttribute )
  /*  // email is now optional
      // Check for invalid email
      if (!validator.isEmail(email)) {
        showError("Please enter a valid email address.");
        return false;
      }
  */
      const username = inData["username"].Value
      const password = inData["password"].Value
      const passwordRetype = inData["passwordRetype"].Value
      const phone = inData["phone_number"].Value
      const email = inData["email"].Value




      console.log('validating inData:', inData)

      let errorFlag = true

      if (username === '') {
      //alert('Enter a username and password!')

        // shows a red error message below the login button
        setFieldData( 'username', inData['username'].Value, "Please enter a username.", false )
        //showError("Please enter a username")

        //showError("Please enter a username and password")
        errorFlag = false
      }

      if (password === '') {
        setFieldData( 'password', inData['password'].Value, "Please enter a password.", false )
        //showError("Please enter a password")
        errorFlag = false

      }

      if (passwordRetype === '') {
        setFieldData( 'passwordRetype', inData['passwordRetype'].Value, "Please repeat the password.", false )
        //showError("Please repeat the password")
        errorFlag = false
      }

      // check if passwords match
      if (password !== '' && passwordRetype !== '' && password !== passwordRetype) {
        setFieldData( 'passwordRetype', inData['passwordRetype'].Value, "The passwords you entered don't match.", false )
        //showError("The passwords you entered don't match.");
        errorFlag = false
      }


      if (email === "") {
        setFieldData( 'email', inData['email'].Value, "Please enter an email address.", false )

        //showError("Please enter a mobile phone number, starting with + followed by country code, e.g. +88690221222");
        errorFlag = false
      }

      if (!validator.isEmail(email) ) {
        setFieldData( 'email', inData['email'].Value, "Please enter a valid email address.", false )

        //showError("Please enter a valid mobile phone number, e.g. +88690221222");
        errorFlag = false
      }



      if (phone === "") {
        setFieldData( 'phone_number', inData['phone_number'].Value, "Please enter phone number (e.g. +88690221222).", false )

        //showError("Please enter a mobile phone number, starting with + followed by country code, e.g. +88690221222");
        errorFlag = false
      }

      if (phone !== "" && phone[0] !== "+" && phone[0] !== "0" && phone[0] !== "(") {
        setFieldData( 'phone_number', inData['phone_number'].Value, <span>Please enter a phone number in this format: <span style={{ fontWeight: "bold"}}>+886</span>90221222</span>, false )

        //showError("Please enter a mobile phone number, starting with + followed by country code, e.g. +88690221222");
        errorFlag = false
        return errorFlag
      }

      //if (!validator.isMobilePhone(phone, 'any', regex)) {
      if (!validator.isMobilePhone(phone)) {
        setFieldData( 'phone_number', inData['phone_number'].Value, "Please enter phone number (e.g. +88690221222).", false )

        //showError("Please enter a valid mobile phone number, e.g. +88690221222");
        errorFlag = false
      }

      return errorFlag;
  }



  //const [firstRender, setFirstRender] = useState(false)


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

  // heavy lifting is done with this hook:
  const [ started, finished, result] = registerUserAsyncFn.useWatch({

      //username: formUsername,     // commenting these out is probably not the correct way.. but might work.
      //password,
      //signupAttributes,

      setLoading,
      history,
      showError });



  useEffect( ()=> {

      const getIpData = async function() {
        //const res = await ipLookUp()
        //setCountry(res.country)
        setFieldData('country', 'Taiwan' )
      }()

  }, [])



  useEffect( ()=> {
      if (started) {

        if (!finished) {
          setLoading(true)
          console.log('beckon !finished, trying to register ' + getField("username") )

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



  // these parameters r wrong..
  async function doSignUp( inData ) {

    console.log('doSignUp called with inData:', inData)

    // triggers all pullstate related functions on successful registration or register-related action (e.g. username not available, no password, ... mfa ..)
    // sess = cognitoUser obj returned by cognito sign-in api call

      const username = getField("username").Value
      const password = getField("password").Value

      // exclude the entries marked ".nonAttribute"
      const signupAttributes = Object.values(inData).filter( item => !!!item.nonAttribute ).map( i => { return { Name:i.Name, Value:i.Value } } )



      console.log('doSignUp called with username/password/signupAttributes:', username, password, signupAttributes)

      if (!validateForm( inData, showError )) {
        console.log('error validating form:', error)
        return
      }

      // for testing..
      return

      //window.alert('dodoSignIn called..'+ formUsername + ' ' + password)
      const result = await registerUserAsyncFn.run( {
          username,
          password,
          signupAttributes,

          setLoading,
          history,
          showError });
      // from the docs: const result = await authUserAsyncFn.run({ tag }, options);

      if (result.error) {
        console.log('!! registerUserAsyncFn.run edge case or error:', result.error)
        //showError('Edge case Auth or error..')  // error should also be shown within registerUserAsyncFn..
      }

      if (!result.payload) {
        console.log('!! registerUserAsyncFn.run didnt return a payload, returning early..', result)
        return
      }

      // user gets routed to signIn page on success by registerUserAsyncFn

  }


  if (!isMounted) return null


  if (authOk) return <><p>Please sign out first.</p><SignOut pushTo={R.SIGNUP_ROUTE} /></>
            //? [ authOk, <SignOut />, username ]
            //: [ authOk, <Redirect to={{ pathname: R.SIGNIN_ROUTE, state:{ from:currentLocation } }} />, username ]

  function renderErrorMsg(id) {
    //return !!!getField(id).ok && !!getField(id).msg && <ErrorMessage errorMessage={ getField(id).msg } />
    return !!!getField(id).ok && !!getField(id).msg && <div style={{ color:"red", marginBottom:"0.4em" }}>{ getField(id).msg }</div>

  }


  return (
    <div>

      { loading && <div className="loader centered"/> }

      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        onSubmit={ (e) => {
          e.preventDefault()
          doSignUp( inData )

          // override input to save time, for testing:

/*
          doSignUp({  email:"gukii@yahoo.com",
                      name: "gukii man",
                      username: "gukii2",
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
                { getField("username").Label }:&nbsp;
            </label>
            <input
              style={{ backgroundColor: !!!getField('username').ok ? "yellow" : "white" }}
              type="text"
              name="formUsername"
              value={ getField("username").Value }
              id="formUsername"
              placeholder=""
              onChange={e => setFieldData( "username", e.target.value ) }
            />
        </div>
        { renderErrorMsg('username') }


        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="displayname">
                { getField("displayName").Label }:&nbsp;
            </label>
            <input
              style={{ backgroundColor: !!!getField('displayName').ok ? "yellow" : "white" }}
              type="text"
              name="displayname"
              value={ getField("displayName").Value }
              id="displayname"
              placeholder=""
              onChange={e => setFieldData( "displayName", e.target.value ) }
            />
        </div>
        { renderErrorMsg('displayName') }


        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="name">
                { getField("name").Label }:&nbsp;
            </label>
            <input
              style={{ backgroundColor: !!!getField('name').ok ? "yellow" : "white" }}
              type="text"
              name="name"
              value={ getField("name").Value }
              id="name"
              placeholder=""
              onChange={e => setFieldData( "name", e.target.value ) }
            />
        </div>
        { renderErrorMsg('name') }


        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="email">
                { getField("email").Label }:&nbsp;
            </label>
            <input
              style={{ backgroundColor: !!!getField('email').ok ? "yellow" : "white" }}
              type="email"
              name="email"
              value={ getField("email").Value }
              id="email"
              placeholder=""
              onChange={e => setFieldData( "email", e.target.value ) }
            />
        </div>
        { renderErrorMsg('email') }

        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="phone">
                { getField("phone_number").Label }:&nbsp;
            </label>
            <input
              style={{ backgroundColor: !!!getField('phone_number').ok ? "yellow" : "white" }}
              type="tel"
              name="phone"
              value={ getField("phone_number").Value }
              id="phone"
              placeholder="+88690221222"
              onChange={e => setFieldData( "phone_number", e.target.value ) }
            />
        </div>
        { renderErrorMsg('phone_number') }



        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="country">
                { getField("country").Label }:&nbsp;
            </label>
            <input
              style={{ backgroundColor: !!!getField('country').ok ? "yellow" : "white" }}
              type="text"
              name="country"
              value={ getField("country").Value }
              id="country"
              placeholder=""
              onChange={e => setFieldData( "country", e.target.value ) }
            />
        </div>
        { renderErrorMsg('country') }

        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="password">
                { getField("password").Label }:&nbsp;
            </label>
            <input
              style={{ backgroundColor: !!!getField('password').ok ? "yellow" : "white" }}
              type="password"
              name="password"
              value={ getField("password").Value }
              id="password"
              onChange={e => setFieldData( "password", e.target.value ) }
            />
        </div>
        { renderErrorMsg('password') }

        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="passwordRetype">
                { getField("passwordRetype").Label }:&nbsp;
            </label>
            <input
              style={{ backgroundColor: !!!getField('passwordRetype').ok ? "yellow" : "white" }}
              type="password"
              name="passwordRetype"
              value={ getField("passwordRetype").Value }
              id="passwordRetype"
              placeholder=""
              onChange={e => setFieldData( "passwordRetype", e.target.value ) }
            />
        </div>
        { renderErrorMsg('passwordRetype') }




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
const { name } = e.target;
this.setState(
  prevState => ({
    [name]: !prevState[name]
  }),
  () => console.log(`this.state`, this.state)
);
*/

/*
        UserNotFoundException // try logging in with a user that does not exist

        CodeDeliveryFailureException // This exception is thrown when a verification code fails to deliver successfully.

        InvalidPasswordException

        InvalidParameterException: // e.g. password not filled out as required (was left empty)

        NotAuthorizedException  // user is not authorized

        TooManyRequestsException  // client tried too often

        UsernameExistsException // user already exists


        'ExpiredCodeException':

        'CodeMismatchException' // This exception is thrown if the provided code does not match what the server was expecting


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
