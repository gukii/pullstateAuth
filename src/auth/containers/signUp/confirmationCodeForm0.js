import * as React from "react";
import { authContext } from "../../contexts/AuthContext";


import ErrorMessage from "../../errorMessage";

import useErrorHandler from "../../custom-hooks/ErrorHandler";

//import * as authHelper from "../../helpers/auth";
import { confirmCognitoUserAsync } from '../../cognito/confirmation'
//import { confirmationCodeForm } from "./confirmationCodeForm"

import { connNewCognitoUser } from '../../connectedHelpers/connCognitoUser'

import { Redirect } from "react-router";

import { R } from '../../routeNames'




const ConfirmationCodeForm = function() {

  const [ loading, setLoading ] = React.useState(false);
  const [ confirmationCode, setConfirmationCode ] = React.useState("");
  const { error, showError } = useErrorHandler(null);

  const {
    username,
    //userId,
    //userTimestamp,

    userAccountVerified,
    attributeVerified,

    setUserAccountVerified,
    setUnauthStatus,

    //confirmUserModalOpened,      // boolean
    setConfirmUserModalOpened,  // sets confirmationCodeModal to true/false

    //confirmAttributeModalOpened,
    setConfirmAttributeModalOpened,


  } = React.useContext(authContext);


  // auto forward user to sign-in page - this is not working.. because function already returned message: Your account has been verified.
/*
  // forward user to next dialog (attribute verification)
  React.useEffect( ()=> {

    if (userAccountVerified && !attributeVerified) {
      setConfirmUserModalOpened(false)
      setConfirmAttributeModalOpened(true)
    }

    if (userAccountVerified && attributeVerified) {
      setTimeout( () => {  return <Redirect to="/sign-in" /> }, 3000);
    }

    if (userAccountVerified) {
      setTimeout( () => {  return <Redirect to="/sign-in" /> }, 3000);
    }

  }, [userAccountVerified, attributeVerified])
*/

  // forward user to login (if only signup needs verification (no additional attribute verification))
  React.useEffect( ()=> {

    if (userAccountVerified) {
      // could try to verify an optional email address from here, if one was specified..

      setTimeout( () => {  return <Redirect to={R.SIGNIN_ROUTE} /> }, 3000);
    }

  }, [userAccountVerified])

  ////

  async function confirmSignUpAsync({ username=null, code=null, setUnauthStatus, log='' }) {

    if (log.length > 0) console.log(`confirmSignUpAsync, log: ${log}, username: ${username}, code: ${code}`)

    if (username === null) {
      console.log('ERROR ConfirmationCodeForm, context username is null, returning early..')
      return null
    }

    const cognitoUser = await connNewCognitoUser({ setUnauthStatus, username, log:"for connConfirmSignUpAsync" })
    if (cognitoUser === null) {
      console.log('ERROR ConfirmationCodeForm, cognitoUser is null, returning early..')
      return null
    }

    console.log('ConfirmationCodeForm re-created cognitoUser:', cognitoUser)


    try {

      setLoading(true)
      const result = await confirmCognitoUserAsync(cognitoUser, code)

      if (result === "SUCCESS") {
        setLoading(false);
        setUserAccountVerified(true);
      } else {
        setLoading(false);
        showError("There was a problem confirming the user");
      }
      return result

    }
    catch (err) {
      setLoading(false)
      showError(err.message);
      return null
    }

  }

  ////////////

  const displayFormOrMessage = function(
    userAccountVerified
  ) {

    if (userAccountVerified) {
      return <div>Your account has been verified.</div>;
    }

    return (
      <form
        onSubmit={ async e => {
          e.preventDefault();

          if (confirmationCode) {
            const result = await confirmSignUpAsync({ username, code:confirmationCode, setUnauthStatus, log:"from signUp/confirmationCodeForm.js" })
            if (result === null) console.log('Error: confirmSignUpAsync returned null')
          } else {
            showError("Cannot have an empty field.");
          }
        }}
      >
        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="confirmationCode">
              Enter Confirmation Code
            </label>
            <input
              type="text"
              name="confirmationCode"
              value={confirmationCode}
              id="confirmationCode"
              placeholder=""
              onChange={e => setConfirmationCode(e.target.value)}
            />
        </div>

          <button type="submit" block={true} className="comfirmationCodeButton">
            {loading ? "Loading..." : "Confirm"}
          </button>

        { /*error && <div>{error}</div>*/ }
        { error && <ErrorMessage errorMessage={error} /> }
      </form>
    );
  };

  ////////////

  return (
      displayFormOrMessage(userAccountVerified)
  );
};

export default ConfirmationCodeForm;
