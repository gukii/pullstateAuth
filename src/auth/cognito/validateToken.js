


export function jwtToJson(token) {
  if (token) {
    return JSON.parse(atob(token.split('.')[1]))
  }
  return null
}

// cognito timestamp already passed the present
export function cognitoTSexpired(cognitoTS=0) {
  return cognitoTS < Math.floor(Date.now() / 1000)
}


export function jwtExpired(token) {
  if (token) {
    const tokenData = jwtToJson(token)
    if ( !!token.exp && !cognitoTSexpired(tokenData.exp) ) {
      return false
    }
    return true
  }
  return true
}
