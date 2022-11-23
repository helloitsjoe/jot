import { addTagsToNotes, createApi } from '../api';
import { server } from '../__mocks__/server';
import {
  emptyTagsHandler,
  errorFetchTagsHandler,
  errorAddTagHandler,
  errorDeleteTagHandler,
  errorDeleteNotesTagsHandler,
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

describe('addTagsToNotes', () => {
  it('denormalizes notes_tags', () => {
    expect(addTagsToNotes(allNotes, notesTags)).toEqual([
      { ...noteSingleTag, tags: [tagBuzz] },
      { ...noteMultiTags, tags: [tagBee, tagBuzz] },
      { ...noteNoTags, tags: [] },
    ]);
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
      expect(newTag).toEqual({ text: 'hello', color: 'blue', user_id: '123' });
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
});
