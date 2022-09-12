import { addTagsToNotes } from '../api';

describe('addTagsToNotes', () => {
  // TODO: make individual note/tag objects for reuse
  const notesTags = [
    {
      notes: {
        id: 7,
        created_at: '2022-09-11T04:04:47.477906+00:00',
        user_id: '82523071-2532-4023-88db-2551344807d9',
        tag_ids: [18, 19],
        text: 'test',
      },
      tags: {
        id: 18,
        created_at: '2022-09-09T03:55:20.038122+00:00',
        text: 'bee',
        color: 'lime',
        note_ids: null,
        user_id: '82523071-2532-4023-88db-2551344807d9',
      },
    },
    {
      notes: {
        id: 7,
        created_at: '2022-09-11T04:04:47.477906+00:00',
        user_id: '82523071-2532-4023-88db-2551344807d9',
        tag_ids: [18, 19],
        text: 'test',
      },
      tags: {
        id: 19,
        created_at: '2022-09-09T03:55:33.522825+00:00',
        text: 'buzz',
        color: 'slateblue',
        note_ids: null,
        user_id: '82523071-2532-4023-88db-2551344807d9',
      },
    },
    {
      notes: {
        id: 8,
        created_at: '2022-09-11T04:04:47.477906+00:00',
        user_id: '82523071-2532-4023-88db-2551344807d9',
        tag_ids: [19],
        text: 'test',
      },
      tags: {
        id: 19,
        created_at: '2022-09-09T03:55:33.522825+00:00',
        text: 'buzz',
        color: 'slateblue',
        note_ids: null,
        user_id: '82523071-2532-4023-88db-2551344807d9',
      },
    },
  ];

  it('denormalizes notes_tags', () => {
    expect(addTagsToNotes(notesTags)).toEqual([
      {
        id: 7,
        created_at: '2022-09-11T04:04:47.477906+00:00',
        user_id: '82523071-2532-4023-88db-2551344807d9',
        text: 'test',
        tag_ids: [18, 19],
        tags: [
          {
            id: 18,
            created_at: '2022-09-09T03:55:20.038122+00:00',
            text: 'bee',
            color: 'lime',
            note_ids: null,
            user_id: '82523071-2532-4023-88db-2551344807d9',
          },
          {
            id: 19,
            created_at: '2022-09-09T03:55:33.522825+00:00',
            text: 'buzz',
            color: 'slateblue',
            note_ids: null,
            user_id: '82523071-2532-4023-88db-2551344807d9',
          },
        ],
      },
      {
        id: 8,
        created_at: '2022-09-11T04:04:47.477906+00:00',
        user_id: '82523071-2532-4023-88db-2551344807d9',
        text: 'test',
        tag_ids: [19],
        tags: [
          {
            id: 19,
            created_at: '2022-09-09T03:55:33.522825+00:00',
            text: 'buzz',
            color: 'slateblue',
            note_ids: null,
            user_id: '82523071-2532-4023-88db-2551344807d9',
          },
        ],
      },
    ]);
  });
});
