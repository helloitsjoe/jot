import * as React from 'react';
import useSWR, { useSWRConfig } from 'swr';
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

export default function App({ api, onSignOut }) {
  const {
    data: recentTags,
    error: fetchTagErr,
    mutate: mutateTags,
  } = useSWR('tags', api.loadTags);

  const { mutate } = useSWRConfig();

  const [note, setNote] = React.useState('');
  const [tag, setTag] = React.useState('');
  const [tags, setTags] = React.useState([]);
  const [submitting, setSubmitting] = React.useState(false);

  const handleNoteChange = (e) => setNote(e.target.value);
  const handleTagChange = (e) => setTag(e.target.value);
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
    const newTags = await mutateTags(api.addTag({ text: tag, color }));
    const newTag = newTags.find((t) => t.text === tag);

    setTags((t) => [...t, newTag]);
    setTag('');
  };

  const handleDeleteTag = (id) => {
    // TODO: Confirm deletion
    const optimisticData = recentTags.filter((t) => t.id !== id);
    const options = { optimisticData, revalidate: false };
    mutateTags(async () => {
      await api.deleteTag({ id });
      return optimisticData;
    }, options);
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const tagIds = tags.map(({ id }) => id);
    mutate('notes', async () => {
      await api.addNote(note, tagIds);
      setSubmitting(false);
      setNote('');
      setTag('');
      setTags([]);
    });
  };

  const handleSignOut = () => {
    api.signOut().then(() => {
      onSignOut();
    });
    // .catch((err) => {
    //   setErrorMessage(err.message);
    // });
  };

  return (
    <Box maxWidth="500px" m="2em auto">
      <Box as="form" onSubmit={handleAddNote} m="1em 0">
        <Input
          label={<h3>Add a note</h3>}
          value={note}
          onChange={handleNoteChange}
        />
        <SubmitButton disabled={submitting}>
          {submitting ? 'Adding...' : 'Submit'}
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
        <datalist id="tags">
          {(recentTags || []).map((t) => (
            <option key={t.text} value={t.text}>
              {t.text}
            </option>
          ))}
        </datalist>
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
