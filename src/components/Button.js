/* eslint-disable react/prop-types */
import * as React from 'react';
import Box from './Box';

export default function Button({ textOnly, children, onClick = () => {} }) {
  if (textOnly) {
    <Box
      as="button"
      type="button"
      border="1 px solid white"
      bg="transparent"
      color="white"
      onClick={onClick}
    >
      {children}
    </Box>;
  }

  return (
    <Box as="button" type="button" onClick={onClick}>
      {children}
    </Box>
  );
}

export function SubmitButton({ children }) {
  return (
    <Box
      p="1em"
      as="button"
      type="submit"
      color="white"
      bg="transparent"
      border="1px solid gray"
    >
      {children}
    </Box>
  );
}
