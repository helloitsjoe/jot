import * as React from 'react';
import Box from './Box';

export default function Input({
  label,
  value,
  type = 'text',
  onChange,
  invalidMessage,
  ...props
}) {
  const handleInvalid = (e) => {
    e.target.setCustomValidity(invalidMessage);
  };

  return (
    <label>
      <Box>{label}</Box>
      <Box
        as="input"
        lineHeight="calc(3em + 1px)"
        onInvalid={handleInvalid}
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
