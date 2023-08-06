import * as React from "react";
import Box from "./Box";
import { SubmitButton } from "./Button";
import Input from "./Input";

const LOADING = "LOADING";
const SUCCESS = "SUCCESS";
const ERROR = "ERROR";

export default function LogIn({ api, onSuccess }) {
  const [status, setStatus] = React.useState(SUCCESS);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleSignIn = (e) => {
    e.preventDefault();
    setStatus(LOADING);
    setErrorMessage("");
    api
      .signIn({ email, password })
      .then((data) => {
        setStatus(SUCCESS);
        onSuccess(data.user);
      })
      .catch((err) => {
        console.error(err);
        setStatus(ERROR);
        if (err.status >= 400 && err.status < 500) {
          setErrorMessage("Invalid username or password");
        } else {
          setErrorMessage(err.message);
        }
      });
  };

  return (
    <Box
      as="form"
      m="1em auto"
      width="12em"
      display="flex"
      flexDirection="column"
      gap="1em"
      onSubmit={handleSignIn}
    >
      <Input
        required
        label="Email"
        type="email"
        width="100%"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
      />
      <Input
        required
        type="password"
        label="Password"
        width="100%"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
      />
      <SubmitButton disabled={status === LOADING}>Submit</SubmitButton>
      {status === ERROR && (
        <Box bg="tomato" color="white" fontStyle="bold" p="0.5em">
          {errorMessage}
        </Box>
      )}
    </Box>
  );
}
