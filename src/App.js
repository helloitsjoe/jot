/* eslint-disable react/prop-types */
import * as React from 'react';
import Box from './components/Box';
import Tag from './components/Tag';
import LogIn from './components/LogIn';
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

export default function App({ api }) {
  // TODO: Move this to context?
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    api.getUser().then((data) => {
      setUser(data.user);
    });
  }, [api]);

  console.log('user', user);

  if (!user) {
    return <LogIn api={api} onSuccess={setUser} />;
  }

  return <Main api={api} onSignOut={() => setUser(null)} />;
}

function Main({ api, onSignOut }) {
  const [note, setNote] = React.useState('');
  const [tag, setTag] = React.useState('');
  const [tags, setTags] = React.useState([]);
  const [status, setStatus] = React.useState(LOADING);
  const [recentTags, setRecentTags] = React.useState([]);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleNoteChange = (e) => setNote(e.target.value);
  const handleTagChange = (e) => setTag(e.target.value);
  const handleAddTagToNote = (newTag) => setTags((prev) => [...prev, newTag]);
  const handleAddRecentTag = (newTag) =>
    setRecentTags((prev) => [...prev, newTag]);

  const addNewTag = (e) => {
    e.preventDefault();
    const color = getRandomColor();
    handleAddRecentTag({ text: tag, color });
    api
      .addTag({ text: tag, color })
      .then((res) => {
        console.log(res);
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
    api
      .deleteTag({ id })
      .then(() => {
        setRecentTags((r) => r.filter((t) => t.id !== id));
      })
      .catch(({ message }) => setErrorMessage(message));
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    const tagIds = tags.map(({ id }) => id);
    api.addNote(note, tagIds).catch((err) => {
      setErrorMessage(err.message);
    });
  };

  const handleSignOut = () => {
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
    // TODO: swr
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
  }, [api]);

  return (
    <Box width="700px" m="2em auto">
      <Box as="form" onSubmit={handleAddNote} m="1em 0">
        <Box>
          <Input
            label={<h3>Add a note</h3>}
            value={note}
            onChange={handleNoteChange}
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
            <Box>
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
      <Box m="1em 0">
        <h3>Existing notes</h3>
        <Notes api={api} />
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
