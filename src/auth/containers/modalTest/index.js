import React, { useState } from "react";
import { Redirect } from "react-router";

import SignUpForm from "./signUpFormAsync";


//## SES is still in sandbox.
//can only send emails to verified email addressees !!!!


/** Context consumer */

/** Presentation/UI */
//import { AuthPageWrapper, SignUpWrapper } from "../../../AppStyles.styles.tw";

import GlobalModalContainer from "../../modal";
import InputModalForm from "./generalModal";

import { R } from '../../routeNames'



const SignUp = function() {

  const [ modalOpen, setModalOpen ] = useState(false)
/*
  if (auth.authenticated) {
    return <Redirect to={R.AUTH_ROUTE} />;
  }
*/

//callbackFn({ ...props, input:input, log:"from signUp/generalModal.js", showError=showError })

  return (
      <>
        <GlobalModalContainer
          toggleModal={() => setModalOpen(false)}
          title="Please Check Your Phone's SMS"
          modalDisplay={<InputModalForm
                            progressNextOk={false}
                            progressNextRoute={R.SIGNIN_ROUTE}
                            inputLabel="Enter Confirmation Code", // e.g.: Enter Confirmation Code
                            inputEmptyLabel ="Cannot have an empty field!",  // when confirmation code entered is empty use this label/msg
                            submitButtonLoadingLabel="Loading..",
                            submitButtonLabel = "Confirm",
                            successLabel="Your account has been verified.",

                            callbackFn=
                        />
                      }
          modal={ modalOpen }
        />



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
