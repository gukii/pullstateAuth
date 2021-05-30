import React, { useState, useEffect } from "react";

//import { Redirect } from "react-router";


import { AuthStore } from "../../psStore/AuthStore";
import { setUnauthStatus } from "../../connectedHelpers/authHelper"


import { useHistory } from 'react-router-dom';

//import signOutAsync from '../../cognito/signOut'
//import { connGetCognitoUsername } from '../../connectedHelpers/connCognitoUser'
import { connSignOutAsync } from '../../connectedHelpers/connSignOut'

import { R } from '../../routeNames'
import {
  Link,
} from "react-router-dom";


/** Presentation/UI */
//import { AuthPageWrapper, SignUpWrapper } from "../../components/Layouts";  // styledComponent wrappers
//import SignInForm from "./SignInForm";


// takes a "pushTo" prop, after sign out the user will be forwarded to that location
const SignOut = ({pushTo=R.PUBLIC_HOME_ROUTE}) => {

  const auth = AuthStore.useState(s => s.auth)
  const history = useHistory()
  //const { history } = props


  const [isMounted, setIsMounted] = useState(false)
  // trying to fix memory leak complaint
  useEffect( ()=> {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [] )
  // if (!isMounted) return <div>withAuth is not mounted..</div>


/*
  if (auth.authenticated) {

    const routeOrigin = getRouteStateVar({ location, fieldName: 'from' })
    const pushRoute = routeOrigin !== '' ? routeOrigin : R.AUTH_ROUTE

    return <Redirect to={pushRoute} />;
  }
*/


  if (!isMounted) return <div>signOut is not mounted..</div>


  async function doSignOut(e) {
    e.preventDefault();
    await connSignOutAsync({ username:auth.username, setUnauthStatus })

    //history.push(R.SIGNIN_ROUTE);  // or whatever route you want a signed in user to be redirected to
    history.push(pushTo);  // or whatever route you want a signed in user to be redirected to
  }

  if (!auth.authenticated) return (<><p>You are signed out..</p><Link to={pushTo}>Go to next page</Link></>)


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
