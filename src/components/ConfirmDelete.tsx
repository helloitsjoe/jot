import * as React from 'react';
import Box from './Box';
import Button from './Button';

// TODO: Tab trapping, focus management
export default function ConfirmDelete({
  onConfirmDelete,
  onCancel,
}: {
  onConfirmDelete: () => void;
  onCancel: () => void;
}) {
  return (
    <Box display="flex" flexDirection="column" gap="1em">
      <Box>Are you sure you want to delete?</Box>
      <Box display="flex" justifyContent="space-evenly">
        <Button onClick={onConfirmDelete}>Delete</Button>
        <Button onClick={onCancel}>Cancel</Button>
      </Box>
    </Box>
  );
}
