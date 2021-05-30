// pushes router history to a location, forwarding the current "from" parameter to that location
// (so that user gets returned to the page he was routed from before authentication was required)
// !!! might be problematic, if this was a dialog or other temporary url..


// push router to new location, set router state var "from" with current state var "from" value
// using this for proper router history after each sign-in
export function pushWithProperOrigin({ history, location, pushTo, params={} }) {

  if (getRouteStateVar('from') !== '') {
    history.push(pushTo, { from: location.state.from, ...params } ) // from: whatever the "from" field holds
  } else {
    //history.push(pushTo, { from: location.pathname, ...params } )   // from: signin
    history.push(pushTo, { ...params } )

  }
}


// returns "from" field from react router's location.state
export function getRouteStateVar({ location, fieldName = 'from' }) {

  // location comes from useLocation hook
  if (!!location && !!location.state && !!location.state[fieldName] && location.state[fieldName].length > 0) return location.state[fieldName]
  return ''
}

// returns content of route state object variable "from"
export function getRouteOrigin(location) {
  return getRouteStateVar({ location, fieldName:'from' })
}
