import * as React from 'react';
import onSwipe, { Directions } from 'swipey';
import { useCustomSwr, catchSwr } from './utils';
import Box from './components/Box';
import Tag from './components/Tag';
import Notes from './components/Notes';
import Input from './components/Input';
import { SubmitButton } from './components/Button';

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

// Create an optimistic tempId for a key
const createTempId = () => Date.now();

const initSwipeHandlers = () => {
  const reload = () => window.location.reload(true);
  const offDown = onSwipe(Directions.DOWN, reload, { fromTop: true });

  return () => offDown();
};

export default function App({ api, onSignOut }) {
  const {
    data: recentTags,
    error: fetchTagErr,
    mutate: mutateTags,
  } = useCustomSwr('tags', api.loadTags);

  const {
    data: notes,
    error: fetchNotesErr,
    mutate: mutateNotes,
  } = useCustomSwr('notes', api.loadNotes);

  const [note, setNote] = React.useState('');
  const [tag, setTag] = React.useState('');
  // const [errorMessage, setErrorMessage] = React.useState('');
  const [tags, setTags] = React.useState([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleNoteChange = (e) => setNote(e.target.value);
  const handleTagChange = (e) => setTag(e.target.value.toLowerCase());
  const handleAddTagToNote = (newTag) => setTags((prev) => [...prev, newTag]);

  const addNewTag = async (e) => {
    e.preventDefault();

    const existingTag = recentTags.find((r) => r.text === tag);
    if (existingTag) {
      setTags((t) => [...t, existingTag]);
      setTag('');
      return;
    }

    const color = getRandomColor();
    // TODO: Add tag to note, make sure id propagates

    mutateTags(async () => {
      const newTag = await api.addTag({ text: tag, color });
      setTags((t) => [...t, newTag]);
      setTag('');
    }).catch(catchSwr(mutateTags));
  };

  const handleDeleteTag = (id) => {
    // TODO: Confirm deletion
    const optimisticData = recentTags.filter((t) => t.id !== id);
    const options = { optimisticData, revalidate: false };
    mutateTags(async () => {
      setTags((prev) => prev.filter((t) => t.id !== id));
      await api.deleteTag({ id });
      return optimisticData;
    }, options);
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    const tagIds = tags.map(({ id }) => id);
    const optimisticData = [...notes, { text: note, tags, id: createTempId() }];
    mutateNotes(
      async () => {
        setIsSubmitting(true);
        // TODO: Figure out the best way to handle errors here.
        // Errors thrown here are caught in mutateNotes.catch.
        // Maybe wrap the useCustomSwr and treat a data error instance as an error?
        await api.addNote(note, tagIds);
        setIsSubmitting(false);
        setNote('');
        setTag('');
        setTags([]);
      },
      { optimisticData }
    );
  };

  const handleSignOut = () => {
    api.signOut().then(() => {
      onSignOut();
    });
    // .catch((err) => {
    //   setErrorMessage(err.message);
    // });
  };

  React.useEffect(() => {
    return initSwipeHandlers();
  }, []);

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
        <SubmitButton disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Submit'}
        </SubmitButton>
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
      {/* TODO: If tag exists, add it to note instead of tags */}
      <Box as="form" onSubmit={addNewTag} m="1em 0">
        <Input
          label={<h3>Add a tag</h3>}
          value={tag}
          onChange={handleTagChange}
          list="tags"
        />
        {/* <datalist id="tags"> */}
        {/*   {(recentTags || []).map((t) => ( */}
        {/*     <option key={t.text} value={t.text}> */}
        {/*       {t.text} */}
        {/*     </option> */}
        {/*   ))} */}
        {/* </datalist> */}
        <SubmitButton>Add a new tag</SubmitButton>
        {/* TODO: Why isn't this error persisting? */}
        {fetchTagErr && (
          <Box color="white" bg="red">
            {fetchTagErr.message}
          </Box>
        )}
        {(() => {
          if (!recentTags) {
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
        <Notes error={fetchNotesErr} notes={notes} api={api} />
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
