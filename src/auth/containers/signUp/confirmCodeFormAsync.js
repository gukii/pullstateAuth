

//import * as authHelper from "../../helpers/auth";
import { confirmCognitoUserAsync } from '../../cognito/confirmation'
//import { confirmationCodeForm } from "./confirmationCodeForm"

import { connNewCognitoUser } from '../../connectedHelpers/connCognitoUser'


import { ConfirmationCodeDialog, PsRenderDialog, psDialogAsync, psPromptAsync, InputFunction, SimplePrompt, SimpleDialog } from '../modalPortal/modalPortal'


import { setUnauthStatus } from '../../connectedHelpers/authHelper'
import { resetStoredUserAuth } from '../../connectedHelpers/localStorage'
import resendConfirmation from '../../cognito/resendConfirmation'


// prompts the user for a confirmation code
// sends the code to cognito
// and returns the result / failure as a promise


export async function confirmSignUpAsync({ cognitoUser=null, username=null, showError=(e)=>console.log(e), setLoading=(e)=>console.log('loading set:',e), log='' }) {


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



        //const awsCognitoUser = cognitoUser || await connNewCognitoUser({ setUnauthStatus, username, log:"for confirmSignUpAsync" })
        //
        // maybe don t have to "await" here..
        // hit the aws cognito api to get the current, active cognitoUser object.
        const awsCognitoUser = await connNewCognitoUser({ setUnauthStatus, username, log:"for confirmSignUpAsync" })

        if (awsCognitoUser === null) {
            doFailure("ERROR ConfirmationCodeForm, confirmation code flow failure, also no cognitoUser" )
        }


        //
        // why not use awsCognitoUser here???
        //
        const resUsername =  cognitoUser.username || cognitoUser.user.username || null
        //const resUserId = cognitoUser.userSub

        if (!resUsername) {
            doFailure("ERROR ConfirmationCodeForm, cognitoUser username is null, returning early.." )
        }



        // needs to be in a try() catch(e)...
        const confirmationCode = await psPromptAsync({
            component: SimplePrompt,
            title:"Enter Confirmation Code",
            text:"Your account is not yet confirmed. \n\nWe have sent you a confirmation code via email / sms.",
            label:"Code: ",
            submitLabel:"Verify",
            cancelLabel:"Cancel",
            rejectVal:"",
            alwaysResolve: true
        })


        console.log('cognitoUser:', awsCognitoUser)
        console.log('entered confirmationCode:', confirmationCode)


        if (confirmationCode === null || confirmationCode === undefined || confirmationCode.length === 0) {
            //alert("Confirmation code not entered")
            await psPromptAsync({
                component: SimpleDialog,
                title:"Confirmation Code not entered",
                text:"User sign in not possible. Try again next time.",
                submitLabel:"Ok",
                rejectVal:"",
                alwaysResolve: true
            })
            doFailure("Confirmation code not entered" )
            return null
        }



        try {

            setLoading(true)

            const result = await confirmCognitoUserAsync(awsCognitoUser, confirmationCode)
            console.log('confirmCognitoUserAsync result:', result)


            setLoading(false)

            if (result === "SUCCESS") {

                await psPromptAsync({
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
                await psPromptAsync({
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

                    await psPromptAsync({
                        component: SimpleDialog,
                        title:"Error",
                        text:"Confirmation code was not correct.",
                        submitLabel:"Ok",
                        rejectVal:"",
                        alwaysResolve: true
                    })
                    doFailure("Confirmation code was not correct." )
                    break


                case 'ExpiredCodeException':

                    const res = await psPromptAsync({
                        component: SimpleDialog,
                        title:"Error",
                        text:"Confirmation Code Expired \nPlease request a new confirmation code.",
                        submitLabel:"Request new code",
                        cancelLabel:"Cancel",
                        rejectVal:"",
                        alwaysResolve: true
                    })

                    if (res === "submit") {
                        console.log('request new confirmation code here..')

                        try {
                            setLoading(true)
                            await resendConfirmation(awsCognitoUser)

                            setLoading(false)
                            await psPromptAsync({
                                component: SimpleDialog,
                                title:"Attention",
                                text:"New code was sent. \nCheck your email or sms in 2-3 minutes",
                                submitLabel:"Ok",
                                rejectVal:"",
                                alwaysResolve: true
                            })
                            doFailure("New confirmation was sent" )
                            break

                        }
                        catch (reqErr) {
                            setLoading(false)
                            await psPromptAsync({
                                component: SimpleDialog,
                                title:"Error requesting new confirmation code",
                                text: JSON.stringify(reqErr),
                                submitLabel:"Ok",
                                rejectVal:"",
                                alwaysResolve: true
                            })
                            doFailure("Error requesting new confirmation code: "+ JSON.stringify(reqErr) )
                            break
                        }
                    }

                    await psPromptAsync({
                        component: SimpleDialog,
                        title:"Error",
                        text: "Confirmation code expired.\nRequest a new code",
                        submitLabel:"Ok",
                        rejectVal:"",
                        alwaysResolve: true
                    })
                    doFailure("Confirmation code expired, request a new one." )
                    break


                case 'CodeDeliveryFailureException':

                    await psPromptAsync({
                        component: SimpleDialog,
                        title:"Error",
                        text: "Code Delivery failed.\n Try again in a few minutes..",
                        submitLabel:"Ok",
                        rejectVal:"",
                        alwaysResolve: true
                    })
                    doFailure("Code Delivery failed, try again in a few minutes." )
                    break

                default:
                    if (JSON.stringify(e) !== '{}') {
                        await psDialogAsync({
                            component: SimpleDialog,
                            title:"Code Form Error",
                            text: JSON.stringify(e),
                            submitLabel:"Ok",
                            rejectVal:"",
                            alwaysResolve: true
                        })
                        doFailure("Code Form Error: "+JSON.stringify(e) )
                    }

                    // i m getting a {} error even after successful registration... trying to fix that with this hack
                    resolve(false)


            }
        }

    })


}
