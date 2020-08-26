import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

import { R } from '../auth/routeNames'
//import { }



// params: jwtToken
// params: authFailRoute

const withAuth = Component => props => {

  const { jwtToken=null, authFailRoute } = props

  const [ authenticated, setAuthenticated ] = useState(false)
  const [ firstRun, setFirstRun ] = useState(true)

  let history = useHistory();

  useEffect(() => {
    console.log('.withAuth: useEffect1: load session from file')
    console.log('.withAuth: useEffect1: if session valid, use it')
    console.log('.withAuth: useEffect1: if session invalid, update or create new')
    console.log('.withAuth: useEffect1: maybe start timer for auto-token-update')
    setFirstRun(true)

  }, [])


  useEffect(() => {
    console.log('.withAuth: useEffect2: token changed, do something:', jwtToken)
    if (jwtToken === "ok") {
      console.log('setAuthenticated to true..')
      setAuthenticated(true)
    } else {
      console.log('setAuthenticated to false..')
      setAuthenticated(false)
    }

  }, [jwtToken])

  console.log('withAuth: props:', props)


  if (authenticated) {
    console.log('withAuth: component is authenticated..')
    return <Component { ...props } authenticated={ authenticated } />
  }


  console.log('withAuth: component is not authenticated, access not allowed!!')

  if (!!authFailRoute && !!history ) {
    console.log('withAuth: got authFailRoute, routing to:', authFailRoute)
    history.push(authFailRoute)
    return null
  }

  return <div><p>Access not allowed without autentication!!</p>(no authFailRoute specified)</div>
}

export default withAuth
