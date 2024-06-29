import * as React from 'react';
import Box from './Box';

export default function Button({
  textOnly,
  children,
  onClick = () => {},
  ...props
}) {
  if (textOnly) {
    return (
      <Box
        as="button"
        type="button"
        border="none"
        bg="transparent"
        color="gray"
        onClick={onClick}
        {...props}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box
      as="button"
      type="button"
      p="1em"
      color="white"
      bg="transparent"
      border="1px solid gray"
      onClick={onClick}
    >
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
