/* eslint-disable react/prop-types */
import * as React from 'react';
import Box from './Box';

const LOADING = 'LOADING';
const SUCCESS = 'SUCCESS';
const ERROR = 'ERROR';

export default function LogIn({ api, onSuccess }) {
  const [status, setStatus] = React.useState(SUCCESS);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleSignIn = (e) => {
    e.preventDefault();
    setStatus(LOADING);
    setErrorMessage('');
    api
      .signIn({ email, password })
      .then((data) => {
        setStatus(SUCCESS);
        onSuccess(data.user);
      })
      .catch((err) => {
        console.error(err);
        setStatus(SUCCESS);
        setErrorMessage(err.message);
      });
  };

  return (
    <Box
      as="form"
      m="auto"
      width="12em"
      display="flex"
      flexDirection="column"
      onSubmit={handleSignIn}
    >
      <label>
        <Box>Email</Box>
        <input
          type="text"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
      </label>
      <label>
        <Box>Password</Box>
        <input
          type="password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />
      </label>
      <Box m="0.5em 0" as="button" type="submit" disabled={status === LOADING}>
        Submit
      </Box>
      {status === ERROR && (
        <Box bg="tomato" color="white" fontStyle="bold" p="0.5em">
          {errorMessage}
        </Box>
      )}
    </Box>
  );
}
