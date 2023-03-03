import * as React from 'react';
import Box from './Box';

export default function Input({
  label,
  value,
  type = 'text',
  onChange,
  ...props
}) {
  return (
    <label>
      <Box>{label}</Box>
      <Box
        as="input"
        lineHeight="calc(3em + 1px)"
        borderRadius="0"
        color="white"
        type={type}
        value={value}
        onChange={onChange}
        {...props}
      />
    </label>
  );
}
