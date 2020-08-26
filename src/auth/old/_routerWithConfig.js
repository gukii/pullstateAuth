import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Link
} from "react-router-dom";

import SignIn from '../auth/signIn'
import SignUp from '../auth/signUp'
import SignOut from '../auth/signOut'
import PublicHome from '../components/publicHome'
import PrivateHome from '../components/privateHome'

import PrivateItemList from '../components/privateItemList'
import PrivateItemHistory from '../components/privateItemHistory'

// only works with 2 levels deep nested routes, not any deeper




//import { routesArray } from '../init/routes'
//import { ROUTES as R } from '../init/routeNames'


export default function RouteConfigExample() {

  console.log('routesArray:', routesArray)

  return (
    <Router>
      <div>
      { /* main menu
        <ul>
          <li>
            <Link to="/tacos">Tacos</Link>
          </li>
          <li>
            <Link to="/sandwiches">Sandwiches</Link>
          </li>
        </ul>
        */ }

        <Switch>
          {routesArray.map((route, i) => (
            <RouteWithSubRoutes key={i} {...route} />
          ))}
        </Switch>
      </div>
    </Router>
  );
}


// A special wrapper for <Route> that knows how to
// handle "sub"-routes by passing them in a `routes`
// prop to the component it renders.
export function RouteWithSubRoutes(route) {
  console.log('route:', route)
  //       exact={route.exact || false}

  return (
    <Route
      path={route.path}
      render={props => (
        // pass the sub-routes down to keep nesting
        <route.baseComponent {...props} routes={route.subRoutes} />
      )}
    />
  );
}


///////////////

export const R = {
//export const ROUTES = {
  SIGNIN_ROUTE: "/signin",
  SIGNUP_ROUTE: "/signup",
  SIGNOUT_ROUTE: "/signout",  // a call to this route will sign out the user
  PUBLIC_HOME_ROUTE: "/",

  PRIVATE_HOME_ROUTE: "/private",
  PRIVATE_ITEM_LIST: "/private/items",
  PRIVATE_ITEM: "/private/item",

  PRIVATE_ITEM_HISTORY: "/private/item/history",
  PRIVATE_ITEM_CONFIRM_BID: "/private/item/confirm",
  PRIVATE_ITEM_BID: "/private/item/bid",
}


///////////////


//import { ROUTES } from './routeNames'



export const routesArray = [
  {
    path: R.SIGNIN_ROUTE,
    baseComponent: SignIn,
    exact: true
  },
  {
    path: R.SIGNUP_ROUTE,
    baseComponent: SignUp,
    exact: true
  },
  {
    path: R.SIGNOUT_ROUTE,
    baseComponent: SignOut,
    exact: true
  },
  {
    path: R.PRIVATE_HOME_ROUTE,
    baseComponent: PublicHome,
    exact: true,
    subRoutes: [
      {
        path: R.PRIVATE_ITEM_LIST,
        baseComponent: PrivateItemList,// PrivateItemList
        exact: true
      },
      {
        path: R.PRIVATE_ITEM,
        baseComponent: PublicHome,// PrivateItem,
        exact: true,
        subRoutes: [
          {
            path: R.PRIVATE_ITEM_HISTORY,
            baseComponent: PrivateItemHistory,// PrivateItemHistory
            exact: true
          },
          {
            path: R.PRIVATE_ITEM_CONFIRM_BID,
            baseComponent: PrivateHome// PrivateItemConfirmBid
          },
          {
            path: R.PRIVATE_ITEM_BID,
            baseComponent: PrivateHome// PrivateItemBid
          }
        ]
      }
    ]
  },
  {
    path: R.PUBLIC_HOME_ROUTE,
    baseComponent: PublicHome,
    exact: true
  }
];


/*routes: [
  {
    path: PRIVATE_ITEM_LIST,
    component: PrivateItemList
  },
  {
    path: PRIVATE_ITEM,
    component: PrivateItem,
    routes: [
      {
        path: PRIVATE_ITEM_HISTORY,
        component: PrivateItemHistory
      },
      {
        path: PRIVATE_ITEM_CONFIRM_BID,
        component: PrivateItemConfirmBid
      },
      {
        path: PRIVATE_ITEM_BID,
        component: PrivateItemBid
      }
    ]
  },

] */
