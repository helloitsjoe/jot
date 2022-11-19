import { addTagsToNotes, createApi } from '../api';
import { server } from '../__mocks__/server';
import { emptyTagsHandler, errorTagsHandler } from '../__mocks__/handlers';
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
  server.listen();
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
      server.use(errorTagsHandler);
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
      expect(newTag).toEqual({ text: 'hello', color: 'blue' });
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
  });
});
