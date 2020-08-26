import * as React from "react";


//
// returns:
//
// error:
// showError: (a function)

const useErrorHandler = (initialState=null) => {
    const [error, setError] = React.useState(initialState);


    const showError = (errorMessage=null) => {
      setError(errorMessage);

      window.setTimeout(() => {
        setError(null);
      }, 3000);
    };

    return { error, showError };
  };

  export default useErrorHandler;
