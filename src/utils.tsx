import * as React from 'react';
import useSWR, { SWRConfig, SWRHook } from 'swr';

export const useCustomSwr: SWRHook = (...args) => {
  // Using .call here to get around this TS error: "A spred argument must either
  // have a tuple type or be passed to a rest parameter."
  const rtn = useSWR.call(null, ...args);
  if (rtn.data instanceof Error) {
    return { ...rtn, data: null, error: rtn.data };
  }
  return rtn;
};

export const catchSwr = (mutate, key?) => (err) => {
  if (key) {
    mutate(key, err, false);
  } else {
    mutate(err, false);
  }
};

export const withSWR = (Component) => {
  return function withSWR(props) {
    // This is needed to isolate tests.
    // See: https://frontend-digest.com/using-testing-libary-with-useswr-f595919de2fd
    return (
      <SWRConfig
        value={{
          dedupingInterval: 0,
          provider: () => new Map(),
        }}
      >
        <Component {...props} />
      </SWRConfig>
    );
  };
};
