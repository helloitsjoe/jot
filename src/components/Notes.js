import * as React from 'react';
import Box from './Box';
import Tag from './Tag';
import Button from './Button';
import { SUCCESS, ERROR, LOADING } from '../constants';

export default function Notes({ api }) {
  const [status, setStatus] = React.useState(SUCCESS);
  const [notes, setNotes] = React.useState([]);
  const [errorMessage, setErrorMessage] = React.useState('');
  const [activeTags, setActiveTags] = React.useState(new Set());

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

  const handleDeleteNote = (id) => {
    api
      .deleteNote({ id })
      .then(() => {
        setNotes((p) => p.filter((n) => n.id !== id));
        setStatus(SUCCESS);
      })
      .catch((err) => {
        setErrorMessage(err.message);
        setStatus(ERROR);
      });
  };

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

  const filteredNotes = activeTags.length
    ? sortedNotes.filter(({ tags }) => {
        return tags.some(({ id }) => activeTags.some((a) => a.id === id));
      })
    : sortedNotes;

  return (
    <Box>
      {activeTags.length > 0 && (
        <Box>
          <Box>Filtering by:</Box>
          {activeTags.map(({ text, id, color }) => {
            return (
              <Box key={id}>
                <Tag
                  color={color}
                  onSelect={() =>
                    setActiveTags((a) => a.filter((t) => t.id !== id))
                  }
                >
                  {text}
                </Tag>
              </Box>
            );
          })}
        </Box>
      )}
      {filteredNotes.map(({ text, id, tags }) => {
        return (
          <Box
            key={id}
            borderRadius="0.5em"
            border="1px solid blueviolet"
            display="flex"
            p="1em"
            m="0.5em 0"
            width="50%"
          >
            <Box display="flex" flexDirection="column">
              <Box>{text}</Box>
              <Box m="0.5em 0" display="flex" gap="1em">
                {tags.map((tag) => (
                  <Tag
                    key={tag.text}
                    color={tag.color}
                    onSelect={() =>
                      setActiveTags((a) => [...new Set([...a, tag])])
                    }
                  >
                    {tag.text}
                  </Tag>
                ))}
              </Box>
            </Box>
            <Button
              textOnly
              onClick={() => handleDeleteNote(id)}
              display="flex"
              justifySelf="flex-end"
              alignSelf="flex-start"
            >
              X
            </Button>
          </Box>
        );
      })}
    </Box>
  );
}
