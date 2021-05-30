// congitoTS: a timestamp in seconds-form
// margin: a duration in seconds, to be subtracted from cognitoTS

returns miliseconds left until cognitoTS-margin 

export default function({ cognitoTS=0, margin=0 }) {

  if (cognitoTS === 0 || cognitoTS === undefined) return 0

  const timerTS =  (cognitoTS - margin ) * 1000
  const timerDuration = timerTS - Date.now()
  return timerDuration
}
