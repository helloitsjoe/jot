import React from 'react';
import Box from './Box';

export default function Tag({
  id,
  color,
  children,
  onSelect = () => {},
  onDelete,
}) {
  return (
    <Box
      as="span"
      // bg={color}
      border={`2px solid ${color}`}
      color={color}
      p="0.2em 0.4em"
      display="inline-block"
      borderRadius="0.4em"
      onClick={() => onSelect({ text: children, color, id })}
    >
      <span>{children}</span>
      {onDelete && (
        <Box
          as="button"
          ml="0.5em"
          type="button"
          onClick={onDelete}
          bg="transparent"
          border="none"
          color="gray"
          data-testid={`tag-${id}-delete`}
        >
          X
        </Box>
      )}
    </Box>
  );
}
