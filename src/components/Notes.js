import React from 'react';
import { useSWRConfig } from 'swr';
import Box from './Box';
import Tag from './Tag';
import Input from './Input';
import Button, { SubmitButton } from './Button';
import ConfirmDelete from './ConfirmDelete';
import { ModalContext } from './Modal';
import { useCustomSwr, catchSwr } from '../utils';

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
    <Box
      as="form"
      onSubmit={async (e) => {
        e.preventDefault();
        mutate(
          'notes',
          async (allNotes) => {
            await api.updateNote({
              id,
              note,
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

      {recentTags?.length > 0 ? (
        <Box m="0.5em 0" display="flex" flexWrap="wrap" gap="1em">
          {recentTags.map(({ id: tagId, text, color }) => {
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
  );
}

export default function Notes({ notes, error, api }) {
  const { mutate } = useSWRConfig();

  const { openModal, closeModal, setModalContent } =
    React.useContext(ModalContext);

  const [activeTags, setActiveTags] = React.useState(new Set());

  const handleDeleteNote = (id) => {
    const optimisticData = notes.filter((note) => note.id !== id);
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

  const handleConfirmDeleteNote = (id) => {
    setModalContent(
      <ConfirmDelete
        onConfirmDelete={() => handleDeleteNote(id).then(closeModal)}
        onCancel={closeModal}
      />
    );
    openModal();
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
        return (
          <Box
            key={id}
            borderRadius="0.5em"
            border="1px solid blueviolet"
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
              onClick={() => openNoteEditModal({ text, id, tags })}
              display="flex"
              data-testid={`note-${id}-edit`}
            >
              <span className="material-symbols-outlined">edit_square</span>
            </Button>
            <Button
              textOnly
              onClick={() => handleConfirmDeleteNote(id)}
              display="flex"
              alignSelf="flex-start"
              data-testid={`note-${id}-delete`}
            >
              X
            </Button>
          </Box>
        );
      })}
    </Box>
  );
}
