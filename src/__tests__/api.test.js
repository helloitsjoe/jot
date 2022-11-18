import { rest } from 'msw';
import { addTagsToNotes, createApi } from '../api';
import { server } from '../__mocks__/server';
import { TAGS_ENDPOINT } from '../__mocks__/handlers';
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

describe('loadTags', () => {
  it('loads tags', async () => {
    const api = createApi();
    const tags = await api.loadTags();
    expect(tags).toEqual(mockTags);
  });

  it('returns empty array if no tags', async () => {
    server.use(
      rest.get(TAGS_ENDPOINT, (req, res, ctx) =>
        res(ctx.status(200), ctx.json(null))
      )
    );
    const api = createApi();
    const tags = await api.loadTags();
    expect(tags).toEqual([]);
  });

  it('throws if error response', () => {
    // TODO: runtime handlers: https://github.com/mswjs/msw/discussions/885
  });
});
