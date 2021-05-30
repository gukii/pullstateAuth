import * as React from "react";

// stores and showes an error message for a given amount of time
// returns an error and showError Fn as hook results

const useErrorHandler = (initialState=null, timeoutDuration=4000) => {
    const [error, setError] = React.useState(initialState);


    const showError = (errorMessage=null) => {
      let timeoutHandler

      clearTimeout(timeoutHandler)
      setError(errorMessage);

      timeoutHandler = window.setTimeout(() => {
        setError(null);
      }, timeoutDuration);
    };

    return { error, showError };
  };

  export default useErrorHandler;
