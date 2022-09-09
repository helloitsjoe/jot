/* eslint-disable react/prop-types */
import * as React from 'react';
import Box from './components/Box';
import Tag from './components/Tag';
import LogIn from './components/LogIn';

const SUCCESS = 'success';
const ERROR = 'error';
const LOADING = 'loading';

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

  return <Main api={api} />;
}

function Main({ api }) {
  const [note, setNote] = React.useState('');
  const [tag, setTag] = React.useState('');
  const [tags, setTags] = React.useState([]);
  const [status, setStatus] = React.useState(LOADING);
  const [recentTags, setRecentTags] = React.useState([]);
  const [errorMessage, setErrorMessage] = React.useState('');

  const handleNoteChange = (e) => setNote(e.target.value);
  const handleTagChange = (e) => setTag(e.target.value);
  const handleAddTagToNote = (newTag) => setTags((prev) => [...prev, newTag]);

  const addNewTag = (e) => {
    e.preventDefault();
    const color = getRandomColor();
    handleAddTagToNote({ text: tag, color });
    api.addTag({ text: tag, color }).catch((err) => {
      setErrorMessage(err.message);
    });
  };

  const handleDeleteTag = (id) => {
    api
      .deleteTag({ id })
      .then(() => {
        setRecentTags((r) => r.filter((t) => t.id !== id));
      })
      .catch((err) => {
        setErrorMessage(err.message);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api.addNote(note, tags).catch((err) => {
      setErrorMessage(err.message);
    });
  };

  const handleSignOut = () => {
    api.signOut().catch((err) => {
      setErrorMessage(err.message);
    });
  };

  React.useEffect(() => {
    // TODO: swr
    setStatus(LOADING);
    api
      .loadTags()
      .then((fetchedRecentTags) => {
        console.log('fetchedRecentTags', fetchedRecentTags);
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
      <Box as="form" onSubmit={handleSubmit}>
        <h1>Jot!</h1>
        <Box>
          <h2>Note</h2>
          <label>
            <Box>Add a note</Box>
            <input value={note} onChange={handleNoteChange} />
          </label>
          <button type="submit">Submit</button>
          {tags.length > 0 && (
            <Box>
              {tags.map(({ text, color }) => {
                return (
                  <Tag key={text} color={color} onSelect={handleAddTagToNote}>
                    {text}
                  </Tag>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>
      <Box as="form" onSubmit={addNewTag}>
        <h2>Tags</h2>
        <label>
          <Box>Add a tag</Box>
          {/* TODO: Dropdown offers existing tags, filter on type */}
          <input value={tag} onChange={handleTagChange} />
          <button type="submit">Add Tag</button>
        </label>
        {errorMessage && (
          <Box color="white" bgColor="red">
            {errorMessage}
          </Box>
        )}
        {(() => {
          if (status === LOADING) {
            return 'Loading...';
          }

          return recentTags.length > 0 ? (
            <Box>
              {recentTags.map(({ id, text, color }) => {
                return (
                  <Tag
                    key={text}
                    color={color}
                    onSelect={() => handleDeleteTag(id)}
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
      <Box
        as="button"
        type="button"
        border="0"
        bgColor="none"
        textDecoration="underline"
        onClick={handleSignOut}
      >
        Sign out
      </Box>
    </Box>
  );
}
