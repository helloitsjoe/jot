import { rest } from 'msw';
import { mockTags } from './mock-data';

export const TAGS_ENDPOINT =
  'https://faxousvhzthjbkpymmvz.supabase.co/rest/v1/tags';

export const defaultHandlers = [
  rest.get(TAGS_ENDPOINT, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockTags));
  }),
];

export const emptyTagsHandler = rest.get(TAGS_ENDPOINT, (req, res, ctx) =>
  res(ctx.status(200), ctx.json(null))
);

export const errorTagsHandler = rest.get(TAGS_ENDPOINT, (req, res, ctx) =>
  res(ctx.status(500), ctx.json({ message: 'oh heck' }))
);
