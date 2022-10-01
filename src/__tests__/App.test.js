import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import RawApp from '../App';
import { withSWR } from '../utils';

const App = withSWR(RawApp);

let api;

beforeEach(() => {
  api = {
    loadNotes: jest
      .fn()
      .mockResolvedValue([{ text: 'quick note', tags: [], id: 1 }]),
    loadTags() {},
    addNote: jest.fn().mockResolvedValue({ text: 'another note' }),
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
    });

    describe('unhappy :(', () => {
      it('shows error when fetching notes', async () => {
        api.loadNotes = () => Promise.reject(new Error('ruh roh'));
        render(<App api={api} />);
        expect(screen.queryByText(/ruh roh/i)).toBe(null);
        const foo = await screen.findByText('ruh roh');
        expect(foo).toBeTruthy();
      });

      it.todo('shows error when adding a note');
    });
  });

  describe('tags', () => {
    describe('happy', () => {
      it.todo('renders tags');

      it.todo('adds a new tag');

      it.todo('filters notes when a tag is clicked');
    });

    describe('unhappy', () => {
      it.todo('shows error when fetching tags');

      it.todo('shows error when adding a tag');
    });
  });
});
