// to ensure route name consistency. 
// necessary are: SIGNIN_ROUTE, SIGNUP_ROUTE, SIGNOUT_ROUTE, PUBLIC_HOME_ROUTE, AUTH_ROUTE

export const R = {
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

  AUTH_ROUTE: "/private"  // the route where user is getting directed to after successful login (if he didn t come from a "withAuth" route)
}
