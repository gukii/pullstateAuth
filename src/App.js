import React from 'react';
import './App.css';

//import PrivateHome from './components/privateHome'
//import RouterComponent from './auth/routerWithConfig'
import RouterComponent from './auth/router'

//import CodeSplitRouterTest from './components/codeSplitRouterTest'

// for showing dialogs and prompts
import { PsRenderDialog } from './auth/containers/modalPortal/modalPortal'

import { StoreTest } from './StoreTest'

function App() {
  return (

    <div className="App">

          <StoreTest />

          <PsRenderDialog />

          <RouterComponent />

    </div>
  );
}

export default App;

