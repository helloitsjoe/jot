import { http, HttpResponse as Res } from 'msw';
import { mockTags, mockUser, mockTokenResponse } from './mock-data';

const BASE_URL = 'https://faxousvhzthjbkpymmvz.supabase.co';
export const TAGS = `${BASE_URL}/rest/v1/tags`;
export const AUTH = `${BASE_URL}/auth/v1/user`;
export const USER = `${BASE_URL}/rest/v1/users`;
export const NOTES = `${BASE_URL}/rest/v1/notes`;
export const TOKEN = `${BASE_URL}/auth/v1/token`;
export const NOTES_TAGS = `${BASE_URL}/rest/v1/notes_tags`;

export const defaultHandlers = [
  http.get(AUTH, () => Res.json(mockUser)),
  http.get(TAGS, () => Res.json(mockTags)),
  http.post(TAGS, async ({ request }) => Res.json(await request.json())),
  http.post(USER, async ({ request }) => Res.json(await request.json())),
  http.post(NOTES, async ({ request }) => Res.json(await request.json())),
  http.patch(TAGS, async ({ request }) => Res.json(await request.json())),
  http.delete(TAGS, () => Res.json(true)),
  http.delete(NOTES, () => Res.json(true)),
  http.delete(NOTES_TAGS, () => Res.json({})),
  http.post(NOTES_TAGS, async ({ request }) => Res.json(await request.json())),
  http.post(TOKEN, () => Res.json(mockTokenResponse)),
];

export const errorTokenHandler = http.post(TOKEN, () =>
  Res.json({ message: 'token failed' }, { status: 500 })
);
export const emptyTagsHandler = http.get(TAGS, () => Res.json(null));

export const errorFetchTagsHandler = http.get(TAGS, () =>
  Res.json({ message: 'oh heck' }, { status: 500 })
);

export const errorAddTagHandler = http.post(TAGS, () =>
  Res.json({ message: 'adding failed' }, { status: 500 })
);

export const errorAddNoteHandler = http.post(NOTES, () =>
  Res.json({ message: 'adding note failed' }, { status: 500 })
);

export const errorDeleteTagHandler = http.delete(TAGS, () =>
  Res.json({ message: 'deleting tag failed' }, { status: 500 })
);

export const errorDeleteNoteHandler = http.delete(NOTES, () =>
  Res.json({ message: 'deleting note failed' }, { status: 500 })
);

export const errorDeleteNotesTagsHandler = http.delete(NOTES_TAGS, () =>
  Res.json({ message: 'deleting notes_tags failed' }, { status: 500 })
);

export const errorAddNotesTagsHandler = http.post(NOTES, () =>
  Res.json({ message: 'adding notes_tags failed' }, { status: 500 })
);

export const errorUpdateTagsHandler = http.patch(TAGS, () =>
  Res.json({ message: 'updating tags failed' }, { status: 500 })
);
