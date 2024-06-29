/**
 * @jest-environment node
 */
import { beforeAll, afterEach, afterAll, it, describe, expect } from 'vitest';
import { addTagsToNotes, createApi } from '../api';
import { server } from '../__mocks__/server';
import {
  emptyTagsHandler,
  errorFetchTagsHandler,
  errorAddTagHandler,
  errorAddNoteHandler,
  errorAddNotesTagsHandler,
  errorDeleteNoteHandler,
  errorDeleteTagHandler,
  errorDeleteNotesTagsHandler,
  errorTokenHandler,
  errorUpdateTagsHandler,
} from '../__mocks__/handlers';
import {
  allNotes,
  tagBee,
  tagBuzz,
  noteMultiTags,
  noteNoTags,
  noteSingleTag,
  notesTags,
  mockTags,
} from '../__mocks__/mock-data';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('getSession', () => {
  it('gets user', async () => {
    const api = createApi();
    const user = await api.getUser();
    expect(user).toEqual({ id: '123' });
  });
});

describe('addTagsToNotes', () => {
  it('denormalizes notes_tags', () => {
    expect(addTagsToNotes(allNotes, notesTags)).toEqual([
      { ...noteSingleTag, tags: [tagBuzz] },
      { ...noteMultiTags, tags: [tagBee, tagBuzz] },
      { ...noteNoTags, tags: [] },
    ]);
  });
});

describe('User', () => {
  describe('signIn', () => {
    it('signs in', async () => {
      const api = createApi();
      const auth = await api.signIn({ email: 'foo@bar.com', password: '1234' });
      // Supabase mutates response so it's different from mock HTTP response
      expect(auth).toEqual({
        session: {
          access_token: 'foo',
          expires_at: expect.any(Number),
          expires_in: 3600,
          refresh_token: 'bar',
          token_type: 'bearer',
          user: { id: '123' },
        },
        user: { id: '123' },
      });
    });

    it('throws if error response', async () => {
      expect.assertions(1);
      server.use(errorTokenHandler);
      const api = createApi();
      try {
        await api.signIn({ email: 'foo@bar.com', password: '1234' });
      } catch (err) {
        expect(err.status).toEqual(500);
      }
    });
  });

  describe('addUser', () => {
    it('adds a user', async () => {
      const id = '123';
      const api = createApi();
      const user = await api.addUser({ id });
      expect(user.id).toBe('123');
    });
  });
});

describe('Tags', () => {
  describe('loadTags', () => {
    it('loads tags', async () => {
      const api = createApi();
      const tags = await api.loadTags();
      expect(tags).toEqual(mockTags);
    });

    it('returns empty array if no tags', async () => {
      server.use(emptyTagsHandler);
      const api = createApi();
      const tags = await api.loadTags();
      expect(tags).toEqual([]);
    });

    it('throws if error response', async () => {
      expect.assertions(1);
      server.use(errorFetchTagsHandler);
      const api = createApi();
      try {
        await api.loadTags();
      } catch (err) {
        expect(err.message).toEqual('oh heck');
      }
    });
  });

  describe('addTag', () => {
    it('posts a tag', async () => {
      const api = createApi();
      const newTag = await api.addTag({ text: 'hello', color: 'blue' });
      expect(newTag).toEqual({
        text: 'hello',
        color: 'blue',
        user_id: '123',
        updated_at: expect.any(String),
      });
    });

    it('requires text and color', async () => {
      const api = createApi();
      expect(api.addTag({ text: 'hello' })).rejects.toThrow(
        /text and color are required/i
      );
      expect(api.addTag({ color: 'blue' })).rejects.toThrow(
        /text and color are required/i
      );
    });

    it('throws if error response from API', async () => {
      expect.assertions(1);
      server.use(errorAddTagHandler);
      const api = createApi();
      try {
        await api.addTag({ text: 'hello', color: 'blue' });
      } catch (err) {
        expect(err.message).toEqual('adding failed');
      }
    });
  });

  describe('updateTag', () => {
    it('updates a tag', async () => {
      const api = createApi();
      const updatedValues = { id: '123', color: 'blue', text: 'hello' };
      const updated = await api.updateTag(updatedValues);
      expect(updated).toEqual({
        ...updatedValues,
        updated_at: expect.any(String),
      });
    });
  });

  describe('deleteTag', () => {
    it('deletes a tag', async () => {
      const api = createApi();
      const deleted = await api.deleteTag({ id: '123' });
      expect(deleted).toEqual(true);
    });

    it('throws if error deleting tag', async () => {
      expect.assertions(1);
      server.use(errorDeleteTagHandler);
      const api = createApi();
      try {
        await api.deleteTag({ id: '123' });
      } catch (err) {
        expect(err.message).toEqual('deleting tag failed');
      }
    });

    it('throws if error deleting notes_tags entry', async () => {
      expect.assertions(1);
      server.use(errorDeleteNotesTagsHandler);
      const api = createApi();
      try {
        await api.deleteTag({ id: '123' });
      } catch (err) {
        expect(err.message).toEqual('deleting notes_tags failed');
      }
    });
  });

  describe('Notes', () => {
    describe('addNote', () => {
      it('adds a note', async () => {
        const api = createApi();
        const added = await api.addNote('I am a note!', [1, 2]);
        expect(added).toEqual({
          text: 'I am a note!',
          tag_ids: [1, 2],
          user_id: '123',
        });
      });

      it('throws if adding a note fails', async () => {
        expect.assertions(1);
        server.use(errorAddNoteHandler);
        const api = createApi();
        try {
          await api.addNote('Notey note', [1, 2]);
        } catch (err) {
          expect(err.message).toEqual('adding note failed');
        }
      });

      it('throws if adding to notes_tags fails', async () => {
        expect.assertions(1);
        server.use(errorAddNotesTagsHandler);
        const api = createApi();
        try {
          await api.addNote('Notey note', [1, 2]);
        } catch (err) {
          expect(err.message).toEqual('adding notes_tags failed');
        }
      });

      it('throws if updating tag fails', async () => {
        expect.assertions(1);
        server.use(errorUpdateTagsHandler);
        const api = createApi();
        try {
          await api.addNote('Notey note', [1, 2]);
        } catch (err) {
          expect(err.message).toEqual('updating tags failed');
        }
      });
    });

    describe('deleteNote', () => {
      it('deletes a note', async () => {
        const api = createApi();
        const deleted = await api.deleteNote({ id: 1 });
        expect(deleted).toEqual(true);
      });

      it('throws if deleting fails', async () => {
        expect.assertions(1);
        server.use(errorDeleteNoteHandler);
        const api = createApi();
        try {
          await api.deleteNote({ id: 1 });
        } catch (err) {
          expect(err.message).toEqual('deleting note failed');
        }
      });

      it('throws if deleting notes_tags entry fails', async () => {
        expect.assertions(1);
        server.use(errorDeleteNotesTagsHandler);
        const api = createApi();
        try {
          await api.deleteNote({ id: 1 });
        } catch (err) {
          expect(err.message).toEqual('deleting notes_tags failed');
        }
      });
    });
  });
});
