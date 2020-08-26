import * as React from "react";

import { Redirect } from "react-router";


/** Context consumer */
import { authContext } from "../../contexts/AuthContext";


/** router **/





/** Utils */
//import * as auth from "../../helpers/auth";
//import { validateForm } from "./helpers";

/** router **/
import { useHistory } from 'react-router-dom';  // added by chris, probably not the best place to put this..

import signOutAsync from '../../cognito/signOut'
//import { connGetCognitoUsername } from '../../connectedHelpers/connCognitoUser'
import { connSignOutAsync } from '../../connectedHelpers/connSignOut'

import { R } from '../../routeNames'



/** Presentation/UI */
//import { AuthPageWrapper, SignUpWrapper } from "../../components/Layouts";  // styledComponent wrappers
//import SignInForm from "./SignInForm";


const SignOut = function() {
  //const { auth, setUnauthStatus, username } = React.useContext(authContext);
  const { auth, setUnauthStatus, username } = React.useContext(authContext);


/*
  if (auth.authenticated) {

    const routeOrigin = getRouteStateVar({ location, fieldName: 'from' })
    const pushRoute = routeOrigin !== '' ? routeOrigin : R.AUTH_ROUTE

    return <Redirect to={pushRoute} />;
  }
*/

  const history = useHistory();


  async function doSignOut(e) {
    e.preventDefault();
    await connSignOutAsync({ username, setUnauthStatus })

    //history.push(R.SIGNIN_ROUTE);  // or whatever route you want a signed in user to be redirected to
    history.push(R.PUBLIC_HOME_ROUTE);  // or whatever route you want a signed in user to be redirected to
  }

  if (!auth.authenticated) return <div>Not signed In</div>

  return(
      <button className="signOutButton"
          onClick={ (e)=> doSignOut(e) }
      >
        Sign Out {auth.username}
      </button>
  )

  //return <Redirect to="/sign-in" />

  /*
  if (auth.authenticated) {
    return <Redirect to="/home" />;
  }

  return (
    <AuthPageWrapper>
      <SignUpWrapper>
        <SignInForm />
      </SignUpWrapper>
    </AuthPageWrapper>
  );
  */

};

export default SignOut;
