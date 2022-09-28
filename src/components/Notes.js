import * as React from 'react';
import useSWR from 'swr';
import Box from './Box';
import Tag from './Tag';
import Button from './Button';

export default function Notes({ notes, error, api }) {
  const { mutate } = useSWR('notes');
  console.log('notes', notes);

  const [activeTags, setActiveTags] = React.useState(new Set());

  const handleDeleteNote = (id) => {
    const optimisticData = notes.filter((note) => note.id !== id);
    mutate(
      async () => {
        await api.deleteNote({ id });
        return optimisticData;
      },
      { optimisticData }
    );
  };

  if (!notes) {
    return <Box>Loading notes...</Box>;
  }

  if (error) {
    return (
      <Box color="white" bg="tomato">
        {error.message}
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
            justifyContent="space-between"
            display="flex"
            p="1em"
            m="0.5em 0"
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
