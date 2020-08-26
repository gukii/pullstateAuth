import { getCurrentUser } from './config'

export default function(currentUser=null) {

  const cognitoUser = currentUser? currentUser : getCurrentUser()
  
  if (cognitoUser) {
    cognitoUser.signOut()
    Promise.resolve()
  } else {
    throw new Error('no cognitiveUser value')
  }
}
