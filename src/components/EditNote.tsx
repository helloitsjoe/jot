import * as React from 'react';
import type { API } from '../api';
import { useSWRConfig } from 'swr';
import Box from './Box';
import Input from './Input';
import Tag from './Tag';
import Button, { SubmitButton } from './Button';
import { useCustomSwr, catchSwr } from '../utils';

export default function EditNote({
  id,
  initialNoteText = '',
  initialTags = [],
  api,
  onCancel,
  onSuccess,
}: {
  id: string;
  initialNoteText?: string;
  initialTags?: { id: string; text: string; color: string }[];
  api: API;
  onCancel: () => void;
  onSuccess: () => void;
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
        aria-label="note-edit-form"
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
                  onSelect={() => {}}
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
