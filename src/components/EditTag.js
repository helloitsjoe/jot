import React from 'react';
import Box from './Box';
import Input from './Input';
import { useCustomSwr, catchSwr } from '../utils';

export default function EditTag({ id, color, initialText, api, onSuccess }) {
  const [value, setValue] = React.useState(initialText);
  const { mutate: mutateTags } = useCustomSwr('tags');

  return (
    <Box
      as="form"
      aria-label="tag-edit-form"
      onSubmit={(e) => {
        e.preventDefault();
        mutateTags(
          async (allTags) => {
            const updatedTag = await api.updateTag({ id, text: value, color });
            onSuccess(updatedTag);
            return allTags.map((tag) => (tag.id === id ? updatedTag : tag));
          },
          { revalidate: true }
        ).catch(catchSwr(mutateTags));
      }}
    >
      <Input
        label={<h3>Update Tag</h3>}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
        autoFocus
      />
    </Box>
  );
}
