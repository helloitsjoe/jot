import * as React from 'react';
import Box from './Box';
import { SUCCESS, ERROR, LOADING } from '../constants';

export default function Notes({ api }) {
  const [status, setStatus] = React.useState(SUCCESS);
  const [notes, setNotes] = React.useState([]);
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    setStatus(LOADING);
    api
      .loadNotes()
      .then((fetchedNotes) => {
        console.log('res', fetchedNotes);
        setNotes(fetchedNotes);
        setStatus(SUCCESS);
      })
      .catch((err) => {
        setErrorMessage(err.message);
        setStatus(ERROR);
      });
  }, []);

  if (status === LOADING) {
    return <Box>Loading notes...</Box>;
  }

  if (status === ERROR) {
    return (
      <Box color="white" bg="tomato">
        {errorMessage}
      </Box>
    );
  }

  return notes.map(({ text, id }) => {
    return <Box key={id}>{text}</Box>;
  });
}
