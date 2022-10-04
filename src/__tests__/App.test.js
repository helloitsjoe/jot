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
    loadTags: jest
      .fn()
      .mockResolvedValue([{ text: 'meta', id: 1, color: 'lime' }]),
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

  describe('tags', () => {
    describe('happy', () => {
      it('renders tags', async () => {
        render(<App api={api} />);
        expect(screen.queryByText(/meta/i)).toBe(null);
        const tag = await screen.findAllByText(/meta/i);
        expect(tag.length).toBeGreaterThan(0);
      });

      it.todo('adds a new tag');

      it.todo('filters notes when a tag is clicked');
    });

    describe('unhappy', () => {
      it.todo('shows error when fetching tags');

      it.todo('shows error when adding a tag');
    });
  });
});
