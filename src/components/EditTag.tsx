import * as React from 'react';
import Box from './Box';
import type { TagType } from './Tag';
import type { API } from '../api';
import Input from './Input';
import Button, { SubmitButton } from './Button';
import { useCustomSwr, catchSwr } from '../utils';

export default function EditTag({
  id,
  initialColor,
  initialText,
  api,
  onSuccess,
  onCancel,
}: {
  id: string;
  initialColor: string;
  initialText: string;
  api: API;
  onSuccess: (newTag: TagType) => void;
  onCancel: () => void;
}) {
  const [newText, setNewText] = React.useState(initialText);
  const [newColor, setNewColor] = React.useState(initialColor);
  const { mutate: mutateTags } = useCustomSwr('tags');

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
        ).catch(catchSwr(mutateTags));
      }}
    >
      <Input
        autoFocus
        label={
          <Box as="h3" mb="1em">
            Update Tag
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
        <SubmitButton>Submit</SubmitButton>
        <Button onClick={onCancel}>Cancel</Button>
      </Box>
    </Box>
  );
}
