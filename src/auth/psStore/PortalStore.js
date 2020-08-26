import { Store } from "pullstate";


export const PortalStore = new Store({

    onCancel: v=>console.log('ps onCancel:',v),                 // cancel function of the dialog (to close window)
    component: null,    // for injecting react components       // react component that represents the dialog
  
});