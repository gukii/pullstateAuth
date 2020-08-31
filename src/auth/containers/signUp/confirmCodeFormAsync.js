

//import * as authHelper from "../../helpers/auth";
import { confirmCognitoUserAsync } from '../../cognito/confirmation'
//import { confirmationCodeForm } from "./confirmationCodeForm"

import { connNewCognitoUser } from '../../connectedHelpers/connCognitoUser'


import { ConfirmationCodeDialog, PsRenderDialog, psDialogAsync, InputFunction, SimplePrompt, SimpleDialog } from '../modalPortal/modalPortal'


import { setUnauthStatus } from '../../connectedHelpers/authHelper'
import { resetStoredUserAuth } from '../../cognito/localStorage'
import resendConfirmation from '../../cognito/resendConfirmation'



export async function confirmSignUpAsync({ cognitoUser=null, showError=(e)=>console.log(e), setLoading=(e)=>console.log('loading set:',e), log='' }) {


    return new Promise( async (resolve, reject) => {

        // triggers all pullstate related functions on failure
        function doFailure(log='') {
            console.log(log)
            setUnauthStatus({ log:"confirmCodeFormAsync error. "+log })
            showError(log)
            resetStoredUserAuth()
            resolve(null)
        }    

        function doSuccess(log='') {
            console.log(log)
            setUnauthStatus({ log:"confirmCodeFormAsync success "+log, keepUsername: true })
            showError(log)
            //resetStoredUserAuth()
            resolve(true)
        }  


        if (log.length > 0) console.log(`confirmSignUpAsync, log: ${log}`)


        const _cognitoUser = cognitoUser || await connNewCognitoUser({ setUnauthStatus, username:null, log:"for confirmSignUpAsync" })
        if (_cognitoUser === null) {
            doFailure("ERROR ConfirmationCodeForm, confirmation code flow failure, also no cognitoUser" )
        }


        const resUsername =  cognitoUser.username || cognitoUser.user.username || null
        //const resUserId = cognitoUser.userSub

        if (!resUsername) {
            doFailure("ERROR ConfirmationCodeForm, cognitoUser username is null, returning early.." )
        }



        // needs to be in a try() catch(e)...
        const confirmationCode = await psDialogAsync({ 
            component: SimplePrompt, 
            title:"Enter Confirmation Code", 
            text:"Your account is not yet confirmed. \n\nWe have sent you a confirmation code via email / sms.", 
            label:"Code: ", 
            submitLabel:"Verify", 
            cancelLabel:"Cancel", 
            rejectVal:"", 
            alwaysResolve: true 
        })


        console.log('cognitoUser:', _cognitoUser)
        console.log('entered confirmationCode:', confirmationCode)


        if (confirmationCode === null || confirmationCode === undefined || confirmationCode.length === 0) {
            //alert("Confirmation code not entered")
            await psDialogAsync({ 
                component: SimpleDialog, 
                title:"Confirmation Code not entered", 
                text:"User sign in not possible. Try again next time.", 
                submitLabel:"Ok", 
                rejectVal:"", 
                alwaysResolve: true 
            })  
            doFailure("Confirmation code not entered" )
        }
        


        try {

            setLoading(true)
            const result = await confirmCognitoUserAsync(_cognitoUser, confirmationCode)
            console.log('confirmCognitoUserAsync result:', result)


            setLoading(false)

            if (result === "SUCCESS") {

                await psDialogAsync({ 
                    component: SimpleDialog, 
                    title:"SignUp Success", 
                    text:"Your signup was successful and is confirmed.", 
                    submitLabel:"Ok", 
                    rejectVal:"", 
                    alwaysResolve: true 
                })  


                // because userAccountVerified-useEffect above does not catch..
                //history.push(R.SIGNIN_ROUTE)
                doSuccess("Your signup was successful and is confirmed." )


            } else {
                await psDialogAsync({ 
                    component: SimpleDialog, 
                    title:"There was a problem confirming the user", 
                    submitLabel:"Ok", 
                    rejectVal:"", 
                    alwaysResolve: true 
                })              
                doFailure("There was a problem confirming the user" )

            }

        }
        catch (e) {
            setLoading(false)
            // ExpiredCodeException   // err.message: Invalid code provided, please request a code again.

            switch (e.code) {

                case 'CodeMismatchException':

                    await psDialogAsync({ 
                        component: SimpleDialog, 
                        title:"Confirmation code was not correct.", 
                        submitLabel:"Ok", 
                        rejectVal:"", 
                        alwaysResolve: true 
                    })             
                    doFailure("Confirmation code was not correct." )
                    break
            

                case 'ExpiredCodeException':
            
                    const res = await psDialogAsync({ 
                        component: SimpleDialog, 
                        title:"Confirmation Code Expired", 
                        text:"Please request a new confirmation code.", 
                        submitLabel:"Request new code", 
                        cancelLabel:"Cancel", 
                        rejectVal:"", 
                        alwaysResolve: true 
                    }) 

                    if (res === "submit") {
                        console.log('request new confirmation code here..')

                        try {
                            setLoading(true)
                            await resendConfirmation(_cognitoUser)

                            setLoading(false)
                            await psDialogAsync({ 
                                component: SimpleDialog, 
                                title:"New confirmation was sent", 
                                text:"Check your email or sms in 2-3 minutes",
                                submitLabel:"Ok", 
                                rejectVal:"", 
                                alwaysResolve: true 
                            })                           
                            doFailure("New confirmation was sent" )

                        }
                        catch (reqErr) {
                            setLoading(false)
                            await psDialogAsync({ 
                                component: SimpleDialog, 
                                title:"Error requesting new confirmation code", 
                                text: JSON.stringify(reqErr), 
                                submitLabel:"Ok", 
                                rejectVal:"", 
                                alwaysResolve: true 
                            })                         
                            doFailure("Error requesting new confirmation code:", JSON.stringify(reqErr) )
                        }
                    } 

                    await psDialogAsync({ 
                        component: SimpleDialog, 
                        title:"Confirmation code expired", 
                        text: "Request a new code", 
                        submitLabel:"Ok", 
                        rejectVal:"", 
                        alwaysResolve: true 
                    })                 
                    doFailure("Confirmation code expired, request a new one." )
                    break

                    
                default: 
                    if (JSON.stringify(e) !== '{}') {
                        await psDialogAsync({ 
                            component: SimpleDialog, 
                            title:"New Error", 
                            text: JSON.stringify(e), 
                            submitLabel:"Ok", 
                            rejectVal:"", 
                            alwaysResolve: true 
                        })              
                        doFailure("New Error:", JSON.stringify(e) )   
                    }

                    resolve(true)

                    //return doFailure( JSON.stringify(e) )
    
            }
        }
        
    })


}
