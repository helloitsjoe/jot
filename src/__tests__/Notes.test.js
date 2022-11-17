import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { mockTags, mockNotes } from '../__mocks__/mock-data';
import RawNotes from '../components/Notes';
import { withSWR } from '../utils';
import ModalProvider from '../components/Modal';

const Notes = withSWR(RawNotes);

let api;

beforeEach(() => {
  api = {
    loadTags: jest.fn().mockResolvedValue(mockTags),
    loadNotes: jest.fn().mockResolvedValue(mockNotes),
    updateNote: jest.fn().mockResolvedValue(),
  };
});

describe('Notes', () => {
  it('note is editable', async () => {
    render(
      <ModalProvider>
        <Notes api={api} notes={mockNotes} />
      </ModalProvider>
    );

    fireEvent.click(screen.queryByTestId('note-1-edit'));
    // expect something
    await waitForElementToBeRemoved(screen.queryByText(/no recent tags/i));
    fireEvent.change(screen.queryByLabelText(/update note/i), {
      target: { value: 'I have been sufficiently updated' },
    });
    fireEvent.submit(screen.queryByRole('button', { name: /update/i }));
    expect(api.updateNote).toBeCalledWith({
      id: 1,
      newTagIds: [1],
      oldTagIds: [1],
      note: 'I have been sufficiently updated',
    });
    await waitForElementToBeRemoved(
      screen.queryByRole('button', { name: /update/i })
    );
  });

  it.todo('note tags are editable');
  it.todo('error updating note displays error message');
});
