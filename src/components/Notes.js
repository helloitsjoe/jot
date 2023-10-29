import React from 'react';
import { useSWRConfig } from 'swr';
import Box from './Box';
import Tag from './Tag';
import Button from './Button';
import EditNote from './EditNote';
import { ModalContext } from './Modal';
import { catchSwr } from '../utils';

export const DELETE_CANCEL_MS = 4_000;

function defaultWaitForDelete(cb) {
  return setTimeout(() => {
    cb();
  }, DELETE_CANCEL_MS);
}

function EditButton({ text, id, tags, openNoteEditModal }) {
  return (
    <Button
      textOnly
      onClick={() => openNoteEditModal({ text, id, tags })}
      display="flex"
      data-testid={`note-${id}-edit`}
    >
      <span className="material-symbols-outlined">edit_square</span>
    </Button>
  );
}

function DeleteButton({
  id,
  deleting,
  handleCancelDeleteNote,
  handleOptimisticDeleteNote,
}) {
  return (
    <Button
      textOnly
      onClick={() =>
        deleting ? handleCancelDeleteNote(id) : handleOptimisticDeleteNote(id)
      }
      display="flex"
      alignSelf="flex-start"
      data-testid={`note-${id}-${deleting ? 'cancel' : 'delete'}`}
    >
      {deleting ? 'Cancel' : 'X'}
    </Button>
  );
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
  const [groupByTag, setGroupByTag] = React.useState(
    localStorage.getItem('groupByTag') === 'true' || true
  );

  const timeouts = React.useRef({});

  const { openModal, closeModal, setModalContent } =
    React.useContext(ModalContext);

  const toggleSetGroupByTag = () => {
    setGroupByTag((g) => {
      const toggled = !g;
      localStorage.setItem('groupByTag', toggled);
      return toggled;
    });
  };

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

  const notesByTag = (notes || []).reduce((acc, note) => {
    console.log('note', note);
    console.log('note.tags', note.tags);
    const tags = note.tags.length
      ? note.tags
      : [{ text: 'untagged', color: 'gray' }];

    tags.forEach((tag) => {
      if (!acc.get(tag.text)) {
        acc.set(tag.text, { notes: [], meta: tag });
      }
      acc.get(tag.text).notes.push(note);
    });
    return acc;
  }, new Map());

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end">
        <Button onClick={toggleSetGroupByTag}>
          {groupByTag ? 'See all notes' : 'Group by tag'}
        </Button>
      </Box>
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
      {groupByTag ? (
        <Box display="flex" flexDirection="column" gap="1em" mt="1em">
          {[...notesByTag.entries()]
            .sort(([, { meta: a }], [, { meta: b }]) => {
              if (a.updated_at === b.updated_at) return 0;
              return a.updated_at < b.updated_at ? 1 : -1;
            })
            .map(([tag, { notes: n, meta }]) => {
              return (
                <Box
                  key={tag}
                  bg={meta.color}
                  borderRadius="0.5em"
                  border={`1px solid ${meta.color}`}
                  display="flex"
                  flexDirection="column"
                >
                  <Box p="0.25em" color="black" m="auto" fontWeight="bold">
                    {tag}
                  </Box>
                  <Box bg="black" borderRadius="0.5em">
                    {n.map(({ id, text, tags }) => {
                      return (
                        <Box
                          justifyContent="space-between"
                          display="flex"
                          p="1em"
                          key={text}
                          borderBottom={`1px solid ${meta.color}`}
                        >
                          {text}
                          <Box display="flex">
                            <EditButton
                              {...{ id, text, tags, openNoteEditModal }}
                            />
                            <DeleteButton
                              {...{
                                id,
                                deleting: notesToDelete[id] === true,
                                handleCancelDeleteNote,
                                handleOptimisticDeleteNote,
                              }}
                            />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
        </Box>
      ) : (
        filteredNotes.map(({ text, id, tags }) => {
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
              <EditButton {...{ id, text, tags, openNoteEditModal }} />
              <DeleteButton
                {...{
                  id,
                  deleting,
                  handleCancelDeleteNote,
                  handleOptimisticDeleteNote,
                }}
              />
            </Box>
          );
        })
      )}
    </Box>
  );
}
