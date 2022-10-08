import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import RawApp from '../App';
import Notes from '../components/Notes';
import { withSWR } from '../utils';

const App = withSWR(RawApp);

const mockTagMeta = { text: 'meta', id: 1, color: 'lime' };
const mockTagWork = { text: 'work', id: 2, color: 'blueviolet' };

const mockNotes = [
  { text: 'quick note', id: 1, tags: [mockTagMeta] },
  { text: 'something for work', id: 2, tags: [mockTagWork] },
];
const mockTags = [mockTagMeta, mockTagWork];

let api;

beforeEach(() => {
  api = {
    loadNotes: jest.fn().mockResolvedValue(mockNotes),
    loadTags: jest.fn().mockResolvedValue(mockTags),
    addNote: jest.fn().mockResolvedValue(),
    addTag: jest.fn().mockResolvedValue(),
  };
});

describe('App', () => {
  describe('notes', () => {
    describe('happy!', () => {
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
        // const newNote = await screen.findByText(/another note/i);
        // expect(newNote).toBeTruthy();
        expect(api.addNote).toBeCalledWith('another note', []);
        expect(api.loadNotes).toBeCalledTimes(2);
      });

      it('filters notes when a tag is clicked', async () => {
        render(<Notes notes={mockNotes} api={api} />);

        expect(screen.queryByText('meta')).toBeTruthy();
        expect(screen.queryByText('quick note')).toBeTruthy();

        expect(screen.queryByText('work')).toBeTruthy();
        expect(screen.queryByText('something for work')).toBeTruthy();

        fireEvent.click(screen.queryByText('work'));

        expect(screen.queryByText('meta')).not.toBeTruthy();
        expect(screen.queryByText('quick note')).not.toBeTruthy();

        // Should show tag in filter and on note
        expect(screen.queryAllByText('work').length).toBe(2);
        expect(screen.queryByText('something for work')).toBeTruthy();
      });

      it.todo('adds a tag to a note');
    });

    describe('unhappy :(', () => {
      it('shows error when fetching notes', async () => {
        api.loadNotes = () => Promise.reject(new Error('ruh roh'));
        render(<App api={api} />);
        expect(screen.queryByText(/ruh roh/i)).toBe(null);
        const errorMessage = await screen.findByText('ruh roh');
        expect(errorMessage).toBeTruthy();
      });

      // fit('shows error when adding a note', async () => {
      //   api.addNote = jest.fn().mockRejectedValue(new Error('add failed!'));
      //   render(<App api={api} />);
      //   await screen.findByText(/quick note/i);
      //   fireEvent.change(screen.getByLabelText(/add a note/i), {
      //     target: { value: 'another note' },
      //   });
      //   expect(screen.queryByText(/add failed!/i)).toBe(null);
      //   fireEvent.click(screen.queryByRole('button', { name: /submit/i }));
      //   const errorMessage = await screen.findByText(/add failed!/i);
      //   expect(errorMessage).toBeTruthy();
      // });
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
  });
});
