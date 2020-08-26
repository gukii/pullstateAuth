import { CognitoUser } from 'amazon-cognito-identity-js'
import { getUserPool } from './config'


// official cognito API: GetUserAttributeVerificationCode({ AccessToken, AttributeName, ClientMetadata})

// Verify user attribute for an AUTHENTICATED user.
//
// cognitoUser = valid cognitoUser
// attributeName = 'email', 'phone'
// getUserConfirmationCodeFn = async function that will return the confirmation code entered by the user

// should be followed by: cognitoUser.verifyAttribute('email', verificationCode, this);
// or official cognito API: VerifyUserAttribute({ AccessToken, AttributeName, Code })

export async function getAttributeVerificationCodeAsync({ cognitoUser=null, attributeName='email', getUserConfirmationCodeFn = async() =>'no getUserConfirmationCodeFn provided..' }) {

  return new Promise((resolve, reject) => {

    if (!cognitoUser) {
      reject('getAttributeVerificationCodeAsync: no cognitoUser to confirm attributes, returning early')
      return
    }

    cognitoUser.getAttributeVerificationCode(attributeName, {
    	onSuccess: function(result) {
    		console.log('getAttributeVerificationCodeAsync onSuccess result: ' + result);
        resolve(result)
    	},
    	onFailure: function(err) {
        reject(err)
    		//alert(err.message || JSON.stringify(err));
    	},
      inputVerificationCode: async function() {
    		//var verificationCode = prompt('Please input verification code: ', '');
        const verificationCode = await getUserConfirmationCodeFn()

    		cognitoUser.verifyAttribute(attributeName, verificationCode, this);
    	},
    	/*inputVerificationCode: null

      // if inputVerificationCode is set to null, onSuccess will be called instantly.
      // after that, do cognitoUser.verifyAttribute on another screen.

      function() {
    		var verificationCode = prompt('Please input verification code: ', '');

    		cognitoUser.verifyAttribute('email', verificationCode, this);
    	}, */
    });

  })
}



// not sure verifyAttribute will work with function(err, result)
// or if i need to use: VerifyUserAttribute({ AccessToken, AttributeName, Code })
export function verifyAttributeAsync({ cognitoUser=null, attributeName='email', verificationCode }) {

  return new Promise((resolve, reject) => {

    if (!cognitoUser) return reject('verifyAttributeAsync: no cognitoUser, returning early')

    cognitoUser.verifyAttribute(attributeName, verificationCode, function(err, result) {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    })

  })
}
