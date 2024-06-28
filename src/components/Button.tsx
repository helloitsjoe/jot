import * as React from 'react';
import Box from './Box';

export default function Button({
  textOnly,
  children,
  // TODO: I shouldn't have to pass in styled-system props here
  display,
  alignSelf,
  onClick = () => {},
  ...props
}: {
  textOnly?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  display?: string;
  alignSelf?: string;
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
        display={display}
        alignSelf={alignSelf}
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

export function SubmitButton({
  children,
  disabled,
  ...props
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Box
      p="1em"
      as="button"
      type="submit"
      color="white"
      bg="transparent"
      border="1px solid gray"
      disabled={disabled}
      {...props}
    >
      {children}
    </Box>
  );
}
