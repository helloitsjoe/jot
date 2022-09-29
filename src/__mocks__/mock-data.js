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
  color: 'lime',
  note_ids: null,
  user_id: '82523071-2532-4023-88db-2551344807d9',
};

const tagBuzz = {
  id: 19,
  created_at: '2022-09-09T03:55:33.522825+00:00',
  text: 'buzz',
  color: 'slateblue',
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

module.exports = {
  noteMultiTags,
  noteSingleTag,
  noteNoTags,
  tagBee,
  tagBuzz,
  allNotes,
  notesTags,
};
