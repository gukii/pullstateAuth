import { Store } from "pullstate";

// currently only one portal (dialog) can be shown at any time.
// if a new one is shown, the previous one will be overwritten on screen.

// these attributes are set by psDialogAsync function, 
// "component" is part of that psDialogAsync({ component: }) call

export const PortalStore = new Store({

    onCancel: v=>console.log('ps onCancel:',v),                 // cancel function of the dialog (to close window), sets component to null, used by psDialogAsync function).
    component: null,    // for injecting react components       // react component that is rendered as dialog. injected into dialog-render function by use of psDialogAsync({ component: }). 
  
});