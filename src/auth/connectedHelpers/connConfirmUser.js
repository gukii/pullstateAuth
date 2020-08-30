// userPool is imported from config (global var)
/*
export async function connConfirmSignUpAsync({ username=null, code=null, setUnauthStatus }) {

  if (log.length > 0) console.log(`connConfirmSignUpAsync, log: ${log}`)

  if (username === null) return null

  const cognitoUser = await connNewCognitoUser({ setUnauthStatus, username, log:"for connConfirmSignUpAsync" })
  if (cognitoUser === null) return null


  try {

    setLoading(true)
    const result = await confirmCognitoUserAsync(cognitoUser, code)

    if (result === "SUCCESS") {
      setLoading(false);
      setUserAccountVerified(true);
    } else {
      setLoading(false);
      setError("There was a problem confirming the user");
    }
    return result

  }
  catch (err) {
    setLoading(false)
    setError(err.message);
    return null
  }

}
*/