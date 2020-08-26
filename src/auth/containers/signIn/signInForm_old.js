import * as React from "react";
//import { Button, Form, FormGroup, Label, Input } from "reactstrap";

/** Context consumer */
import { authContext } from "../../contexts/AuthContext";

/** Presentation/UI */
//import { SignUpContainer } from "../../../AppStyles.styles.tw";
import ErrorMessage from "../../components/ErrorMessage";

/** Custom Hooks */
import useErrorHandler from "../../custom-hooks/ErrorHandler";

/** Utils */
import * as auth from "../../helpers/auth";
import { validateForm } from "./helpers";

/** router **/
import { useHistory } from 'react-router-dom';  // added by chris, probably not the best place to put this..




const SignInForm = function() {

  const history = useHistory();    // added by chris

  const [email, setEmail] = React.useState("");
  const [formUsername, setFormUsername] = React.useState("");

  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const { error, showError } = useErrorHandler(null);

  const {
    openConfirmationCodeModal,
    setUsername,
    setUserId,
    setTimestamp,
    setAuthStatus
  } = React.useContext(authContext);

  return (
    <SignUpContainer>
      <form
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        onSubmit={e => {
          e.preventDefault();
          //if (validateForm({ email, password, showError })) {
          if (validateForm({ username:formUsername, password, setError:showError })) {

            auth.signIn({
              email,    // not used for auth
              username:formUsername,    // used for auth
              password,
              history, // don t have that yet (probably the redux router history)
              setError:showError,
              setLoading,
              setUsername,
              setTimestamp,
              setAuthStatus
            });

          }
        }}
      >

        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="formUsername">
                Username
            </label>
            <input
              type="text"
              name="formUsername"
              value={formUsername}
              id="formUsername"
              placeholder=""
              onChange={e => setFormUsername(e.target.value)}
            />
        </div>





        <div className="fullFormDiv">
            <label className="fullFomLabel" htmlFor="password">
                Password
            </label>
            <input
              type="password"
              name="password"
              value={password}
              id="password"
              onChange={e => setPassword(e.target.value)}
            />
        </div>


        <br />


        <button type="submit" className="inline-block">
          {loading ? "Loading..." : "Sign In"}
        </button>

        <button onClick={ ()=> { history.push("/sign-up"); } } className="inline-block">
          Sign Up
        </button>

        {error && <ErrorMessage errorMessage={error} />}

      </form>
    </SignUpContainer>
  );
};

export default SignInForm;

/*

        <FormGroup>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            name="email"
            value={email}
            id="email"
            placeholder="yourname@entelect.co.za"
            onChange={e => setEmail(e.target.value)}
          />
        </FormGroup>

*/
