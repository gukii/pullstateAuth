
// cognitoUser = valid cognitoUser
// code = confirmation code

export default function(cognitoUser=null) {


  return new Promise((resolve, reject) => {

    if (cognitoUser === null) reject('cognitoUser is null in resendConfirmationCode.js')


    cognitoUser.resendConfirmationCode(function(err, result) {
      if (err) {
        // alert(err.message || JSON.stringify(err));
        reject(err)
      } else {
        resolve(result)
      }
    })
    
    reject('cognitoUser error in resendConfirmationCode.js')
  })
}
