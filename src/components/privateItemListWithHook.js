import React, { useState, useEffect } from 'react'
import '../App.css';

import withAuth from '../hoc/withAuth'
import { R } from '../auth/routeNames'
import { NavLink } from 'react-router-dom'

import useAuth from '../auth/hooks/useAuth'
import { SimpleLoginPrompt, ConfirmationCodeDialog, PsRenderDialog, psDialogAsync, InputFunction, Simple2Prompt, SimpleDialog } from '../auth/containers/modalPortal/modalPortal'



const PrivateItemListWithHook = props => {

/*
  const [isMounted, setIsMounted] = useState(false)
  // trying to fix memory leak complaint
  useEffect( ()=> {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [] )
  // if (!isMounted) return <div>withAuth is not mounted..</div>
*/

  // AuthComponent is the signOutButton or redirect to signinPage
  const [ authOk, AuthComponent, username ] = useAuth()
  const signUpUrl = R.SIGNUP_ROUTE


  //if (!isMounted) return <div>withAuth is not mounted..</div>


  if (!authOk) {
    return AuthComponent
  }


  const asyncLoginPrompt = async () => {

    // const textComponent = () => {
    //   return <div><br />some thing or other<div>working like that</div><br /></div>
    // }

    try {

        const valArr = await psDialogAsync({  component: SimpleLoginPrompt, //Simple2Prompt,
                                              title:"Login",
                                              text:"Restricted area..",
                                              label:"Username:",
                                              label2:"Password:",
                                              //initValue: "Username",
                                              //initValue2: "Password",
                                              inputType2:"password",    // html input types: text, tel, number, email, ...

                                              error:"wrong password",

                                              signUpLabel:"Register",
                                              signUpUrl,

                                              submitLabel:"Login..", // "Ok"
                                              //cancelLabel:"Cancel",
                                              //alwaysResolve: true
                                              modalProps:{ screenBgImage:"https://www.worldatlas.com/upload/36/4f/c4/shutterstock-239392108.jpg" },
                                            })


        console.log('asyncPrompt2 res:', valArr)

    } catch(e) {
        console.log('asyncPrompt2 rejected:', e)
    }
  }


  return (
    <div className="App">
      <div>user:{ username }</div>

      { AuthComponent }

      <header className="App-header">
        <p>
          Private, PrivateItemList component showing.. { JSON.stringify(props) }
        </p>


        <NavLink
          to={ R.PRIVATE_HOME_ROUTE }
          activeStyle={{
            fontWeight: "bold",
            color: "red"
          }}
        >
          Private Home
        </NavLink>


        <NavLink
          to={ R.PUBLIC_HOME_ROUTE }
          activeStyle={{
            fontWeight: "bold",
            color: "green"
          }}
        >
          Public Home
        </NavLink>

        <button onClick={ ()=>asyncLoginPrompt() }>
          asyncLoginPrompt Test
        </button>

      </header>
    </div>
  )
}

export default PrivateItemListWithHook

//export default withAuth(PrivateItemListWithHook)
