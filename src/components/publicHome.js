import React, { useState } from 'react';
import '../App.css';

import { R } from '../auth/routeNames'
import { useLocation, useHistory } from 'react-router-dom'
//import { Redirect } from "react-router";

import { authContext } from '../auth/contexts/AuthContext'

import { ConfirmationCodeDialog, PsRenderDialog, psDialogAsync, InputFunction, SimplePrompt, SimpleDialog } from '../auth/containers/modalPortal/modalPortal'



const PublicHome = props => {

  const {
    renewSession,
    auth
  } = React.useContext(authContext);


  const { authFailRoute=R.SIGNIN_ROUTE } = props
  const location = useLocation();
  const history = useHistory()
  const currentLocation = location.pathname


  //////////////////////////////////

  function TestComponent({ resolve, reject, onCancel, onClose, rejectVal=null }) {  

    const [input1, setInput1] = useState()

    function resetState() {
      setInput1("")
    }
  
    function doCancel() {
      reject(rejectVal)
      resetState()
      onClose()
    }
  
    function doSubmit() {
      resolve(input1)
      resetState()
      onClose()
    }  
  
    //if (!PortalStore.currentState.compoent === null) return null

    return (
      <>
        <strong>Confirm</strong>
        <br/><br/>
        <InputFunction id="in1" label={"lable1:"} field={input1} setField={setInput1} type={"text"} />
        <br/>
        <button onClick={ doSubmit }>Submit</button>
        <button onClick={ doCancel }>Cancel</button>
      </>
    )
  }


  async function psTest(e) {
    e.preventDefault()
    console.log('psTest triggered..')
    try {
      //const res = await psDialogAsync({ title:"ConfirmationYeah2", inputLabel:"superLabel:", component: TestComponent })
      
      const res = await psDialogAsync({ component: SimplePrompt, title:"Confirmation Code", text:"Please enter the confirmation code sent to your phone.", label:"Code:", submitLabel:"Verify", cancelLabel:"Cancel", rejectVal:"", alwaysResolve: true })
      //const res = await psDialogAsync({ component: SimpleDialog, title:"Success", text:"Your code has been verified successfully", submitLabel:"OK", rejectVal:"" })

      console.log('pstTest res:', res)
    }
    catch (e) {
      console.log('pstTest res err:', e)
      console.log('!e:', !e)

    }
  }


  /////////////////////////////////

  const [dialogIsOpen, setDialogIsOpen] = useState(false)

  console.log('publicHome props:', props)
  return (
    <div className="App">


      { 
        <ConfirmationCodeDialog 
            isOpen={dialogIsOpen}
            onSubmit={ (a)=> {  
              console.log('publicHome Dialog res:', a) 
              setDialogIsOpen(false)
            }}
            onCancel={ (a)=> {  
              console.log('publicHome Dialog cancel res:', a) 
              setDialogIsOpen(false)
            }}                         
        /> 
      }
      <button onClick={ ()=> setDialogIsOpen(true) }>confirmationDialog</button>




      
      {/* <PsRenderDialog />  this can be placed anywhere (best in App.js), thanks to the centralizd pullstate store */}
      <button onClick={ (e)=> psTest(e) }>psTest</button>


      


      <header className="App-header">
        <p>
          Public Home..{ JSON.stringify(props) }
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>

        <button onClick={ async()=> {
            const newAuthObj = await renewSession(true) // true = forceUpdate of the session, even if the current session has not expired yet
            if (newAuthObj === null) {
              console.log('ERROR, privateHome calling renewSession failed.')
              // the forwarding to signIn only happens for components that are
              // encapsulated by HOC withAuth(), here I d have to forward the user manually to signIn
              history.push(authFailRoute, { from: currentLocation })
              return
            }
            console.log('SUCCESS, privateHome calling renewSession succeeded:', newAuthObj)
        }}
          disabled={!auth.authenticated}>
          Renew Session Now
        </button>



        <button onClick={ async()=> {
            //const newAuthObj = await renewSession(true) // true = forceUpdate of the session, even if the current session has not expired yet

              // the forwarding to signIn only happens for components that are
              // encapsulated by HOC withAuth(), here I d have to forward the user manually to signIn
              history.push(authFailRoute, { from: currentLocation })
        }}
        >
          Sign In
        </button>

      </header>



    </div>
  );
}

export default PublicHome
