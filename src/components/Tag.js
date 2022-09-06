/* eslint-disable react/prop-types */
import React from 'react';
import Box from './Box';

export default function Tag({ children, color, onSelect }) {
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
      {children}
    </Box>
  );
}
