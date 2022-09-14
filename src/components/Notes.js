/* eslint-disable react/prop-types */
import * as React from 'react';
import Box from './Box';
import Tag from './Tag';
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
  }, [api]);

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

  // Most recent first
  const sortedNotes = [...notes].sort((a, b) =>
    a.created_at < b.created_at ? 1 : -1
  );

  return sortedNotes.map(({ text, id, tags }) => {
    return (
      <Box key={id}>
        {text}
        {tags.map((tag) => (
          <Tag key={tag.text} color={tag.color}>
            {tag.text}
          </Tag>
        ))}
      </Box>
    );
  });
}
