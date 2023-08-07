import * as React from 'react';
import LogIn from './LogIn';
import Box from './Box';
import { SUCCESS, ERROR, LOADING } from '../constants';

const AuthContext = React.createContext();

export default function AuthProvider({ api, children }) {
  const [user, setUser] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [status, setStatus] = React.useState(LOADING);

  // TODO: Actually sign user out
  const signOut = React.useCallback(() => setUser(null), []);
  const state = React.useRef({ signOut });

  React.useEffect(() => {
    api
      .getUser()
      .then((res) => {
        setUser(res);
        setStatus(SUCCESS);
      })
      .catch((err) => {
        setErrorMessage(err.message);
        setStatus(ERROR);
      });
  }, [api]);

  if (status === LOADING) {
    return (
      <Box display="flex" justifyContent="center">
        Loading user...
      </Box>
    );
  }

  if (!user) {
    return (
      <>
        <LogIn
          api={api}
          onSuccess={(res) => {
            setUser(res);
            setStatus(SUCCESS);
          }}
        />
        {status === ERROR && (
          <Box display="flex" justifyContent="center" color="red">
            {errorMessage}
          </Box>
        )}
      </>
    );
  }

  if (status === ERROR) {
    return (
      <Box display="flex" justifyContent="center" color="red">
        {errorMessage}
      </Box>
    );
  }

  return (
    <AuthContext.Provider value={state.current}>
      {children(state.current)}
    </AuthContext.Provider>
  );
}
