import * as React from 'react';
import Box from './Box';

export default function Input({
  label,
  value,
  type = 'text',
  onChange,
  pattern,
  onInvalid,
  required,
  autoFocus,
  width,
  ...props
}: {
  label: React.ReactNode;
  value: string;
  type?: string;
  pattern?: string;
  required?: boolean;
  autoFocus?: boolean;
  width?: string;
  onInvalid?: (e: Event) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
        pattern={pattern}
        onInvalid={onInvalid}
        autoFocus={autoFocus}
        required={required}
        width={width}
        {...props}
      />
    </label>
  );
}
