import * as React from "react";
import { Redirect } from "react-router";

import SignUpForm from "./signUpFormAsync";


//## SES is still in sandbox.
//can only send emails to verified email addressees !!!!


/** Context consumer */
//import { authContext } from "../../contexts/AuthContextNoPs";

/** Presentation/UI */
//import { AuthPageWrapper, SignUpWrapper } from "../../../AppStyles.styles.tw";

import GlobalModalContainer from "../../modal.js.old";
import ConfirmationCodeForm from "./confirmationCodeForm.js.old";

import { R } from '../../routeNames'



const SignUp = function() {
  /*
  const {   confirmUserModalOpened,      // boolean
            setConfirmUserModalOpened,  // sets confirmationCodeModal to true/false

            confirmAttributeModalOpened,
            setConfirmAttributeModalOpened,

            //auth,
        } = React.useContext(authContext)
    
        /*
/*
  if (auth.authenticated) {
    return <Redirect to={R.AUTH_ROUTE} />;
  }
*/
  return (
      <>
{/*      
        <GlobalModalContainer
          toggleModal={() => setConfirmUserModalOpened(false)}
          title="Please Check Your Phone's SMS"
          modalDisplay={<ConfirmationCodeForm />}
          modal={confirmUserModalOpened}
        />

        <GlobalModalContainer
          toggleModal={() => setConfirmAttributeModalOpened(false)}
          title="Please Check Your Email"
          modalDisplay={<ConfirmationCodeForm />}
          modal={confirmAttributeModalOpened}
        />

        <SignUpForm />
*/}      
        <SignUpForm />  
      </>
  )
}

export default SignUp;

/*
return (
  <AuthPageWrapper>
    <SignUpWrapper>
    <>
      <GlobalModalContainer
        toggleModal={() => openConfirmationCodeModal(false)}
        title="Please Check Your Email"
        modalDisplay={<ConfirmationCodeForm />}
        modal={confirmationCodeModal}
      />
      <SignUpForm />
    </>

    </SignUpWrapper>
  </AuthPageWrapper>
)
*/
