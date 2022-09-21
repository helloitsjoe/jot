import * as React from 'react';
import onSwipe, { Directions } from 'swipey';
import Box from './components/Box';
import Tag from './components/Tag';
import Notes from './components/Notes';
import Input from './components/Input';
import { SubmitButton } from './components/Button';
import { SUCCESS, ERROR, LOADING } from './constants';

const getRandomColor = () => {
  const colors = [
    'tomato',
    'cornflowerblue',
    'blueviolet',
    'orange',
    'lime',
    'slateblue',
    'teal',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const initSwipeHandlers = () => {
  const reload = () => window.location.reload(true);
  const offDown = onSwipe(Directions.DOWN, reload, { fromTop: true });

  return () => offDown();
};

export default function App({ api, onSignOut }) {
  const [note, setNote] = React.useState('');
  const [tag, setTag] = React.useState('');
  const [tags, setTags] = React.useState([]);
  const [status, setStatus] = React.useState(LOADING);
  const [recentTags, setRecentTags] = React.useState([]);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleNoteChange = (e) => setNote(e.target.value);
  const handleTagChange = (e) => setTag(e.target.value.toLowerCase());
  const handleAddTagToNote = (newTag) => setTags((prev) => [...prev, newTag]);
  const handleAddRecentTag = (newTag) =>
    setRecentTags((prev) => [...prev, newTag]);
  // Quick and dirty way to rerender Notes, make this better.
  const [count, setCount] = React.useState(0);

  const inputRef = React.useRef();

  const addNewTag = (e) => {
    e.preventDefault();
    setErrorMessage('');

    api
      .addTag({ text: tag, color: getRandomColor() })
      .then((res) => {
        handleAddRecentTag(res[0]);
        // TODO: Add tag to note, make sure id propagates
        // handleAddTagToNote({ text, color });
        setTag('');
      })
      .catch((err) => {
        setRecentTags((p) => p.filter((r) => r.text !== tag));
        setTags((p) => p.filter((r) => r.text !== tag));
        setErrorMessage(err.message);
      });
  };

  const handleDeleteTag = (id) => {
    // TODO: Confirm deletion
    setErrorMessage('');
    api
      .deleteTag({ id })
      .then(() => {
        setRecentTags((r) => r.filter((t) => t.id !== id));
      })
      .catch(({ message }) => setErrorMessage(message));
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    setErrorMessage('');
    const tagIds = tags.map(({ id }) => id);
    api
      .addNote(note, tagIds)
      .then(() => {
        setNote('');
        setTags([]);
        setCount((c) => c + 1);
      })
      .catch((err) => {
        setErrorMessage(err.message);
      });
  };

  const handleSignOut = () => {
    setErrorMessage('');
    api
      .signOut()
      .then(() => {
        onSignOut();
      })
      .catch((err) => {
        setErrorMessage(err.message);
      });
  };

  React.useEffect(() => {
    // TODO NEXT: swr
    setStatus(LOADING);
    api
      .loadTags()
      .then((fetchedRecentTags) => {
        setStatus(SUCCESS);
        setRecentTags(fetchedRecentTags);
      })
      .catch((err) => {
        setStatus(ERROR);
        setErrorMessage(err.message);
      });

    return initSwipeHandlers();
  }, [api]);

  return (
    <Box maxWidth="500px" m="2em auto">
      <Box as="form" onSubmit={handleAddNote} m="1em 0">
        <Input
          width="auto"
          label={<h3>Add a note</h3>}
          value={note}
          onChange={handleNoteChange}
          autoFocus
        />
        <SubmitButton>Submit</SubmitButton>
        {tags.length > 0 && (
          <Box>
            {tags.map(({ text, color }) => {
              return (
                <Tag
                  key={text}
                  color={color}
                  onDelete={() => {
                    setTags((p) => p.filter((t) => t.text !== text));
                  }}
                >
                  {text}
                </Tag>
              );
            })}
          </Box>
        )}
      </Box>
      <Box as="form" onSubmit={addNewTag} m="1em 0">
        <Input
          label={<h3>Add a tag</h3>}
          value={tag}
          onChange={handleTagChange}
          list="tags"
        />
        <datalist id="tags">
          {recentTags.map((t) => (
            <option key={t.text} value={t.text}>
              {t.text}
            </option>
          ))}
        </datalist>
        <SubmitButton>Add a new tag</SubmitButton>
        {errorMessage && (
          <Box color="white" bg="red">
            {errorMessage}
          </Box>
        )}
        {(() => {
          if (status === LOADING) {
            return 'Loading...';
          }

          return recentTags.length > 0 ? (
            <Box m="0.5em 0" display="flex" flexWrap="wrap" gap="1em">
              {recentTags
                .filter(({ text }) => !tag || text.includes(tag))
                .map(({ id, text, color }) => {
                  return (
                    <Tag
                      id={id}
                      key={id}
                      color={color}
                      onDelete={(e) => {
                        e.stopPropagation();
                        handleDeleteTag(id);
                      }}
                      onSelect={handleAddTagToNote}
                    >
                      {text}
                    </Tag>
                  );
                })}
            </Box>
          ) : (
            <p>No recent tags!</p>
          );
        })()}
      </Box>
      <Box m="3em 0">
        <h3>Existing notes</h3>
        <Notes api={api} key={count} />
      </Box>
      <Box
        as="button"
        border="0"
        bg="transparent"
        color="white"
        textDecoration="underline"
        onClick={handleSignOut}
      >
        Sign out
      </Box>
    </Box>
  );
}
