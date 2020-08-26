import * as React from "react";
import styled from "styled-components";

// used by authentication components

const ErrorMessage = styled.p`
  text-align: center;
  margin-top: 10px;
  color: rgba(200, 0, 0, 0.8);
`;

export const ErrorMessageContainer = function ({
  errorMessage,
}) {
  return <ErrorMessage>{errorMessage}</ErrorMessage>;
};

export default ErrorMessageContainer;
