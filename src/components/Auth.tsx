import * as React from 'react';
import LogIn from './LogIn';
import Box from './Box';
import type { API, User } from '../api';
import { SUCCESS, ERROR, LOADING } from '../constants';

const AuthContext = React.createContext<{ signOut: () => void }>({
  signOut: () => {},
});

export default function AuthProvider({
  api,
  children,
}: {
  api: API;
  children: (auth: { signOut: () => void }) => React.ReactNode;
}) {
  const [user, setUser] = React.useState<User>(null);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [status, setStatus] = React.useState(LOADING);

  const signOut = React.useCallback(() => {
    setUser(null);
    api.signOut();
  }, []);

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
