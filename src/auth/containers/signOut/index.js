import * as React from "react";

//import { Redirect } from "react-router";


import { AuthStore } from "../../psStore/AuthStore";
import { setUnauthStatus } from "../../connectedHelpers/authHelper"


import { useHistory } from 'react-router-dom';  // added by chris, probably not the best place to put this..

//import signOutAsync from '../../cognito/signOut'
//import { connGetCognitoUsername } from '../../connectedHelpers/connCognitoUser'
import { connSignOutAsync } from '../../connectedHelpers/connSignOut'

import { R } from '../../routeNames'



/** Presentation/UI */
//import { AuthPageWrapper, SignUpWrapper } from "../../components/Layouts";  // styledComponent wrappers
//import SignInForm from "./SignInForm";


const SignOut = function() {
  //const { auth, setUnauthStatus, username } = React.useContext(authContext);
  const auth = AuthStore.useState(s => s.auth)


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
    await connSignOutAsync({ username:auth.username, setUnauthStatus })

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
