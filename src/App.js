import * as React from 'react';
import { useCustomSwr, catchSwr } from './utils';
import Box from './components/Box';
import ConfirmDelete from './components/ConfirmDelete';
import Tag from './components/Tag';
import Notes from './components/Notes';
import Input from './components/Input';
import { ModalContext } from './components/Modal';
import { SubmitButton } from './components/Button';

const getRandomColor = () => {
  const colors = [
    'tomato',
    'cornflowerblue',
    'blueviolet',
    'orange',
    'lime',
    'green',
    'goldenrod',
    'dodgerblue',
    'magenta',
    'slateblue',
    'teal',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Create an optimistic tempId for a key
const createTempId = () => Date.now();

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

  const { openModal, closeModal, setModalContent } =
    React.useContext(ModalContext);

  const [note, setNote] = React.useState('');
  const [tag, setTag] = React.useState('');
  // const [errorMessage, setErrorMessage] = React.useState('');
  const [tags, setTags] = React.useState([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleNoteChange = (e) => setNote(e.target.value);
  const handleTagChange = (e) => setTag(e.target.value.toLowerCase());
  const handleAddTagToNote = (newTag) => {
    if (tags.find((t) => t.id === newTag.id)) return;
    setTags((prev) => [...prev, newTag]);
  };

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
    const optimisticData = recentTags.filter((t) => t.id !== id);
    return mutateTags(
      async () => {
        setTags((prev) => prev.filter((t) => t.id !== id));
        await api.deleteTag({ id });
        return optimisticData;
      },
      { optimisticData, revalidate: false }
      // TODO: Better error handling. Currently hides all tags, forces user to refresh
    ).catch(catchSwr(mutateTags));
  };

  const handleConfirmDeleteTag = (id) => {
    setModalContent(
      <ConfirmDelete
        onConfirmDelete={() => handleDeleteTag(id).then(closeModal)}
        onCancel={closeModal}
      />
    );
    openModal();
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    const tagIds = tags.map(({ id }) => id);
    const optimisticData = [...notes, { text: note, tags, id: createTempId() }];
    mutateNotes(
      async () => {
        setIsSubmitting(true);
        await api.addNote(note, tagIds);
        setIsSubmitting(false);
        setNote('');
        setTag('');
        setTags([]);
      },
      { optimisticData }
    ).catch(catchSwr(mutateNotes));
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
      <Box
        as="form"
        aria-label="new-note-form"
        onSubmit={handleAddNote}
        m="1em 0"
      >
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
          <Box borderBottom="1px solid gray" p="1em 0" mb="1em">
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
      <Box as="form" aria-label="new-tag-form" onSubmit={addNewTag} m="1em 0">
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

          const sortedTags = recentTags.sort((a, b) => {
            if (a.updated_at === b.updated_at) return 0;
            return a.updated_at < b.updated_at ? 1 : -1;
          });

          return sortedTags.length > 0 ? (
            <Box m="0.5em 0" display="flex" flexWrap="wrap" gap="1em">
              {sortedTags
                .filter(({ text, id }) => {
                  if (tags.some((t) => t.id === id)) return false;
                  return !tag || text.includes(tag);
                })
                .map(({ id, text, color }) => {
                  return (
                    <Tag
                      id={id}
                      key={id}
                      color={color}
                      onDelete={(e) => {
                        e.stopPropagation();
                        // handleDeleteTag(id);
                        handleConfirmDeleteTag(id);
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
