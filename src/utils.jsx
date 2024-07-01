import React from 'react';
import useSWR, { SWRConfig } from 'swr';

export const useCustomSwr = (...args) => {
  const rtn = useSWR(...args);
  // console.log('rtn', rtn.data);
  // console.log('rtn', rtn.error);
  if (rtn.data instanceof Error) {
    return { ...rtn, data: null, error: rtn.data };
  }
  return rtn;
};

export const catchSwr = (mutate, key) => (err) => {
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
