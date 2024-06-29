/* eslint-disable react/jsx-wrap-multilines */
import React from 'react';
import Box from './Box';
import Input from './Input';
import { SubmitButton } from './Button';
import { useCustomSwr, catchSwr } from '../utils';

export default function EditTag({
  id,
  initialColor,
  initialText,
  api,
  onSuccess,
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
        label={
          <Box as="h3" mb="1em">
            Update Tag
          </Box>
        }
        value={newText}
        onChange={(e) => {
          setNewText(e.target.value);
        }}
        autoFocus
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
      </Box>
    </Box>
  );
}
