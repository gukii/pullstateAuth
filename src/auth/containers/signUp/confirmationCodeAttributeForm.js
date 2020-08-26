import * as React from "react";
import { authContext } from "../../contexts/AuthContext";


//import ErrorMessage from "../../components/ErrorMessage";

import useErrorHandler from "../../custom-hooks/ErrorHandler";

//import * as authHelper from "../../helpers/auth";
import { getAttributeVerificationCodeAsync, verifyAttributeAsync } from '../../cognito/verifyAttribute'
//import { confirmationCodeAttributeForm } from "./confirmationCodeAttributeForm"

import { connNewCognitoUser } from '../../connectedHelpers/connCognitoUser'

import { Redirect } from "react-router";

import { R } from '../../routeNames'




const ConfirmationCodeForm = function() {

  const [ loading, setLoading ] = React.useState(false);
  const [ confirmationCode, setConfirmationCode ] = React.useState("");
  const { error, showError } = useErrorHandler(null);

  const {
    username,
    userId,
    userTimestamp,

    userAccountVerified,      // to confirm cognito account sign up (user or email)
    setUserAccountVerified,

    attributeVerified,        // to confirm 2nd cognito user attribute (such as email/phone)
    setAttributeVerified,

    setUnauthStatus,
  } = React.useContext(authContext);

  // auto forward user to sign-in page - this is not working.. because function already returned message: Your account has been verified.
  // NEED TO VERIFY ATTRIBUTE ... MAYBE ADD TO CONTEXT A NEW FIELD
  React.useEffect( ()=> {
    if (userAccountVerified && attributeVerified) {
      setTimeout( () => {  return <Redirect to={R.SIGNIN_ROUTE} /> }, 3000);
    }
  }, userAccountVerified, attributeVerified)




  async function confirmSignUpAsync({ username=null, code=null, setUnauthStatus, log='' }) {

    if (log.length > 0) console.log(`confirmSignUpAsync, log: ${log}`)

    if (username === null) return null

    const cognitoUser = await connNewCognitoUser({ setUnauthStatus, username, log:"for connConfirmSignUpAsync" })
    if (cognitoUser === null) return null


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

        {error && <div>{error}</div> }
        { /*error && <ErrorMessage errorMessage={error} /> */}
      </form>
    );
  };

  return (
      displayFormOrMessage(userAccountVerified)
  );
};

export default ConfirmationCodeForm;
