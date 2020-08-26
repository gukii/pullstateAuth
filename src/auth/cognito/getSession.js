
import { getCurrentUser } from './config'
// this might be a function added to the JS library, but not officially COGNITO..

export default function(currentUser=null, log='') {
  //console.log(`## getSession getCurrentUserSession: ${JSON.stringify(getCurrentUserSession())}, getCurrentUser:${JSON.stringify(getCurrentUser())}`)

  const cognitoUser = currentUser? currentUser : getCurrentUser({ log:"getSession" })

  if (cognitoUser) {
    return new Promise((resolve, reject) => {
      cognitoUser.getSession( (err, session) => {
        if (err) {
          console.log('getSessionAsync failed:', err, log)
          reject(err)
        } else {
          console.log('getSessionAsync ok:', session, log)
          resolve(session)
        }
      })
    })
  } else {
    console.log('no cognitoUser, getSession returns null..')
    return null    
  }

  /*} else {
    console.log('no cognitiveUser value:', log)
    throw new Error('no cognitiveUser value:', log)
  }*/
}
