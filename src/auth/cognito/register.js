
import { CognitoUserAttribute } from 'amazon-cognito-identity-js'

import { getUserPool } from './config'


// username = username, email, phone_number (anything that is setup to be used for login)
// password
// signupAttributes: fields to be stored in cognito. use exact, official cognito "Names", as they are setup within cognito!!
// !! userPool (imported from config)

export default function({ username, password, signupAttributes=[{ Name: "email", Value: "noemail" }] }) {
  const userPool = getUserPool()
  console.log(`register.js  username:${username}, password:${password}, signupAttributes:${JSON.stringify(signupAttributes)}, userPool:${JSON.stringify(userPool)}`)

  return new Promise((resolve, reject) => {
    const attrList = signupAttributes.map( attr => { return new CognitoUserAttribute(attr) } )
    console.log('register.js attrList:', attrList)

    userPool.signUp(username, password, attrList, null, (err, result) => {
      if (err) {
        reject(err)
        return
      } else {
        resolve(result)
        return
      }
    })
    // to catch problems with signupAttributes.. e.g. if names are spelled wrong
    //reject('signup attribute list error')
  })
}
