
//import authenticateAsync from '../cognito/authenticate'
//import { getValuesFromSession } from '../cognito/config'
import signOutAsync from '../cognito/signOut'
import { connNewCognitoUser, connGetCognitoUsername } from './connCognitoUser'



// called by the "SignInForm" function below

export async function connSignOutAsync({ username='', setUnauthStatus }) {
  console.log('connSignOutAsync called with username:', username)


  const _username = connGetCognitoUsername({ setUnauthStatus, username, log:"for connSignOutAsync" })
  if (_username === null) return null

  const _cognitoUser = await connNewCognitoUser({ setUnauthStatus, username: _username, log:"for connSignOutAsync" })
  if (_cognitoUser === null) return null

  setUnauthStatus({ keepUsername: false, log:"for connSignOutAsync"})
  await signOutAsync(_cognitoUser)

  return
}
