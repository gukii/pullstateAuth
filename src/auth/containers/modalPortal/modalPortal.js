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


  // append the Ref-ed Div to the portalRoot
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



export const sleep = m => new Promise(r => setTimeout(r, m))



// renders the Modal
// has eventListener for inside / outside modal click/touch that triggers fadeOut / onCancel / onClose
export function Modal({ isOpen=true,
                        closeFn=null,
                        portalRoot=undefined,

                        children,

                        screenBgColor="rgb(130, 39, 39, 0.95)", // rgba(0,0,0,0.6)
                        modalBgColor="#FFF",
                        modalFrameColor="#F44949",
                        modalFrameWidth="1.5em",
                        modalTxtColor="",
                        screenBgImage="none",

                        onSubmit=null,                   //optional
                        onCancel=null,                   //optional
                        submitButtonLabel="Submit",
                        cancelButtonLabel="Cancel",
                      }) {

    ///// start of detect inside/outside clicks.. to dismiss dialog

    const modalRef = useRef(null);


    useEffect( ()=> {

      // setup / remove event listeners for mouse / touch
      document.addEventListener('mousedown', handleClick, false)
      document.addEventListener('touchstart', handleClick, false)

      return () => {
        document.removeEventListener('mousedown', handleClick, false)
        document.removeEventListener('touchend', handleClick, false)
      }

    },[modalRef, onCancel, closeFn] )



    // fading out the element, sleeping, then it can be removed (by setting isOpen to false = preventing)
    async function fadeOut() {
      modalRef.current.classList.toggle('fadeDownReverse')
      await sleep(250)  // gotta be shorter than the css animation duration of fadeDownReverse (in index.css)
    }


    const handleClick = async(e) => {
      if (!modalRef.current) return

      // if the click is within the dialog window, and not on the window's "X", return early
      if (modalRef.current.contains(e.target) && e.target.className !== "modal-close") {
        //console.log('handleClick: clicked inside, do nothing..e:', e)
        return
      }

      //console.log('clicked outside, or on "X"..', modalRef)
      await fadeOut()

      if (onCancel !== null) {
        //console.log('calling onCancel within handleClick')
        onCancel()
      }
      closeFn()
    }

    ///// end of click inside/outside detection



  return (
    //isOpen &&
    <RenderOncePortalWrapper portalRoot={portalRoot}>
      <div className="fadeInOnly"
        style={{
          /*
          position: "absolute",
          top: 0,
          left: 0,
          height: "100vh",
          width: "100vw",
          padding: "0px",
          backgroundColor: "rgba(0,0,0,0.6)"  // color of area around modal box
*/

          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100vw",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          background: screenBgImage && screenBgImage !== "none" ? null : screenBgColor, //"rgb(130, 39, 39, 0.95)", // "rgba(0, 0, 0, 0.6)",

          //another background image: "https://img.xcitefun.net/users/2013/11/344227,xcitefun-rocky-mountains-3.jpg"

          backgroundSize: screenBgImage && screenBgImage !== "none" ? "cover" : "cover",

          backgroundImage: `url(${screenBgImage})`,
          backgroundPosition: screenBgImage && screenBgImage !== "none" ? "center" : "center",
          //backgroundRepeat: screenBgImage && screenBgImage !== "none" ? null : "no-repeat",

          zIndex: 999
        }}
      >
          <div
            style={{
              //padding: "20%",
            }}
          >

            <div  ref={modalRef}
                  className={"fadeDown"}
                  style={{
                    /*
                    width: "100%",
                    background: "gray",
                    */

                    position: "relative",
                    width: "100%",
                    maxWidth: "600px",
                    maxHeight: "800px",
                    padding: modalFrameWidth,
                    margin: "1em",
                    background: modalFrameColor //"#F44949"

                  }}
            >

                { closeFn !== null &&
                  <button
                    className="modal-close"
                    style={{
                      fontSize: "30px", /* this is only because we use unicode for the X in this case */
                      position: "absolute",
                      top: "3px",
                      right: "3px",
                      background: modalFrameColor, //"#F44949",
                      color: modalTxtColor,
                      border: 0
                    }}
                  >&#x2715;</button>
                }


                <div  style={{
                      background: modalBgColor, //"#FFF", //"#FF7F50",
                      color: modalTxtColor,
                      padding: "5%",
                      textAlign: "center"
                    }}
                >
                    { children }
                </div>


                { onSubmit !== null && <button onClick={ ()=>onSubmit() }>{submitButtonLabel}</button> }
                { onCancel !== null && <button onClick={ ()=>onCancel() }>{cancelButtonLabel}</button> }
            </div>

          </div>
      </div>
    </RenderOncePortalWrapper>
  )
}


// general INPUT function, rerenders (also the parent) on every input key press.
export function InputFunction({ id="", label="", field, setField, type="text", placeholder="", ...rest }) {

  return(
    <div className="fullFormDiv">
        <label className="fullFomLabel" htmlFor={id}>
            {label} &nbsp;
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
//
// to be uses as "component" within function call psDialogAsync
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
      <button onClick={ doSubmit }>{submitLabel}</button>&nbsp; &nbsp;
      { cancelLabel && <button onClick={ doCancel }>{cancelLabel}</button> }
    </>
  )
}


// simplistic prompt for TWO input values
//
// to be uses as "component" within function call psDialogAsync
export function Simple2Prompt({ resolve, reject, onCancel, onClose, rejectVal=null,
                                title=null, text=null, label="", initialValue="", placeHolder="", inputType="text",
                                initialValue2="", label2="", placeHolder2="", inputType2="text",
                                submitLabel="Submit", cancelLabel=null }) {

  const [in1, setIn1] = useState(initialValue)
  const [in2, setIn2] = useState(initialValue2)

  function resetState() {
    setIn1("")
    setIn2("")
  }

  function doCancel() {
    //reject("cancel")
    reject([rejectVal, rejectVal])
    resetState()
    onClose()

  }

  function doSubmit() {
    resolve([in1, in2])
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
      <InputFunction id="in2"
        label={label2}
        field={in2}
        setField={setIn2}
        type={inputType2}
        placeholder={placeHolder2}
      />
      <br/>
      <button onClick={ doSubmit }>{submitLabel}</button>&nbsp; &nbsp;
      { cancelLabel && <button onClick={ doCancel }>{cancelLabel}</button> }
    </>
  )
}




// simplistic prompt for Login with username / password, with link to signUp
// resolve, rejected, onClose, onCancel get injected by parent component "psDialogAsync"
//
// currently only returning username / password, no login flow running within this function yet.. but working on it..
//
// to be uses as "component" within function call psDialogAsync
export function SimpleLoginPrompt({ resolve, reject, onCancel, onClose, rejectVal=null,
                                title=null, text=null, label="", initialValue="", placeHolder="", inputType="text",
                                initialValue2="", label2="", placeHolder2="", inputType2="text",
                                error="", signUpLabel="SignUp", signUpUrl="#",
                                submitLabel="Submit", cancelLabel=null,
                                buttonSpacing="1em",
                                doLogin=null }) {

  const [in1, setIn1] = useState(initialValue)
  const [in2, setIn2] = useState(initialValue2)

  function resetState() {
    setIn1("")
    setIn2("")
  }

  function doCancel() {
    //reject("cancel")
    reject([rejectVal, rejectVal])
    resetState()
    onClose()

  }

  function doSubmit() {
    resolve([in1, in2])
    resetState()
    onClose()
  }


  //      { loading && <div className="loader centered"/> }
/*
  { false && loading && <div className="loader-mini" style={{ float:"right" }}/> }

  { false && loading && <div className="loader-mini" style={{ display:"inline-block" }}/> }

  { false && <button onClick={ doSubmit } style={{ display:"inline-block", marginLeft:"1em" }}>{submitLabel}</button> }
*/

  const loading = true

  return (
    <>


      { title && <div style={{ fontSize:"1.2em", fontWeight: 900, marginTop:".5em", marginBottom:"1em" }}>{title}</div> }

      { text && <div style={{ marginBottom:"1em" }}>{text}</div> }


      <InputFunction id="in1"
        label={label}
        field={in1}
        setField={setIn1}
        type={inputType}
        placeholder={placeHolder}
      />
      <br/>
      <InputFunction id="in2"
        label={label2}
        field={in2}
        setField={setIn2}
        type={inputType2}
        placeholder={placeHolder2}
      />
      { error && <div style={{ color:"red"}}>{error}<br/></div> }
      <br/>


      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>


        <button onClick={ doSubmit } style={{ display:"flex", alignItems: "center", marginLeft:buttonSpacing }}>
          { loading && <div className="loader-supermini" style={{ display:"inline-block", marginRight:".5em" }}/> }
          { submitLabel }
        </button>


        { cancelLabel && <button onClick={ doCancel } style={{ display:"inline-block", marginLeft:buttonSpacing }}>
            { cancelLabel }
          </button>
        }

        { signUpLabel && <span style={{ display:"inline-block", marginLeft:buttonSpacing }}>
            <form action={ signUpUrl }>
                <input type="submit" value={ signUpLabel ? signUpLabel : "SignUp" } />
            </form>
          </span>
        }
      </div>
    </>
  )
}




// render function to be entered into react code somewhere in the app

export function PsRenderDialog( htmlID="modal-portal" ) {

  const Component = PortalStore.useState(s => s.component)
  //const modalProps = PortalStore.useState(s => s.modalProps)  // to override standard props in Modal, such as text color, background image, ...
  const modalProps = PortalStore.currentState.modalProps  // to override standard props in Modal, such as text color, background image, ...

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

            modalTxtColor="black"
            modalFrameColor="#EFEFEF"
            modalBgColor="white"
            screenBgColor="rgba(0,0,0,0.6)"

            modalFrameColor="#556B2F"

            modalTxtColor="white"
            modalFrameColor="#32A852"
            modalBgColor="#1B5B2D"
            screenBgColor="rgba(0,0,0,0.8)"

            modalFrameWidth=".7em"
            screenBgImage="https://eskipaper.com/images/mountains-1.jpg"

            { ...modalProps }
    >

        <Component />

    </Modal>
  )
}




// promise based version.. using pullState.. mimicking HTML's prompt / alert
// good for dialogs that are "remote controlled" by another component far away in the app
// can inject props into the rendered dialog
// ... rest props are props for the "component" (e.g. title, text, label, submitLabel, .. depends on the component)
export async function psDialogAsync({ component=null, rejectVal=null, alwaysResolve=false, modalProps=null, ...rest }) {

  console.log('psDialogAsync triggered..')


  return new Promise( (resolve, reject) => {

      function onClose() {
        PortalStore.update( s=> { s.component = null } )
      }

      function onCancel( returnVal=rejectVal ) {
        console.log('psDialogAsync onCancel called!!')
        onClose()
        if ( alwaysResolve ) resolve( returnVal )
        else reject( returnVal )
      }

      PortalStore.update(
        [
          s=> { s.onCancel=onCancel },
          s=> { s.component=()=>component({ resolve, reject: alwaysResolve? resolve : reject, onCancel, onClose, rejectVal, ...rest }) },

          s=> { s.modalProps=modalProps },  // e.g. backgroundImage, ...
        ]
      )

  })
}

// promise based prompt.
// same as "psDialogAsync", just with alwaysResolve = true
// to improve readablitly between psDialogAsync and psPromptAsync.
// no try / catch necessary
export async function psPromptAsync(props) {

  console.log('psPromptAsync triggered..')

  return psDialogAsync({
    ...props,
    alwaysResolve:true
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

        <button onClick={ ()=> {
            onSubmit(code+","+code2);
            resetState()
          }
        }>
          {submitButtonLabel}
        </button>

        <button onClick={ ()=> {
            onCancel("cancelPressed");
            resetState()
          }
        }>
          {cancelButtonLabel}
        </button>

    </Modal>
  )
}


/*

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

      // setup / remove event listeners for mouse / touch
      document.addEventListener('mousedown', handleClick, false)
      document.addEventListener('touchstart', handleClick, false)

      return () => {
        document.removeEventListener('mousedown', handleClick, false)
        document.removeEventListener('touchend', handleClick, false)
      }

    },[modalRef, onCancel, closeFn])



    // fading out the element, sleeping, then it can be removed (by setting isOpen to false = preventing)
    async function fadeOut() {
      modalRef.current.classList.toggle('fadeDownReverse')
      await sleep(250)  // gotta be shorter than the css animation duration of fadeDownReverse (in index.css)
    }


    const handleClick = async(e) => {
      if (!modalRef.current) return

      // if the click is within the dialog window, and not on the window's "X", return early
      if (modalRef.current.contains(e.target) && e.target.className !== "modal-close") {
        //console.log('handleClick: clicked inside, do nothing..e:', e)
        return
      }

      //console.log('clicked outside, or on "X"..', modalRef)
      await fadeOut()

      if (onCancel !== null) {
        //console.log('calling onCancel within handleClick')
        onCancel()
      }
      closeFn()
    }

    ///// end of click inside/outside detection



  return (
    //isOpen &&
    <RenderOncePortalWrapper portalRoot={portalRoot}>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100vh",
          width: "100vw",
          padding: "0px",
          backgroundColor: "rgba(0,0,0,0.6)"  // color of area around modal box
        }}
      >
          <div
            style={{
              padding: "20%",
            }}
          >

            <div  ref={modalRef}
                  className={"fadeDown"}
                  style={{
                    width: "100%",
                    background: "gray",
                  }}
            >

                { closeFn !== null &&
                  <button
                    className="modal-close"
                  >X</button>
                }


                <div  style={{
                      background: "white",
                      padding: "5%",
                      textAlign: "center"
                    }}
                >
                    { children }
                </div>


                { onSubmit !== null && <button onClick={ ()=>onSubmit() }>{submitButtonLabel}</button> }
                { onCancel !== null && <button onClick={ ()=>onCancel() }>{cancelButtonLabel}</button> }
            </div>

          </div>
      </div>
    </RenderOncePortalWrapper>
  )
}









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
