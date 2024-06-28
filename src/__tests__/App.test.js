import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import {
  mockNotes,
  mockTags,
  mockNoteQuick,
  mockTagMeta,
} from '../__mocks__/mock-data';
import RawApp from '../App';
import RawNotes, { DELETE_CANCEL_MS } from '../components/Notes';
import { withSWR } from '../utils';
import { withModal } from '../components/Modal';

const App = withSWR(withModal(RawApp));
const Notes = withSWR(withModal(RawNotes));

let api;

beforeEach(() => {
  api = {
    deleteNote: jest.fn().mockResolvedValue(),
    updateNote: jest.fn().mockResolvedValue(),
    updateTag: jest.fn().mockResolvedValue(mockTagMeta),
    deleteTag: jest.fn().mockResolvedValue(),
    loadNotes: jest.fn().mockResolvedValue(mockNotes),
    loadTags: jest.fn().mockResolvedValue(mockTags),
    addNote: jest.fn().mockResolvedValue(),
    addTag: jest.fn().mockResolvedValue(),
  };
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('App', () => {
  describe('happy notes!', () => {
    it('renders notes', async () => {
      render(<App api={api} />);
      expect(screen.queryByText(/quick note/i)).toBe(null);
      const note = await screen.findByText(/quick note/i);
      expect(note).toBeTruthy();
    });

    it('adds a new note', async () => {
      render(<App api={api} />);
      expect(screen.queryByText(/quick note/i)).not.toBeTruthy();
      await screen.findByText(/quick note/i);
      expect(api.loadNotes).toBeCalledTimes(1);
      fireEvent.change(screen.getByLabelText(/add a note/i), {
        target: { value: 'another note' },
      });
      expect(screen.queryByText(/another note/i)).toBe(null);
      fireEvent.click(screen.queryByRole('button', { name: /submit/i }));
      await waitForElementToBeRemoved(() => screen.getByText(/adding.../i));

      expect(api.addNote).toBeCalledWith('another note', []);
      expect(api.loadNotes).toBeCalledTimes(2);
    });

    it('moves a tag to the beginning of the list when it is added to a note', async () => {
      const reverse = (arr) => [...arr].reverse();
      api.loadTags = jest
        .fn()
        .mockResolvedValueOnce(mockTags)
        .mockResolvedValueOnce(reverse(mockTags));
      render(<App api={api} />);
      await screen.findByText(/quick note/i);
      fireEvent.change(screen.getByLabelText(/add a note/i), {
        target: { value: 'another note' },
      });
      const tagForm = screen.getByRole('form', { name: 'new-tag-form' });
      expect(tagForm.textContent).toMatch(/meta(.*)work/i);

      // Click on the second tag to add it to the note
      fireEvent.click(within(tagForm).queryByText('work'));

      fireEvent.click(screen.queryByRole('button', { name: /submit/i }));
      await waitForElementToBeRemoved(() => screen.getByText(/adding.../i));
      await waitFor(() => {
        expect(
          screen.getByRole('form', { name: 'new-tag-form' }).textContent
        ).toMatch(/work(.*)meta/i);
      });
    });

    it('does not add an empty note', async () => {
      render(<App api={api} />);
      await screen.findByText(/quick note/i);
      fireEvent.click(screen.queryByRole('button', { name: /submit/i }));
      expect(api.addNote).not.toBeCalled();
    });

    it('adds a tag to a note', async () => {
      api.loadNotes.mockResolvedValue([]);
      render(<App api={api} />);
      await screen.findByText(/meta/i);
      fireEvent.change(screen.getByLabelText(/add a note/i), {
        target: { value: 'another note' },
      });

      const tagForm = screen.getByRole('form', { name: 'new-tag-form' });
      const noteForm = screen.getByRole('form', { name: 'new-note-form' });

      expect(screen.queryAllByText('meta').length).toBe(1);
      expect(within(tagForm).queryByText('meta')).toBeTruthy();
      expect(within(noteForm).queryByText('meta')).not.toBeTruthy();

      fireEvent.click(screen.queryByText('meta'));

      expect(screen.queryAllByText('meta').length).toBe(1);

      // Tag should move from tags to note
      expect(within(tagForm).queryByText('meta')).not.toBeTruthy();
      expect(within(noteForm).queryByText('meta')).toBeTruthy();

      fireEvent.click(screen.queryByRole('button', { name: /submit/i }));
      await waitForElementToBeRemoved(() => screen.getByText(/adding.../i));
      expect(api.addNote).toBeCalledWith('another note', [mockTagMeta.id]);
    });

    it('deletes a note after cancel period', async () => {
      render(<App api={api} />);

      await screen.findByText(/quick note/i);
      fireEvent.click(screen.queryByTestId('note-1-delete'));
      jest.advanceTimersByTime(DELETE_CANCEL_MS - 100);
      expect(api.deleteNote).not.toBeCalled();
      await waitFor(() => {
        expect(api.deleteNote).toBeCalledWith({ id: 1 });
        expect(screen.queryByText(/quick note/i)).not.toBeTruthy();
      });
    });

    it('deletes multiple notes', async () => {
      render(<App api={api} />);

      await screen.findByText(/quick note/i);
      expect(screen.findByText(/work reminder/i)).toBeTruthy();
      fireEvent.click(screen.queryByTestId('note-1-delete'));
      jest.advanceTimersByTime(DELETE_CANCEL_MS - 100);
      fireEvent.click(screen.queryByTestId('note-2-delete'));
      expect(api.deleteNote).not.toBeCalled();

      expect(screen.queryByText(/quick note/i)).toBeTruthy();
      expect(screen.findByText(/work reminder/i)).toBeTruthy();

      await waitFor(() => {
        // Should delete first note before second
        expect(api.deleteNote).toBeCalledWith({ id: 1 });
        expect(api.deleteNote).not.toBeCalledWith({ id: 2 });
        expect(screen.queryByText(/quick note/i)).not.toBeTruthy();
        expect(screen.queryByText(/work reminder/i)).toBeTruthy();
      });
      jest.advanceTimersByTime(DELETE_CANCEL_MS - 100);
      await waitFor(() => {
        // Check that both notes are deleted
        expect(api.deleteNote).toBeCalledWith({ id: 2 });
        expect(screen.queryByText(/work reminder/i)).not.toBeTruthy();
        expect(screen.queryByText(/quick note/i)).not.toBeTruthy();
      });
    });

    it('does not delete a note after canceling', async () => {
      render(<Notes notes={mockNotes} api={api} />);

      await screen.findByText(/quick note/i);
      fireEvent.click(screen.queryByTestId('note-1-delete'));
      expect(api.deleteNote).not.toBeCalled();
      // TODO: Change note to make it clear it's in a cancelable state
      // Click again to cancel
      fireEvent.click(screen.queryByRole('button', { name: /cancel/i }));
      expect(
        screen.queryByRole('button', { name: /cancel/i })
      ).not.toBeTruthy();
      jest.advanceTimersByTime(DELETE_CANCEL_MS);
      expect(api.deleteNote).not.toBeCalled();
    });

    it('shows canceled note after canceling only one', async () => {
      render(<App api={api} />);

      await screen.findByText(/quick note/i);
      expect(screen.findByText(/work reminder/i)).toBeTruthy();
      fireEvent.click(screen.queryByTestId('note-1-delete'));
      jest.advanceTimersByTime(DELETE_CANCEL_MS - 100);

      fireEvent.click(screen.queryByTestId('note-2-delete'));
      // Cancel first after clicking second
      fireEvent.click(screen.queryByTestId('note-1-cancel'));

      expect(screen.queryByText(/quick note/i)).toBeTruthy();
      expect(screen.findByText(/work reminder/i)).toBeTruthy();

      await waitFor(() => {
        // Should not delete either note yet
        expect(api.deleteNote).not.toBeCalledWith({ id: 1 });
        expect(api.deleteNote).not.toBeCalledWith({ id: 2 });
        expect(screen.queryByText(/quick note/i)).toBeTruthy();
        expect(screen.queryByText(/work reminder/i)).toBeTruthy();
      });
      jest.advanceTimersByTime(DELETE_CANCEL_MS - 100);
      await waitFor(() => {
        // Check that only note 2 is deleted
        expect(api.deleteNote).not.toBeCalledWith({ id: 1 });
        expect(api.deleteNote).toBeCalledWith({ id: 2 });
        expect(screen.queryByText(/work reminder/i)).not.toBeTruthy();
        expect(screen.queryByText(/quick note/i)).toBeTruthy();
      });
    });
  });

  describe('unhappy notes :(', () => {
    it('shows error when fetching notes', async () => {
      api.loadNotes = () => Promise.reject(new Error('ruh roh'));
      render(<App api={api} />);
      expect(screen.queryByText(/ruh roh/i)).toBe(null);
      const errorMessage = await screen.findByText('ruh roh');
      expect(errorMessage).toBeTruthy();
    });

    it('shows error when adding a note', async () => {
      api.addNote = jest.fn().mockRejectedValue(new Error('add failed!'));
      render(<App api={api} />);
      await screen.findByText(/quick note/i);
      fireEvent.change(screen.getByLabelText(/add a note/i), {
        target: { value: 'another note' },
      });
      expect(screen.queryByText(/add failed!/i)).toBe(null);
      fireEvent.click(screen.queryByRole('button', { name: /submit/i }));
      const errorMessage = await screen.findByText(/add failed!/i);
      expect(errorMessage).toBeTruthy();
    });

    it('shows error when deleting a note', async () => {
      api.deleteNote = jest.fn().mockRejectedValue(new Error('delete failed!'));
      render(<App api={api} />);
      await screen.findByText(/quick note/i);
      fireEvent.click(screen.getByTestId(`note-${mockNoteQuick.id}-delete`));
      jest.advanceTimersByTime(DELETE_CANCEL_MS - 50);
      await waitFor(() => {
        expect(api.deleteNote).toBeCalledWith({ id: 1 });
        expect(screen.queryByText(/delete failed/i)).toBeTruthy();
      });
    });

    it('error updating note displays error message', async () => {
      api.updateNote = jest.fn().mockRejectedValue(new Error('update failed!'));

      render(<App api={api} />);
      await screen.findByText(/quick note/i);
      fireEvent.click(screen.getByTestId(`note-${mockNoteQuick.id}-edit`));
      fireEvent.click(
        within(screen.getByLabelText('note-edit-form')).getByTestId(
          'tag-1-delete'
        )
      );
      fireEvent.submit(screen.getByRole('button', { name: /update/i }));
      await waitFor(() => {
        expect(api.updateNote).toBeCalledWith({
          id: 1,
          newTagIds: [],
          oldTagIds: [1],
          text: 'quick note',
        });
      });
      await waitFor(() => {
        expect(screen.queryByText(/update failed!/i)).toBeTruthy();
      });
    });
  });

  describe('happy tags', () => {
    beforeEach(() => {
      api.loadNotes.mockResolvedValue([]);
    });

    it('renders tags', async () => {
      render(<App api={api} />);
      expect(screen.queryByText(/meta/i)).toBe(null);
      const tag = await screen.findAllByText(/meta/i);
      expect(tag.length).toBeGreaterThan(0);
    });

    it('adds a new tag', async () => {
      const NEW_TAG_TEXT = 'todo';
      api.addTag.mockResolvedValue({ text: NEW_TAG_TEXT });
      render(<App api={api} />);
      await screen.findByText(/meta/i);

      const event = { target: { value: NEW_TAG_TEXT } };
      fireEvent.change(screen.getByLabelText(/add a tag/i), event);
      expect(screen.queryByText(NEW_TAG_TEXT)).not.toBeTruthy();

      fireEvent.click(screen.queryByRole('button', { name: /add a new tag/i }));
      const addedTag = await screen.findByText(NEW_TAG_TEXT);
      expect(addedTag).toBeTruthy();
    });

    it('does not add an empty tag', async () => {
      render(<App api={api} />);
      await screen.findByText(/meta/i);
      fireEvent.click(screen.queryByRole('button', { name: /add a new tag/i }));
      expect(api.addTag).not.toBeCalled();
    });

    it('filters tags when typing', async () => {
      render(<App api={api} />);
      await screen.findByText(/meta/i);
      expect(screen.queryByText(/work/i)).toBeTruthy();
      expect(screen.queryByText(/meta/i)).toBeTruthy();

      const event = { target: { value: 'wor' } };
      fireEvent.change(screen.getByLabelText(/add a tag/i), event);

      expect(screen.queryByText(/work/i)).toBeTruthy();
      expect(screen.queryByText(/meta/i)).not.toBeTruthy();
    });

    it('deletes a tag after confirming', async () => {
      render(<App api={api} />);
      await screen.findByText(/meta/i);
      fireEvent.click(screen.getByTestId(`tag-${mockTagMeta.id}-delete`));
      expect(api.deleteTag).not.toBeCalled();
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));
      expect(api.deleteTag).toBeCalledWith({ id: mockTagMeta.id });
      await waitForElementToBeRemoved(() =>
        screen.getByRole('button', { name: /delete/i })
      );
    });

    it('does not delete a tag if delete is canceled', async () => {
      render(<App api={api} />);
      await screen.findByText(/meta/i);
      fireEvent.click(screen.getByTestId(`tag-${mockTagMeta.id}-delete`));
      expect(api.deleteTag).not.toBeCalled();
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(api.deleteTag).not.toBeCalled();
      expect(
        screen.queryByRole('button', { name: /delete/i })
      ).not.toBeTruthy();
    });

    it('moves a tag to the note form when clicked', async () => {
      render(<App api={api} />);
      await screen.findByText(/meta/i);

      const tagForm = screen.getByRole('form', { name: 'new-tag-form' });
      const noteForm = screen.getByRole('form', { name: 'new-note-form' });

      expect(within(tagForm).queryByText('meta')).toBeTruthy();
      expect(within(noteForm).queryByText('meta')).not.toBeTruthy();

      fireEvent.click(screen.queryByText('meta'));

      expect(within(tagForm).queryByText('meta')).not.toBeTruthy();
      expect(within(noteForm).queryByText('meta')).toBeTruthy();

      fireEvent.click(screen.getByTestId(`tag-${mockTagMeta.id}-delete`));
      expect(api.deleteTag).not.toBeCalled();

      expect(within(tagForm).queryByText('meta')).toBeTruthy();
      expect(within(noteForm).queryByText('meta')).not.toBeTruthy();
    });

    it('tag name is editable', async () => {
      render(<App api={api} />);
      await screen.findByText(/meta/i);

      const tagForm = screen.getByRole('form', { name: 'new-tag-form' });
      const noteForm = screen.getByRole('form', { name: 'new-note-form' });

      expect(within(tagForm).queryByText('meta')).toBeTruthy();
      expect(within(noteForm).queryByText('meta')).not.toBeTruthy();

      fireEvent.click(screen.queryByText('meta'));

      expect(within(tagForm).queryByText('meta')).not.toBeTruthy();
      expect(within(noteForm).queryByText('meta')).toBeTruthy();

      expect(screen.queryByRole('dialog')).not.toBeTruthy();

      fireEvent.click(screen.queryByText('meta'));

      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByLabelText(/update tag/i).value).toBe('meta');

      fireEvent.change(within(dialog).getByLabelText(/update tag/i), {
        target: { value: 'not meta' },
      });

      fireEvent.submit(within(dialog).getByLabelText('tag-edit-form'));
      expect(api.updateTag).toBeCalledWith({
        id: mockTagMeta.id,
        text: 'not meta',
        color: mockTagMeta.color,
      });

      await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
    });

    it('tag color is editable', async () => {
      render(<App api={api} />);
      await screen.findByText(/meta/i);

      const tagForm = screen.getByRole('form', { name: 'new-tag-form' });
      const noteForm = screen.getByRole('form', { name: 'new-note-form' });

      expect(within(tagForm).queryByText('meta')).toBeTruthy();
      expect(within(noteForm).queryByText('meta')).not.toBeTruthy();

      fireEvent.click(screen.queryByText('meta'));

      expect(within(tagForm).queryByText('meta')).not.toBeTruthy();
      expect(within(noteForm).queryByText('meta')).toBeTruthy();

      expect(screen.queryByRole('dialog')).not.toBeTruthy();

      fireEvent.click(screen.queryByText('meta'));

      const dialog = screen.getByRole('dialog');
      expect(
        within(dialog)
          .getByLabelText(/edit color/i)
          // Not sure why .value doesn't work here, it returns #000000
          .getAttribute('value')
      ).toBe(mockTagMeta.color);

      fireEvent.change(within(dialog).getByLabelText(/edit color/i), {
        target: { value: '#ffffff' },
      });

      fireEvent.submit(within(dialog).getByLabelText('tag-edit-form'));
      expect(api.updateTag).toBeCalledWith({
        id: mockTagMeta.id,
        text: 'meta',
        color: '#ffffff',
      });

      await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));
    });

    it('shows all notes when clicking see all', async () => {
      const extraTags = [
        ...mockTags,
        { id: 3, text: 'third', color: 'red' },
        { id: 4, text: 'fourth', color: 'blue' },
        { id: 5, text: 'fifth', color: 'green' },
        { id: 6, text: 'sixth', color: 'orange' },
        { id: 7, text: 'seventh', color: 'purple' },
        { id: 8, text: 'eighth', color: 'yellow' },
      ];

      api.loadTags = jest.fn().mockResolvedValue(extraTags);
      render(<App api={api} />);
      await screen.findByText(/meta/i);
      expect(screen.queryByText(/meta/i)).toBeTruthy();
      expect(screen.queryByText(/work/i)).toBeTruthy();
      expect(screen.queryByText(/third/i)).toBeTruthy();
      expect(screen.queryByText(/fourth/i)).toBeTruthy();
      expect(screen.queryByText(/fifth/i)).toBeTruthy();
      expect(screen.queryByText(/sixth/i)).toBeTruthy();
      expect(screen.queryByText(/seventh/i)).toBeTruthy();
      expect(screen.queryByText(/eighth/i)).not.toBeTruthy();
      expect(screen.queryByText(/see all tags/i)).toBeTruthy();

      fireEvent.click(screen.getByRole('button', { name: /see all tags/i }));
      expect(screen.queryByText(/meta/i)).toBeTruthy();
      expect(screen.queryByText(/work/i)).toBeTruthy();
      expect(screen.queryByText(/third/i)).toBeTruthy();
      expect(screen.queryByText(/fourth/i)).toBeTruthy();
      expect(screen.queryByText(/fifth/i)).toBeTruthy();
      expect(screen.queryByText(/sixth/i)).toBeTruthy();
      expect(screen.queryByText(/seventh/i)).toBeTruthy();
      expect(screen.queryByText(/eighth/i)).toBeTruthy();

      fireEvent.click(screen.getByRole('button', { name: /see fewer tags/i }));
      expect(screen.queryByText(/meta/i)).toBeTruthy();
      expect(screen.queryByText(/work/i)).toBeTruthy();
      expect(screen.queryByText(/third/i)).toBeTruthy();
      expect(screen.queryByText(/fourth/i)).toBeTruthy();
      expect(screen.queryByText(/fifth/i)).toBeTruthy();
      expect(screen.queryByText(/sixth/i)).toBeTruthy();
      expect(screen.queryByText(/seventh/i)).toBeTruthy();
      expect(screen.queryByText(/eighth/i)).not.toBeTruthy();
    });
  });

  describe('unhappy tags', () => {
    beforeEach(() => {
      api.loadNotes.mockResolvedValue([]);
    });

    it('shows error when fetching tags', async () => {
      api.loadTags.mockRejectedValue(new Error('taggle waggle'));
      render(<App api={api} />);
      expect(screen.queryByText(/taggle waggle/i)).toBe(null);
      const errorMessage = await screen.findByText('taggle waggle');
      expect(errorMessage).toBeTruthy();
    });

    it('shows error when adding a tag', async () => {
      const NEW_TAG_TEXT = 'foo';
      api.addTag.mockRejectedValue(new Error('addle taggle'));
      render(<App api={api} />);
      await screen.findByText(/meta/i);

      const event = { target: { value: NEW_TAG_TEXT } };
      fireEvent.change(screen.getByLabelText(/add a tag/i), event);
      expect(screen.queryByText(/addle taggle/i)).toBe(null);

      fireEvent.click(screen.queryByRole('button', { name: /add a new tag/i }));
      const errorMessage = await screen.findByText('addle taggle');
      expect(screen.queryByText(NEW_TAG_TEXT)).not.toBeTruthy();
      expect(errorMessage).toBeTruthy();
    });

    it('shows error when deleting a tag', async () => {
      api.deleteTag = jest.fn().mockRejectedValue(new Error('delete failed!'));
      render(<App api={api} />);
      await screen.findByText(/meta/i);
      fireEvent.click(screen.getByTestId(`tag-${mockTagMeta.id}-delete`));
      fireEvent.click(screen.getByRole('button', { name: /delete/i }));
      await waitForElementToBeRemoved(() =>
        screen.getByRole('button', { name: /delete/i })
      );
      expect(api.deleteTag).toBeCalledWith({ id: mockTagMeta.id });
      // expect(screen.queryByText(/quick note/i)).toBeTruthy();
      expect(screen.queryByText(/delete failed/i)).toBeTruthy();
    });
  });
});
