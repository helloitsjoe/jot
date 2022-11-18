import { rest } from 'msw';
import { mockTags } from './mock-data';

export const TAGS_ENDPOINT =
  'https://faxousvhzthjbkpymmvz.supabase.co/rest/v1/tags';

export const handlers = [
  rest.get(TAGS_ENDPOINT, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockTags));
  }),
];
