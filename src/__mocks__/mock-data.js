import { LIME, BLUEVIOLET, SLATEBLUE } from '../../src/constants';

// For denormalization tests
const noteSingleTag = {
  id: 8,
  created_at: '2022-09-11T04:04:47.477906+00:00',
  user_id: '82523071-2532-4023-88db-2551344807d9',
  tag_ids: [19],
  text: 'test-single-tag',
};

const noteMultiTags = {
  id: 7,
  created_at: '2022-09-11T04:04:47.477906+00:00',
  user_id: '82523071-2532-4023-88db-2551344807d9',
  tag_ids: [18, 19],
  text: 'test-multi-tags',
};

const noteNoTags = {
  id: 9,
  created_at: '2022-09-12T04:04:47.477906+00:00',
  user_id: '82523071-2532-4023-88db-2551344807d9',
  text: 'test-no-tags',
};

const tagBee = {
  id: 18,
  created_at: '2022-09-09T03:55:20.038122+00:00',
  text: 'bee',
  color: LIME,
  note_ids: null,
  user_id: '82523071-2532-4023-88db-2551344807d9',
};

const tagBuzz = {
  id: 19,
  created_at: '2022-09-09T03:55:33.522825+00:00',
  text: 'buzz',
  color: SLATEBLUE,
  note_ids: null,
  user_id: '82523071-2532-4023-88db-2551344807d9',
};

const notesTags = [
  {
    notes: noteMultiTags,
    tags: tagBee,
  },
  {
    notes: noteMultiTags,
    tags: tagBuzz,
  },
  {
    notes: noteSingleTag,
    tags: tagBuzz,
  },
];

const allNotes = [noteSingleTag, noteMultiTags, noteNoTags];

// For component tests
const mockTagMeta = { text: 'meta', id: 1, color: LIME };
const mockTagWork = { text: 'work', id: 2, color: BLUEVIOLET };

const mockNoteQuick = { text: 'quick note', id: 1, tags: [mockTagMeta] };
const mockNoteWork = { text: 'work reminder', id: 2, tags: [mockTagWork] };

const mockNotes = [mockNoteQuick, mockNoteWork];
const mockTags = [mockTagMeta, mockTagWork];

const mockUser = { id: '123' };
const mockTokenResponse = {
  access_token: 'foo',
  token_type: 'bearer',
  expires_in: 3600,
  refresh_token: 'bar',
  user: mockUser,
};

module.exports = {
  noteMultiTags,
  noteSingleTag,
  mockTagMeta,
  mockTagWork,
  mockTokenResponse,
  mockNoteQuick,
  mockNoteWork,
  noteNoTags,
  mockNotes,
  mockTags,
  mockUser,
  tagBee,
  tagBuzz,
  allNotes,
  notesTags,
};
