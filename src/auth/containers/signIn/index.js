//import * as React from "react";
//import { Redirect } from "react-router";

import SignInForm from "./signInFormAsync";

//import SignInForm from "./signInFormAsync";

export default SignInForm

////////////////////////////////////////////////////////////
/*
import * as React from "react";
import { Redirect } from "react-router";

import SignUpForm from "./signInFormAsync";


//## SES is still in sandbox.
//can only send emails to verified email addressees !!!!


import { authContext } from "../../contexts/AuthContext";

//import { AuthPageWrapper, SignUpWrapper } from "../../../AppStyles.styles.tw";

import GlobalModalContainer from "../../modal";
import ConfirmationCodeMfaForm from "./confirmationCodeMfaForm";

import { R } from '../../routeNames'



const SignIn = function() {
  const {
            confirmMfaModalOpened,        // boolean
            setConfirmMfaModalOpened,     // sets confirmationCodeModal to true/false
            //auth,
        } = React.useContext(authContext)

  //if (auth.authenticated) {
  //  return <Redirect to={R.AUTH_ROUTE} />;
  //}

  return (
      <>
        <GlobalModalContainer
          toggleModal={() => setConfirmMfaModalOpened(false)}
          title="Please Check Your Phone's SMS"
          modalDisplay={<ConfirmationCodeMfaForm />}
          modal={confirmMfaModalOpened}
        />


        <SignInForm />
      </>
  )
}

export default SignIn;
*/
