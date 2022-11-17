import { rest } from 'msw';
import { mockTags } from './mock-data';

export const handlers = [
  rest.get(
    'https://faxousvhzthjbkpymmvz.supabase.co/rest/v1/tags',
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(mockTags));
    }
  ),
];
