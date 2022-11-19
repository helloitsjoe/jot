import { rest } from 'msw';
import { mockTags } from './mock-data';

export const TAGS = 'https://faxousvhzthjbkpymmvz.supabase.co/rest/v1/tags';
export const AUTH = 'https://faxousvhzthjbkpymmvz.supabase.co/auth/v1/user';

const user = { foo: 'bar' };

export const defaultHandlers = [
  rest.get(TAGS, (req, res, ctx) => {
    return res(ctx.json(mockTags));
  }),
  rest.get(AUTH, (req, res, ctx) => {
    return res(ctx.json({ data: { user } }));
  }),
  rest.post(TAGS, (req, res, ctx) => {
    const newTag = req.body;
    return res(ctx.json(newTag));
  }),
];

export const emptyTagsHandler = rest.get(TAGS, (req, res, ctx) =>
  res(ctx.json(null))
);

export const errorTagsHandler = rest.get(TAGS, (req, res, ctx) =>
  res(ctx.status(500), ctx.json({ message: 'oh heck' }))
);
