import React from 'react';
import './App.css';

//import PrivateHome from './components/privateHome'
//import RouterComponent from './auth/routerWithConfig'
import RouterComponent from './auth/router'

//import CodeSplitRouterTest from './components/codeSplitRouterTest'

// for showing dialogs and prompts
import { PsRenderDialog } from './auth/containers/modalPortal/modalPortal'


function App() {
  return (

    <div className="App">

          <PsRenderDialog />

          <RouterComponent />

    </div>
  );
}

export default App;

