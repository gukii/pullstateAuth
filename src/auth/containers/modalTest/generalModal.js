import * as React from "react";


import ErrorMessage from "../../errorMessage";
import useErrorHandler from "../../custom-hooks/ErrorHandler";

import { Redirect } from "react-router";

import { R } from '../../routeNames'
import { useHistory } from 'react-router-dom'


// WORK IN PROGRESS. TRYING TO MAKE A GENERAL MODAL DIALOG TO GET ONE INPUT FIELD AND EXECUTE A CALLBACK WHEN SUBMIT IS PRESSED


const inputForm = function(props) {

  const [ loading, setLoading ] = React.useState(false);
  const [ input, setInput ] = React.useState("");
  const { error, showError } = useErrorHandler(null);

  const history = useHistory()

  //callbackFn({ ...props, input:input, log:"from signUp/generalModal.js", showError=showError })

  const { progressNextOk=false,     // modal input was used successfully boolean,
          progressNextRoute="/",  // route to progress to next
          inputLabel="Enter Confirmation Code", // e.g.: Enter Confirmation Code
          inputEmptyLabel ="Cannot have an empty field!",  // when confirmation code entered is empty use this label/msg
          submitButtonLoadingLabel="Loading..",
          submitButtonLabel = "Confirm",
          successLabel="Your account has been verified.",
          callbackFn=()=>null,         // callback function to be triggered when pressing Ok
        } = props


  // forward user to login (if only signup needs verification (no additional attribute verification))
  React.useEffect( ()=> {

    if (progressNextOk) {
      // in case of registration:
      setTimeout( () => {  return <Redirect to={progressNextRoute} /> }, 3000);
    }

  }, [progressNextOk, progressNextRoute])

  ////
/*
  async function confirmSignUpAsync({ username=null, code=null, setUnauthStatus, log='' }) {

    if (log.length > 0) console.log(`confirmSignUpAsync, log: ${log}, username: ${username}, code: ${code}`)

    if (username === null) {
      console.log('ERROR inputForm, context username is null, returning early..')
      return null
    }

    const cognitoUser = await connNewCognitoUser({ setUnauthStatus, username, log:"for connConfirmSignUpAsync" })
    if (cognitoUser === null) {
      console.log('ERROR inputForm, cognitoUser is null, returning early..')
      return null
    }

    console.log('inputForm re-created cognitoUser:', cognitoUser)


    try {

      setLoading(true)
      const result = await confirmCognitoUserAsync(cognitoUser, code)

      if (result === "SUCCESS") {
        setLoading(false);
        setUserAccountVerified(true);

        alert("Sign-up successful");


        // because userAccountVerified-useEffect above does not catch..
        history.push(R.SIGNIN_ROUTE)

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
*/
  ////////////

  const displayFormOrMessage = function() {

    // in case the users confirmation code was confirmed already..
    if (progressNextOk) {
      return <div>{successLabel}</div>;
    }

    return (
      <form
        onSubmit={ async e => {
          e.preventDefault();

          if (input) {
            setLoading(true)
            const result = await callbackFn({ ...props, input:input, log:"from signUp/generalModal.js", showError=showError })
            setLoading(false)

            if (result === null) console.log('Error: callbackFn returned null')
            console.log('callbackFn result:', result)
          } else {
            showError(inputEmptyLabel);
          }
        }}
      >
        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="input">
              {inputLabel}
            </label>
            <input
              type="text"
              name="input"
              value={input}
              id="input"
              placeholder=""
              onChange={e => setInput(e.target.value)}
            />
        </div>

          <button type="submit" block={true} className="comfirmationCodeButton">
            {loading ? {submitButtonLoadingLabel} : {submitButtonLabel} }
          </button>

        { /*error && <div>{error}</div>*/ }
        { error && <ErrorMessage errorMessage={error} /> }
      </form>
    );
  };

  ////////////

  return (
      displayFormOrMessage(props)
  );
};

export default inputForm;

/*
// in case email and sms are both verified


  // auto forward user to sign-in page - this is not working.. because function already returned message: Your account has been verified.

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
