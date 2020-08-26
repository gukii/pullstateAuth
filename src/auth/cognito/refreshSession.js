
import { getCurrentUser } from './config'

export default function(refreshToken, currentUser=null) {

  const cognitoUser = currentUser? currentUser : getCurrentUser({ log:"refreshSession" })
  // getCurrentUser: often does not work, migth require userPoolId in the congito-user-pool

  //console.log('refreshSessionAsync cognitoUser:', cognitoUser)


  if (cognitoUser) {
    return new Promise((resolve, reject) => {
      cognitoUser.refreshSession(refreshToken, (err, session) => {
        if (err) {
          reject(err)
        } else {
          resolve(session)
        }
      });
    })
  } else {
    console.log('no cognitoUser, refreshSession returns null..')
    return null
    //throw new Error('no cognitiveUser value')
  }

}


/*


if (err) console.log(err, err.stack); // an error occurred
console.log('refreshSession data:',data);
const authObj = getValuesFromSession(data)
parseJwtResponse(data);


//let appConfig // not used

function decodedAccessToken(jwtAccess) {
  if (jwtAccess && jwtAccess.split('.').length > 1) {
    return JSON.parse(atob(jwtAccess.split('.')[1]));
  }
  return false;
}

export function refreshJwt() {


  const decodedAccess = decodedAccessToken(userSession.accessToken)
  console.log('decodedAccess:', decodedAccess)
  if (!decodedAccess) return null

  const userData = {
    Username: decodedAccess.username,
    Pool:  getUserPool(),
  }

  const cognitoUser = new CognitoUser(userData);

  const refreshToken = new CognitoRefreshToken({
    RefreshToken: authObj.refreshToken
  });

  const userData = {
    Username: this.decodedAccess.username,
    Pool: userPool,
  };

  var cognitoUser = new CognitoUser(userData);
  var refreshToken = new CognitoRefreshToken({
    RefreshToken: this.jwtRefresh
  });
  cognitoUser.refreshSession(refreshToken, (err, data) => {
    if (err) console.log(err, err.stack); // an error occurred
    console.log('refreshSession data:',data);
    const authObj = getValuesFromSession(data)
    parseJwtResponse(data);
  });
}

function parseJwtResponse(r) {
  const accessToken = r.getAccessToken().getJwtToken();
  const refreshToken = r.getRefreshToken().getToken();
  const idToken = r.getIdToken().getJwtToken();
  /*
  this.jwtAccess = accessToken;
  this.jwtRefresh = refreshToken;
  this.jwtId = idToken;
  */
