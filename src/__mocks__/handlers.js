import { rest } from 'msw';
import { mockTags, mockUser, mockTokenResponse } from './mock-data';

const BASE_URL = 'https://faxousvhzthjbkpymmvz.supabase.co';
export const TAGS = `${BASE_URL}/rest/v1/tags`;
export const AUTH = `${BASE_URL}/auth/v1/user`;
export const USER = `${BASE_URL}/rest/v1/users`;
export const NOTES = `${BASE_URL}/rest/v1/notes`;
export const TOKEN = `${BASE_URL}/auth/v1/token`;
export const NOTES_TAGS = `${BASE_URL}/rest/v1/notes_tags`;

export const defaultHandlers = [
  rest.get(AUTH, (req, res, ctx) => res(ctx.json(mockUser))),
  rest.get(TAGS, (req, res, ctx) => res(ctx.json(mockTags))),
  rest.post(TAGS, (req, res, ctx) => res(ctx.json(req.body))),
  rest.post(USER, (req, res, ctx) => res(ctx.json(req.body))),
  rest.post(NOTES, (req, res, ctx) => res(ctx.json(req.body))),
  rest.patch(TAGS, (req, res, ctx) => res(ctx.json(req.body))),
  rest.delete(TAGS, (req, res, ctx) => res(ctx.json(true))),
  rest.delete(NOTES, (req, res, ctx) => res(ctx.json(true))),
  rest.post(NOTES_TAGS, (req, res, ctx) => res(ctx.json(req.body))),
  rest.delete(NOTES_TAGS, (req, res, ctx) => res(ctx.json(req.body))),
  rest.post(TOKEN, (req, res, ctx) => res(ctx.json(mockTokenResponse))),
];

export const errorTokenHandler = rest.post(TOKEN, (req, res, ctx) =>
  res(ctx.status(500), ctx.json({ message: 'token failed' }))
);
export const emptyTagsHandler = rest.get(TAGS, (req, res, ctx) =>
  res(ctx.json(null))
);

export const errorFetchTagsHandler = rest.get(TAGS, (req, res, ctx) =>
  res(ctx.status(500), ctx.json({ message: 'oh heck' }))
);

export const errorAddTagHandler = rest.post(TAGS, (req, res, ctx) =>
  res(ctx.status(500), ctx.json({ message: 'adding failed' }))
);

export const errorAddNoteHandler = rest.post(NOTES, (req, res, ctx) =>
  res(ctx.status(500), ctx.json({ message: 'adding note failed' }))
);

export const errorDeleteTagHandler = rest.delete(TAGS, (req, res, ctx) =>
  res(ctx.status(500), ctx.json({ message: 'deleting tag failed' }))
);

export const errorDeleteNoteHandler = rest.delete(NOTES, (req, res, ctx) =>
  res(ctx.status(500), ctx.json({ message: 'deleting note failed' }))
);

export const errorDeleteNotesTagsHandler = rest.delete(
  NOTES_TAGS,
  (req, res, ctx) =>
    res(ctx.status(500), ctx.json({ message: 'deleting notes_tags failed' }))
);

export const errorAddNotesTagsHandler = rest.post(NOTES, (req, res, ctx) =>
  res(ctx.status(500), ctx.json({ message: 'adding notes_tags failed' }))
);

export const errorUpdateTagsHandler = rest.patch(TAGS, (req, res, ctx) =>
  res(ctx.status(500), ctx.json({ message: 'updating tags failed' }))
);
