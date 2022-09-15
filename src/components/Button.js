/* eslint-disable react/prop-types */
import * as React from 'react';
import Box from './Box';

export default function Button({
  children,
  onClick = () => {},
  type = 'button',
}) {
  return (
    <Box
      as="button"
      type={type === 'submit' ? 'submit' : 'button'}
      onClick={onClick}
    >
      {children}
    </Box>
  );
}

export function SubmitButton({ children }) {
  return (
    <Box
      p="0.5em"
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
