## pullstateAuth

cognito authentication build with pullstate library in react.
no UI libraries used.

general functionaly is there, some corner cases might need testing.


### features:
- auto session renew
- confirm signup with code / email
- higher order component wrapper for auth-protected components (withAuth)
- or hook-based auth for protected auth-protected components (useAuth)
- pullstate (https://lostpebble.github.io/pullstate/) as centralized store
- signup form validation of individual fields
- signup form error messages for individual fields
- promise-based cognito auth
- promise & react-portal based dialog and prompt (psDialog / psPrompt)
- supports nested routing


### notes:

set environment variables in .env or .env.local for AWS cognito details:

- REACT_APP_COGNITO_USER_POOL_ID
- REACT_APP_COGNITO_CLIENT_ID
- REACT_APP_COGNITO_USER_POOL_REGION (not really used yet)

cognito session gets auto-renewed before it exprires, settings in:
/auth/cognito/config.js

centralized auth/routeNames.js file to ensure route name consistency. 
(necessary are: SIGNIN_ROUTE, SIGNUP_ROUTE, SIGNOUT_ROUTE, PUBLIC_HOME_ROUTE, AUTH_ROUTE)

cognito username is also stored in localstorage, so that session can be re-initiated without login after user leaves web-page and returns.


pullState stores:
- AuthStore: result of cognito authenticate call
- PortalStore: user dialog/prompt component to be rendered & props

pullState is small, but uses immer (https://www.npmjs.com/package/immer) which is 844kb unpacked.

libraries were installed with YARN.


still lots of old garbage code left in comments..


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `yarn build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify
