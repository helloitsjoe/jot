/* eslint-disable react/prop-types */
import React from 'react';
import Box from './Box';

export default function Tag({
  children,
  color,
  onSelect = () => {},
  onDelete,
}) {
  return (
    <Box
      as="span"
      bg={color}
      p="0.5em"
      m="1em"
      display="inline-block"
      borderRadius="1em"
      onClick={() => onSelect({ text: children, color })}
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
        >
          X
        </Box>
      )}
    </Box>
  );
}
