import * as React from 'react';
import Box from './Box';
import type { TagType } from './Tag';
import type { API } from '../api';
import Input from './Input';
import Button, { SubmitButton } from './Button';
import { getRandomColor } from '../colors';
import { useCustomSwr, catchSwr } from '../utils';
import Tag from './Tag';

export default function EditTag({
  id,
  initialColor,
  initialText,
  api,
  onSuccess,
  onCancel,
}: {
  id: number;
  initialColor: string;
  initialText: string;
  api: API;
  onSuccess: (newTag: TagType) => void;
  onCancel: () => void;
}) {
  const [newText, setNewText] = React.useState(initialText);
  const [newColor, setNewColor] = React.useState(initialColor);
  const { mutate: mutateTags } = useCustomSwr('tags');
  const { mutate: mutateNotes } = useCustomSwr('notes');

  function handleRandomizeColor() {
    setNewColor(getRandomColor());
  }

  return (
    <Box
      as="form"
      aria-label="tag-edit-form"
      onSubmit={(e) => {
        e.preventDefault();
        mutateTags(
          async (allTags) => {
            const updatedTag = await api.updateTag({
              id,
              text: newText,
              color: newColor,
            });
            onSuccess(updatedTag);
            return allTags.map((tag) => (tag.id === id ? updatedTag : tag));
          },
          { revalidate: true }
        )
          .then(() => {
            // Refresh notes to get new tag color
            return mutateNotes().catch(catchSwr(mutateNotes));
          })
          .catch(catchSwr(mutateTags));
      }}
    >
      <Box as="h2" mb="1em">
        Update Tag
      </Box>

      <Box mb="1em">
        <strong>Preview</strong>
      </Box>
      <Tag id={id} color={newColor} onDelete={() => {}} onSelect={() => {}}>
        {newText}
      </Tag>
      <Input
        autoFocus
        label={
          <Box my="1em">
            <strong>Edit label</strong>
          </Box>
        }
        name="tag-edit-input"
        value={newText}
        onChange={(e) => {
          setNewText(e.target.value);
        }}
      />
      <Box display="flex" justifyContent="space-between" alignItems="flex-end">
        <Input
          type="color"
          value={newColor}
          label={
            <Box mt="1em" mb="1em">
              <strong>Edit color</strong>
            </Box>
          }
          onChange={(e) => setNewColor(e.target.value)}
        />
        <Button onClick={handleRandomizeColor}>Randomize</Button>
        <SubmitButton>Submit</SubmitButton>
        <Button onClick={onCancel}>Cancel</Button>
      </Box>
    </Box>
  );
}
