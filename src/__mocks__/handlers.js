import { rest } from 'msw';
import { mockTags } from './mock-data';

const BASE_URL = 'https://faxousvhzthjbkpymmvz.supabase.co';
export const TAGS = `${BASE_URL}/rest/v1/tags`;
export const AUTH = `${BASE_URL}/auth/v1/user`;
export const NOTES_TAGS = `${BASE_URL}/rest/v1/notes_tags`;

const user = { id: '123' };

export const defaultHandlers = [
  rest.get(TAGS, (req, res, ctx) => {
    return res(ctx.json(mockTags));
  }),
  rest.get(AUTH, (req, res, ctx) => {
    return res(ctx.json(user));
  }),
  rest.post(TAGS, (req, res, ctx) => {
    const newTag = req.body;
    return res(ctx.json(newTag));
  }),
  rest.delete(TAGS, (req, res, ctx) => {
    return res(ctx.json(true));
  }),
  rest.delete(NOTES_TAGS, (req, res, ctx) => {
    return res(ctx.json(req.body));
  }),
];

export const emptyTagsHandler = rest.get(TAGS, (req, res, ctx) =>
  res(ctx.json(null))
);

export const errorFetchTagsHandler = rest.get(TAGS, (req, res, ctx) =>
  res(ctx.status(500), ctx.json({ message: 'oh heck' }))
);

export const errorAddTagHandler = rest.post(TAGS, (req, res, ctx) =>
  res(ctx.status(500), ctx.json({ message: 'adding failed' }))
);

export const errorDeleteTagHandler = rest.delete(TAGS, (req, res, ctx) =>
  res(ctx.status(500), ctx.json({ message: 'deleting tag failed' }))
);

export const errorDeleteNotesTagsHandler = rest.delete(
  NOTES_TAGS,
  (req, res, ctx) =>
    res(ctx.status(500), ctx.json({ message: 'deleting notes_tags failed' }))
);
