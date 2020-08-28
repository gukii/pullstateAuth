import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { PortalStore } from "../../psStore/PortalStore";
import { InjectStoreState } from "pullstate"


const portalRoot = document.getElementById("modal-portal");


export function RenderOncePortalWrapper({ portalRoot=undefined, divClass="modalPortal", children }) {
  
  const portalDiv = useRef(null)
  const [dummy, setDummy] = useState()  // just to force a state update followed by a render


  // create DIV only once, attaching it to portalDiv (to avoid frequent re-rendering of modal)
  useEffect(() => {
    if (!portalDiv.current) { 
      const el = document.createElement("div");
      el.classList.add(divClass)           
      portalDiv.current = el
    }
  }, [portalDiv])


  // append the Reffed Div to the portalRoot
  useEffect(() => {

    if (!portalRoot) {
      alert('portalRoot is undefined, check your params and index.html for the propper div id, poralRoot = document.getElementById...')
      return
    }

    // 'portal-root' is a sibling to 'app-root'
    // const portalRoot = document.getElementById(htmlID);
    portalRoot.appendChild(portalDiv.current);
    setDummy(!dummy)  // force render with state update

    return () => {
      portalRoot.removeChild(portalDiv.current)
    }; 
  }, [portalDiv, portalRoot]);


  if (portalDiv.current) {
    return createPortal(children, portalDiv.current)
  }

  return null
}



export function Modal({ isOpen=true, 
                        closeFn=null, 
                        portalRoot=undefined,
                        children,

                        onSubmit=null,                   //optional
                        onCancel=null,                  //optional
                        submitButtonLabel="Submit", 
                        cancelButtonLabel="Cancel", 
                      }) {

  ///// start of detect inside/outside clicks.. to dismiss dialog

  const modalRef = useRef(null);  

  
  useEffect( ()=> {

    console.log()

    const handleClick = (e) => {
      if (!modalRef.current) return
      if (modalRef.current.contains(e.target)) {
        console.log('clicked inside!')
        return
      }
      console.log('clicked outside!')
      if (onCancel !== null) {
        console.log('calling onCancel within handleClick')
        onCancel()
      } 
      closeFn()
    }

    document.addEventListener('mousedown', handleClick, false)
    document.addEventListener('touchstart', handleClick, false)

    return () => {
      document.removeEventListener('mousedown', handleClick, false)
      document.removeEventListener('touchend', handleClick, false)
    }

  },[modalRef, onCancel, closeFn])   

  ///// end of click inside/outside detection


  return ( 
    isOpen &&
    <RenderOncePortalWrapper portalRoot={portalRoot}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: "100%",
          padding: "0px",
          backgroundColor: "rgba(0,0,0,0.6)"
        }}
      >
        <div    
          className="fadeDown"    
          style={{
            padding: "20%",
          }}
        >

          <div  ref={modalRef}
                style={{
                  width: "100%",
                  background: "gray",
                }}>
          
            { closeFn !== null &&
              <button
                className="modal-close"
                onClick={()=>closeFn()}
              >X</button>
            }

            <div  style={{
                  background: "white",
                  padding: "5%",
                  textAlign: "center"
                }}
            >
              {children}
            </div>
            { onSubmit !== null && <button onClick={ ()=>onSubmit() }>{submitButtonLabel}</button> }
            { onCancel !== null && <button onClick={ ()=>onCancel() }>{cancelButtonLabel}</button> }
            </div>
        </div>
      </div>
    </RenderOncePortalWrapper>  
  )
}


// general INPUT function
export function InputFunction({ id="", label="", field, setField, type="text", placeholder="", ...rest }) {

  return(
    <div className="fullFormDiv">
        <label className="fullFomLabel" htmlFor={id}>
            {label}
        </label>
        <input
          type={type}
          name={id}
          value={field}
          id={id}
          placeholder={placeholder}
          onChange={ e=>setField(e.target.value) } 
          {...rest} 
        />
    </div>
  )

}



//////////////////////////////////////////////////////////////
/*
export function PsRenderDialogOld() {
  //const isOpen = PortalStore.useState(s=>s.isOpen)
  const Component = PortalStore.useState(s=>s.component)
  const isOpen = Component === null ? false : true
  console.log('PsRenderDialog, isOpen:', isOpen)

  const portalRoot = document.getElementById("modal-portal")


  // to store local state of input field
  const [code, setCode] = useState('') //input field state

  // so that next time dialog is rendered with empty input fields again..
  function resetState() {
    setCode("")
  }

  function onCancel() {
    PortalStore.currentState.onCancel("dialogClosed")
    //PortalStore.update(s=> { s.isOpen = false } )
    resetState()
  }

  function onSubmit() {
    PortalStore.currentState.onSubmit(code)
    PortalStore.update(s=> { s.isOpen = false } )
    resetState()
  }  

  //if (!isOpen) return null

  const content = PortalStore.currentState.content

  if (!isOpen) return null
  
  return ( isOpen &&  
    <Modal  isOpen={ isOpen } 
            closeFn={ onCancel } 
            portalRoot={ portalRoot }
    >
        <strong>{content.title}</strong>
        <br/>
        <br/>
        <InputFunction id="in1" label={content.inputLabel} field={code} setField={setCode} type={content.inputType} />
        <br/>
        <button onClick={ onSubmit }>{ content.submitButtonLabel }</button>
        <button onClick={ onCancel }>{ content.cancelButtonLabel }</button> 

        <PortalStore.currentState.component />

    </Modal>
  )  
}
*/
//==========


// simplistic dialog
export function SimpleDialog({  resolve, reject, onCancel, onClose, rejectVal=null,
                                title=null, text="",
                                submitLabel="Submit", cancelLabel=null }) {  


  function doCancel() {
    //reject("cancel")
    reject(rejectVal)    
    onClose()

  }

  function doSubmit() {
    resolve("submit")
    onClose()
  }  

  //if (!PortalStore.currentState.compoent === null) return null

  return (
    <>
      { title && <strong>{title}<br/><br/></strong> }
      { text && <p>{text}<br/></p> }

      <br/>
      <button onClick={ doSubmit }>{submitLabel}</button>
      { cancelLabel && <button onClick={ doCancel }>{cancelLabel}</button> }
    </>
  )
}


// simplistic prompt
export function SimplePrompt({  resolve, reject, onCancel, onClose, rejectVal=null,
                                title=null, text=null, label="", initialValue="", placeHolder="", inputType="text",
                                submitLabel="Submit", cancelLabel=null }) {  

  const [in1, setIn1] = useState(initialValue)

  function resetState() {
    setIn1("")
  }

  function doCancel() {
    //reject("cancel")
    reject(rejectVal)
    resetState()
    onClose()

  }

  function doSubmit() {
    resolve(in1)
    resetState()
    onClose()
  }  

  return (
    <>
      { title && <strong>{title}<br/><br/></strong> }
      { text && <p>{text}<br/></p> }

      <InputFunction id="in1" 
        label={label} 
        field={in1} 
        setField={setIn1} 
        type={inputType} 
        placeholder={placeHolder} 
      />
      <br/>
      <button onClick={ doSubmit }>{submitLabel}</button>
      { cancelLabel && <button onClick={ doCancel }>{cancelLabel}</button> }
    </>
  )
}



// render function to be entered into react code somewhere in the app

export function PsRenderDialog(htmlID="modal-portal") {

  const Component = PortalStore.useState(s=>s.component)
  const isOpen = Component === null ? false : true
  //console.log('PsRenderDialog, isOpen:', isOpen)

  //const portalRoot = document.getElementById(htmlID)  // not sure why this does not work, but the literal version below works..
  const portalRoot = document.getElementById("modal-portal")


  function onCancel() {
    //PortalStore.currentState.onCancel("dialogClosed")
    PortalStore.currentState.onCancel()

  }

 
  if (!isOpen) return null
  
  return ( //isOpen && 
    <Modal  isOpen={ isOpen } 
            closeFn={ onCancel } 
            portalRoot={ portalRoot }
    >
        
        <Component />

    </Modal>
  )  
}




// promise based version.. using pullState.. mimicking HTML's prompt / alert
// good for dialogs that are "remote controlled" by another component far away in the app
// can inject props into the rendered dialog
// ... rest props are props for the "component" (e.g. title, text, label, submitLabel, .. depends on the component)
export async function psDialogAsync({ component=null, rejectVal=null, alwaysResolve=false, ...rest }) {

  console.log('psDialogAsync triggered..')

  

  return new Promise( (resolve, reject) => {


    function onClose() {
      PortalStore.update(s=> { s.component = null } )
    }

    function onCancel(ret=rejectVal) {
      onClose()
      if (alwaysResolve) resolve(ret)
      else reject(ret)
    }    

    PortalStore.update( 
      [  
        s=> { s.onCancel=onCancel },
        s=> { s.component=()=>component({ resolve, reject: alwaysResolve? resolve : reject, onCancel, onClose, rejectVal, ...rest }) },
      ] 
    )
    
  })
}

////////////////////////////////////////////////////////////////////////////////////////


// not promise based, not using pullState, but with a onSubmit+onCancel callback and isOpen control from parent
// good for dialogs that happen inside a component, without "remote control" by another component in the app

export function ConfirmationCodeDialog({   
                                          isOpen=true,
                                          title="Confirmation", 
                                          submitButtonLabel="Submit2",
                                          cancelButtonLabel="Cancel2",
                                          onSubmit=()=>null,
                                          onCancel=()=>null,
                                        }) {

  //const [isModalOpen, setModalOpen] = useState(true);
  const [code, setCode] = useState('');
  const [code2, setCode2] = useState('');

  // so that next time dialog is rendered with empty input fields again..
  function resetState() {
    setCode(""); 
    setCode2("");
  }

  return ( isOpen &&  
    <Modal  isOpen={true} 
            closeFn={ () => { onCancel('closePressed'); resetState() }}
            portalRoot={ portalRoot }
/*
            // for "outer" submit/cancel buttons of the modal, as opposed to the "inner" buttons rendered below
            onSubmit={ ()=>onSubmit(code+","+code2) }
            onCancel={ ()=>onCancel("cancelPressed") }
 */
    >
        <strong>{title}</strong>
        <br/>
        <br/>
        <InputFunction id="in1" label="Some Label:" field={code} setField={setCode} />
        <br/>        
        <InputFunction id="in2" label="Other Label:" field={code2} setField={setCode2} />
        <br/>
        <br/>        
        <button onClick={ ()=> { onSubmit(code+","+code2); resetState() } }>{submitButtonLabel}</button>
        <button onClick={ ()=> { onCancel("cancelPressed"); resetState() } }>{cancelButtonLabel}</button>
    </Modal>
  ) 
}


/*

export function PsRenderDialog() {
  const isOpen = PortalStore.useState(s=>s.isOpen)

  //const Content = PortalStore.useState(s=>s.content)  
  const Content = PortalStore.currentState.content
  const [code, setCode] = useState('');

  function onCancel() {
    //e.preventDefault()
    PortalStore.currentState.onCancel("dialogClosed")
    PortalStore.update(s=> { s.isOpen = false } )
  }

  function onSubmit() {
    //e.preventDefault()
    PortalStore.currentState.onSubmit(code)
    PortalStore.update(s=> { s.isOpen = false } )
  }  

  console.log('PsRenderDialog, PortalStore:', PortalStore)
  
  return (  
    <Modal  isOpen={isOpen} 
            closeFn={onCancel} 
            portalRoot={ portalRoot }
    >
        <strong>Some Title</strong>
        <br/>
        <br/>
        <InputFunction key="input1" id="in1" label="Some Label" field={code} setField={setCode} type="text" />
        <br/>
        <button onClick={onSubmit}>{"Submit"}</button>
        <button onClick={onCancel}>{"Cancel"}</button> 


    </Modal>
  )  
}
*/

/*

export default function App() {
  const [isModalOpen, setModalOpen] = useState(false);

  const toggleModal = () => setModalOpen(!isModalOpen);

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden"
      }}
    >
      <button onClick={toggleModal}>open modal</button>

      <Modal isOpen={isModalOpen} closeFn={ ()=>setModalOpen(false) }>
        <p>some text here..</p>
        <button onClick={toggleModal}>close modal</button>
      </Modal>

    </div>
  );
}
*/