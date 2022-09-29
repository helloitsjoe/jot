import React from 'react';
import { SWRConfig } from 'swr';

const withSWR = (Component) => (props) => {
  // This is needed to isolate tests.
  // See: https://frontend-digest.com/using-testing-libary-with-useswr-f595919de2fd
  return (
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <Component {...props} />
    </SWRConfig>
  );
};

module.exports = {
  withSWR,
};
