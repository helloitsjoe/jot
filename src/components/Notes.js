import React from 'react';
import { useSWRConfig } from 'swr';
import Box from './Box';
import Tag from './Tag';
import Input from './Input';
import Button, { SubmitButton } from './Button';
// import ConfirmDelete from './ConfirmDelete';
import { ModalContext } from './Modal';
import { useCustomSwr, catchSwr } from '../utils';

export const DELETE_CANCEL_MS = 10_000;

function EditNote({
  id,
  initialNoteText = '',
  initialTags = [],
  api,
  onCancel,
  onSuccess,
}) {
  const { data: recentTags } = useCustomSwr('tags', api.loadTags);
  const { mutate } = useSWRConfig();

  const [note, setNote] = React.useState(initialNoteText);
  const [tags, setTags] = React.useState(initialTags);

  const handleNoteChange = (e) => setNote(e.target.value);
  const handleAddTagToNote = (newTag) => setTags((prev) => [...prev, newTag]);

  return (
    <>
      <Box
        as="form"
        aria-label="notes-form"
        onSubmit={async (e) => {
          e.preventDefault();
          mutate(
            'notes',
            async (allNotes) => {
              await api.updateNote({
                id,
                text: note,
                oldTagIds: initialTags.map((tag) => tag.id),
                newTagIds: tags.map((tag) => tag.id),
              });
              onSuccess();
              return allNotes.map((prevNote) => {
                if (prevNote.id === id) {
                  return { ...prevNote, id, text: note, tags };
                }
                return prevNote;
              });
            },
            { revalidate: false }
            // TODO: Better error handling. Currently hides all notes, forces user to refresh
          ).catch(catchSwr(mutate, 'notes'));
        }}
        m="1em 0"
      >
        <Input
          width="auto"
          label={<h3>Update Note</h3>}
          value={note}
          onChange={handleNoteChange}
          autoFocus
        />
        <SubmitButton>Update</SubmitButton>
        <Button onClick={onCancel}>Cancel</Button>
        {tags.length > 0 && (
          <Box borderBottom="1px solid gray" p="1em 0" mb="1em">
            {tags.map(({ id: tagId, text, color }) => {
              return (
                <Tag
                  id={tagId}
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

      <Box>
        {recentTags?.length > 0 ? (
          <Box m="0.5em 0" display="flex" flexWrap="wrap" gap="1em">
            {recentTags
              .filter((recent) => !tags.some((t) => t.id === recent.id))
              .map(({ id: tagId, text, color }) => {
                return (
                  <Tag
                    id={tagId}
                    key={tagId}
                    color={color}
                    onSelect={handleAddTagToNote}
                  >
                    {text}
                  </Tag>
                );
              })}
          </Box>
        ) : (
          <p>No recent tags!</p>
        )}
      </Box>
    </>
  );
}

function defaultWaitForDelete(cb) {
  return setTimeout(() => {
    cb();
  }, 10_000);
}

export default function Notes({
  notes,
  error,
  api,
  waitForDelete = defaultWaitForDelete,
}) {
  const { mutate } = useSWRConfig();

  const [notesToDelete, setNotesToDelete] = React.useState({});
  const [activeTags, setActiveTags] = React.useState(new Set());

  const timeouts = React.useRef({});

  const { openModal, closeModal, setModalContent } =
    React.useContext(ModalContext);

  const handleDeleteNote = (id) => {
    // Optimistic data should:
    // 1. Not include note to be deleted
    // 2. Not include deleted notes. Reference mutable ref here to avoid
    // stale data since this function is called in a closure
    const optimisticData = notes.filter(
      (note) => note.id !== id && timeouts.current[note.id] !== 'deleted'
    );
    return mutate(
      'notes',
      async () => {
        await api.deleteNote({ id });
        return optimisticData;
      },
      { optimisticData, revalidate: false }
      // TODO: Better error handling. Currently hides all notes, forces user to refresh
    ).catch(catchSwr(mutate, 'notes'));
  };

  const openNoteEditModal = ({ text, id, tags }) => {
    // Note: this is duplicated from App, maybe make this form a component
    setModalContent(
      <EditNote
        id={id}
        initialNoteText={text}
        initialTags={tags}
        api={api}
        onCancel={closeModal}
        onSuccess={closeModal}
      />
    );
    openModal();
  };

  const handleOptimisticDeleteNote = (id) => {
    setNotesToDelete((prev) => ({ ...prev, [id]: true }));

    // TODO: Make this nicer - countdown / fill bar, animate disappearing
    timeouts.current[id] = waitForDelete(() => {
      timeouts.current[id] = 'deleted';
      handleDeleteNote(id);
    });
  };

  const handleCancelDeleteNote = (id) => {
    clearTimeout(timeouts.current[id]);
    timeouts.current[id] = null;
    setNotesToDelete((prev) => ({ ...prev, [id]: false }));
  };

  if (error) {
    return (
      <Box color="white" bg="tomato">
        {error.message}
      </Box>
    );
  }

  if (!notes) {
    return <Box>Loading notes...</Box>;
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
        const deleting = notesToDelete[id] === true;
        return (
          <Box
            key={id}
            borderRadius="0.5em"
            border={deleting ? '1px solid gray' : '1px solid blueviolet'}
            justifyContent="space-between"
            display="flex"
            p="1em"
            m="0.5em 0"
          >
            <Box display="flex" flex="1" flexDirection="column">
              <Box>{text}</Box>
              <Box m="0.5em 0" display="flex" gap="1em">
                {tags.map((tag) => (
                  <Tag
                    key={tag.text}
                    color={deleting ? 'gray' : tag.color}
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
              onClick={() => openNoteEditModal({ text, id, tags })}
              display="flex"
              data-testid={`note-${id}-edit`}
            >
              <span className="material-symbols-outlined">edit_square</span>
            </Button>
            <Button
              textOnly
              onClick={() =>
                deleting
                  ? handleCancelDeleteNote(id)
                  : handleOptimisticDeleteNote(id)
              }
              display="flex"
              alignSelf="flex-start"
              data-testid={`note-${id}-${deleting ? 'cancel' : 'delete'}`}
            >
              {deleting ? 'Cancel' : 'X'}
            </Button>
          </Box>
        );
      })}
    </Box>
  );
}
