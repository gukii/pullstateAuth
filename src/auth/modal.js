import * as React from "react";
import * as ReactDOM from "react-dom";

//import { ModalWrapper } from "../AppStyles.styles.tw";

// used by authentication components (signIn, signUp, ..)



const GlobalModalContainer = function ({
  title,
  toggleModal,
  modal,
  //largeModal,
  //mediumModal,
  modalDisplay,
}) {
  //const [showModal, setShowModal] = useState(modal);
  return (
    <>

      {modal ? (
          <div className="modal rounded-lg shadow-lg bg-blue-200 ">

            {/*header*/}
            <div class="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t">

              <div class="text-center font-semibold">
                {title}
              </div>


                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => toggleModal() }
                  >
                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
            </div>


            {/*body*/}
            <div class="p-4 relative">

              {modalDisplay}

            </div>



            {/*footer*/}



          </div>

      ) : null}
    </>
  );
}

function GlobalModal(props) {
  return ReactDOM.createPortal(
    <GlobalModalContainer {...props} />,
    (document.getElementById("modal")) ||
      document.createElement("div") // for testing purposes
  );
}

export default GlobalModal;


/*

      <button
        className="bg-pink-500 text-white active:bg-pink-600 font-bold uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1"
        type="button"
        style={{ transition: "all .15s ease" }}
        onClick={() => toggleModal()}
      >
        {title}
      </button>











      const GlobalModalContainer = function ({
        title,
        toggleModal,
        modal,
        //largeModal,
        //mediumModal,
        modalDisplay,
      }) {
        //const [showModal, setShowModal] = useState(modal);
        return (
          <>

            {modal ? (
              <ModalWrapper>
                <div className="modal rounded-lg shadow-lg bg-blue-200 ">

                  <div class="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t">

                    <div class="text-center font-semibold">
                      {title}
                    </div>


                        <button
                          className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                          onClick={() => toggleModal() }
                        >
                          <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                            ×
                          </span>
                        </button>
                  </div>


                  <div class="p-4 relative">

                    {modalDisplay}

                  </div>






                </div>
              </ModalWrapper>
            ) : null}
          </>
        );
      }

      function GlobalModal(props) {
        return ReactDOM.createPortal(
          <GlobalModalContainer {...props} />,
          (document.getElementById("modal")) ||
            document.createElement("div") // for testing purposes
        );
      }

      export default GlobalModal;







*/
