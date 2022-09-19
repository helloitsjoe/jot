/* eslint-disable react/prop-types */
import * as React from 'react';
import Box from './Box';

const Input = React.forwardRef(
  ({ label, value, type = 'text', onChange, ...props }, ref) => {
    return (
      <label>
        <Box>{label}</Box>
        <Box
          as="input"
          p="1em"
          borderRadius="0"
          color="white"
          type={type}
          value={value}
          onChange={onChange}
          ref={ref}
          {...props}
        />
      </label>
    );
  }
);

export default Input;
