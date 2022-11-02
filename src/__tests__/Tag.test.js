import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import Tag from '../Tag';
// import RawNotes from '../components/Notes';
// import { withSWR } from '../utils';
// import ModalProvider from '../components/Modal';

describe('Tag', () => {
  it('tag name is editable', async () => {
    render(<Tag />);
  });

  it.todo('tag color is editable');
});
