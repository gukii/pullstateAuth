/*
import { cognitoResendConfirmation } from '../cognito/resendConfirmation'

import { setUnauthStatus } from './authHelper'
import { connNewCognitoUser, connGetCognitoUsername } from './connCognitoUser'


//import { AuthStore } from "../psStore/AuthStore";


export const resendConfirmation = async function() {

    const _username = connGetCognitoUsername({ setUnauthStatus, log:"for resendConfirmation username" })
    if (_username === null) return null

    const _cognitoUser = await connNewCognitoUser({ setUnauthStatus, username: _username, log:"for resendConfirmation cognitoUser" })
    if (_cognitoUser === null) return null


    try {
        const res = await cognitoResendConfirmation(_cognitoUser)
        return res
    }
    catch(e) {
        return null
    }
}
*/