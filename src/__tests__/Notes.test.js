import React from 'react';
import {
  fireEvent,
  render,
  screen,
  within,
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

  it('note tags are editable', async () => {
    render(
      <ModalProvider>
        <Notes api={api} notes={mockNotes} />
      </ModalProvider>
    );

    expect(mockNotes[0]).toEqual({
      id: 1,
      tags: [{ color: 'lime', id: 1, text: 'meta' }],
      text: 'quick note',
    });

    fireEvent.click(screen.queryByTestId('note-1-edit'));
    await screen.findByRole('button', { name: /update/i });
    // Click tag (within modal)
    fireEvent.click(within(screen.queryByRole('dialog')).queryByText(/work/i));
    fireEvent.submit(screen.queryByRole('button', { name: /update/i }));
    expect(api.updateNote).toBeCalledWith({
      id: 1,
      newTagIds: [1, 2],
      oldTagIds: [1],
      note: 'quick note',
    });
    await waitForElementToBeRemoved(
      screen.queryByRole('button', { name: /update/i })
    );
  });

  it('deleting a tag removes it from the list', async () => {
    render(
      <ModalProvider>
        <Notes api={api} notes={mockNotes} />
      </ModalProvider>
    );

    expect(mockNotes[0]).toEqual({
      id: 1,
      tags: [{ color: 'lime', id: 1, text: 'meta' }],
      text: 'quick note',
    });

    fireEvent.click(screen.queryByTestId('note-1-edit'));
    await screen.findByRole('button', { name: /update/i });

    const dialog = screen.queryByRole('dialog');
    const form = screen.getByRole('form', { name: 'notes-form' });

    expect(within(dialog).queryAllByText(/meta/i).length).toBe(1);
    expect(within(form).queryByText(/meta/i)).toBeTruthy();

    // Click tag (within modal)
    fireEvent.click(screen.getByTestId('tag-1-delete'));

    expect(within(dialog).queryAllByText(/meta/i).length).toBe(1);
    // Should move from note back to list
    expect(within(form).queryByText(/meta/i)).not.toBeTruthy();

    fireEvent.submit(screen.queryByRole('button', { name: /update/i }));
    expect(api.updateNote).toBeCalledWith({
      id: 1,
      newTagIds: [],
      oldTagIds: [1],
      note: 'quick note',
    });
    await waitForElementToBeRemoved(
      screen.queryByRole('button', { name: /update/i })
    );
  });

  it('selecting a tag filters by that tag', async () => {
    render(<Notes api={api} notes={mockNotes} />);

    expect(screen.queryByText(/work reminder/i)).toBeTruthy();
    expect(screen.queryByText(/quick note/i)).toBeTruthy();

    fireEvent.click(screen.getByText(/meta/i));

    expect(screen.queryByText(/work reminder/i)).not.toBeTruthy();
    expect(screen.queryByText(/quick note/i)).toBeTruthy();
  });

  it('displays error message', async () => {
    render(<Notes error={new Error('Ruh roh')} />);

    expect(screen.queryByText(/ruh roh/i)).toBeTruthy();
  });

  it.todo('error updating note displays error message');
});
