import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  waitForElementToBeRemoved,
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
import ModalProvider from '../components/Modal';

const App = withSWR(RawApp);
const Notes = withSWR(RawNotes);

let api;

beforeEach(() => {
  api = {
    deleteNote: jest.fn().mockResolvedValue(),
    deleteTag: jest.fn().mockResolvedValue(),
    loadNotes: jest.fn().mockResolvedValue(mockNotes),
    loadTags: jest.fn().mockResolvedValue(mockTags),
    addNote: jest.fn().mockResolvedValue(),
    addTag: jest.fn().mockResolvedValue(),
  };
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runAllTimers();
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

    it('filters notes when a tag is clicked', async () => {
      render(<Notes notes={mockNotes} api={api} />);

      expect(screen.queryByText('meta')).toBeTruthy();
      expect(screen.queryByText('quick note')).toBeTruthy();

      expect(screen.queryByText('work')).toBeTruthy();
      expect(screen.queryByText('work reminder')).toBeTruthy();

      fireEvent.click(screen.queryByText('work'));

      expect(screen.queryByText('meta')).not.toBeTruthy();
      expect(screen.queryByText('quick note')).not.toBeTruthy();

      // Should show tag in filter and on note
      expect(screen.queryAllByText('work').length).toBe(2);
      expect(screen.queryByText('work reminder')).toBeTruthy();
    });

    it('adds a tag to a note', async () => {
      api.loadNotes.mockResolvedValue([]);
      render(<App api={api} />);
      await screen.findByText(/meta/i);
      fireEvent.change(screen.getByLabelText(/add a note/i), {
        target: { value: 'another note' },
      });
      expect(screen.queryAllByText('meta').length).toBe(1);
      fireEvent.click(screen.queryByText('meta'));
      expect(screen.queryAllByText('meta').length).toBe(2);

      fireEvent.click(screen.queryByRole('button', { name: /submit/i }));
      await waitForElementToBeRemoved(() => screen.getByText(/adding.../i));
      expect(api.addNote).toBeCalledWith('another note', [mockTagMeta.id]);
    });

    it('deletes a note after cancel period', async () => {
      render(
        <ModalProvider>
          <Notes notes={mockNotes} api={api} />
        </ModalProvider>
      );

      await screen.findByText(/quick note/i);
      fireEvent.click(screen.queryByTestId('note-1-delete'));
      jest.advanceTimersByTime(DELETE_CANCEL_MS - 100);
      expect(api.deleteNote).not.toBeCalled();
      jest.advanceTimersByTime(100);
      expect(api.deleteNote).toBeCalledWith({ id: 1 });
    });

    it('does not delete a note after canceling', async () => {
      render(
        <ModalProvider>
          <Notes notes={mockNotes} api={api} />
        </ModalProvider>
      );

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

    // it('deletes multiple notes', async () => {
    //   // Fixed behavior where deleted notes were showing back up
    //   render(
    //     <ModalProvider>
    //       <App api={api} />
    //     </ModalProvider>
    //   );
    //   await screen.findByText(/quick note/i);
    //   expect(screen.getByText(/work reminder/i)).toBeTruthy();
    //   fireEvent.click(screen.queryByTestId('note-1-delete'));
    //   jest.advanceTimersByTime(DELETE_CANCEL_MS - 100);
    //   fireEvent.click(screen.queryByTestId('note-2-delete'));
    //   jest.advanceTimersByTime(200);
    //   expect(screen.queryByText(/quick note/i)).not.toBeTruthy();
    //   jest.advanceTimersByTime(DELETE_CANCEL_MS / 2);
    //   expect(screen.queryByText(/quick note/i)).not.toBeTruthy();
    //   expect(screen.queryByText(/work reminder/i)).not.toBeTruthy();
    // });
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
      jest.useFakeTimers();
      api.deleteNote = jest.fn().mockRejectedValue(new Error('delete failed!'));
      render(
        <ModalProvider>
          <App api={api} />
        </ModalProvider>
      );
      await screen.findByText(/quick note/i);
      fireEvent.click(screen.getByTestId(`note-${mockNoteQuick.id}-delete`));
      jest.advanceTimersByTime(DELETE_CANCEL_MS - 50);
      await waitFor(() => {
        expect(api.deleteNote).toBeCalledWith({ id: 1 });
        expect(screen.queryByText(/delete failed/i)).toBeTruthy();
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
      render(
        <ModalProvider>
          <App api={api} />
        </ModalProvider>
      );
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
      render(
        <ModalProvider>
          <App api={api} />
        </ModalProvider>
      );
      await screen.findByText(/meta/i);
      fireEvent.click(screen.getByTestId(`tag-${mockTagMeta.id}-delete`));
      expect(api.deleteTag).not.toBeCalled();
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(api.deleteTag).not.toBeCalled();
      expect(
        screen.queryByRole('button', { name: /delete/i })
      ).not.toBeTruthy();
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
      render(
        <ModalProvider>
          <App api={api} />
        </ModalProvider>
      );
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
