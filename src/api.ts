import { createSupabase } from './supabase';
import type { Tables } from './supabase.types';
import type { AuthError, PostgrestError } from '@supabase/supabase-js';
export type { User } from '@supabase/auth-js';

export type Note = Tables<'notes'>;
export type Tag = Tables<'tags'>;
export type NotesTags = Tables<'notes_tags'>;
export type API = ReturnType<typeof createApi>;

type ResponseError = AuthError | PostgrestError;

// Supabase returns an error in 200 response, unwrap and throw if it exists.
const validate = <T>(res: { data?: T; error?: ResponseError }) => {
  const { data, error } = res;
  if (error) {
    throw error;
  }
  return data;
};

export const addTagsToNotes = (
  allNotes: Note[],
  notesTags: { notes: Note; tags: Tag }[]
) => {
  const notesMap = notesTags.reduce((acc, { notes, tags }) => {
    const noteId = notes.id;
    if (!acc[noteId]) {
      acc[noteId] = notes;
    }
    const prevAddedTags = acc[noteId].tags || [];
    acc[noteId].tags = [...prevAddedTags, tags];
    return acc;
  }, {});

  return allNotes.map((note) => {
    if (notesMap[note.id]) {
      return notesMap[note.id];
    }
    return { ...note, tags: [] };
  });
};

// auth.getUser() gets user from session if JWT is not provided. This causes
// problems in tests where there is no current session. Passing optional jwt
// only for tests. This is not a great solution.
export const createApi = ({ jwt = undefined, ...clientOptions } = {}) => {
  const db = createSupabase(clientOptions);

  const getUser = async () => {
    const res = await db.auth.getUser(jwt);
    const { user } = validate(res);
    return user;
  };

  const signUp = async ({ email, password }) => {
    const res = await db.auth.signUp({
      email,
      password,
    });

    return validate(res);
  };

  const signIn = async ({ email, password }) => {
    const res = await db.auth.signInWithPassword({
      email,
      password,
    });

    return validate(res);
  };

  const updateUser = async ({ email, password }) => {
    const res = await db.auth.updateUser({
      email,
      password,
    });

    return validate(res);
  };

  const signOut = async () => {
    const res = await db.auth.signOut();
    return validate(res);
  };

  const addUser = async ({ id }) => {
    const res = await db.from('users').insert([{ id }]);
    return validate(res);
  };

  const addNote = async (text, tag_ids) => {
    const { id: user_id } = await getUser();

    // TODO: Batch notes and notes_tags
    const res = await db
      .from('notes')
      .insert([{ user_id, text, tag_ids }])
      .select();

    const [note] = validate(res);

    const toInsert = tag_ids.map((tag_id) => ({
      user_id,
      note_id: note.id,
      tag_id,
    }));

    const promises = [
      ...tag_ids.map((id) =>
        db
          .from('tags')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', id)
      ),
      db.from('notes_tags').insert(toInsert),
    ];

    const resp = await Promise.all(promises);

    resp.forEach(validate);

    return note;
  };

  const updateNote = async ({ id, text, oldTagIds = [], newTagIds = [] }) => {
    // TODO: updated_at
    console.log(
      `Updating... ${text}, old tags: ${oldTagIds}, new tags: ${newTagIds}`
    );

    const { id: user_id } = await getUser();

    const toInsert = newTagIds
      .filter((newId) => !oldTagIds.includes(newId))
      .map((tag_id) => ({ user_id, note_id: id, tag_id }));
    const toDelete = oldTagIds
      .filter((oldId) => !newTagIds.includes(oldId))
      .map((tag_id) => ({ note_id: id, tag_id }));

    const promises = [
      db.from('notes').update({ text }).eq('id', id).select(),
      db.from('notes_tags').insert(toInsert),
      ...toDelete.map(({ note_id, tag_id }) =>
        db
          .from('notes_tags')
          .delete()
          .eq('note_id', note_id)
          .eq('tag_id', tag_id)
      ),
    ];

    // notes_tags response is unused but still validate for errors
    const [noteRes, notesTagsRes] = await Promise.all(promises);
    validate(notesTagsRes);
    const [note] = validate(noteRes);
    return note;
  };

  const addTag = async ({ text, color }) => {
    if (!text || !color) {
      throw new Error('Text and color are required for tags!');
    }

    const user = await getUser();

    console.log('user', user);

    // Tags are required to have user, text, color
    const res = await db
      .from('tags')
      .insert([
        {
          text: text.toLowerCase(),
          color,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    const [newTag] = validate(res);

    return newTag;
  };

  const updateTag = async ({ id, color, text }) => {
    const res = await db
      .from('tags')
      .update({ id, color, text, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select();

    const [updatedTag] = validate(res);
    return updatedTag;
  };

  // TODO: Soft delete
  const deleteTag = async ({ id }) => {
    await db.from('notes_tags').delete().eq('tag_id', id).then(validate);
    const res = await db.from('tags').delete().eq('id', id);
    return validate(res);
  };

  const deleteNote = async ({ id }) => {
    await db.from('notes_tags').delete().eq('note_id', id).then(validate);
    const res = await db.from('notes').delete().eq('id', id);
    return validate(res);
  };

  const loadTags = async () => {
    console.log('loading tags...');
    const res = await db.from('tags').select('*');
    return validate(res) || [];
  };

  const loadNotes = async () => {
    console.log('loading notes......');
    const notesPromise = db.from('notes').select('*').then(validate);
    const notesTagsPromise = db
      .from('notes_tags')
      .select(
        `
      notes (
        *
      ),
      tags (
        *
      )
    `
      )
      .then(validate);

    const [notes, notesTags] = await Promise.all([
      notesPromise,
      notesTagsPromise,
    ]);

    // Combine notes with tags and notes without tags
    return addTagsToNotes(notes, notesTags);
  };

  return {
    getUser,
    signUp,
    signIn,
    signOut,
    addNote,
    updateNote,
    addTag,
    loadTags,
    loadNotes,
    addUser,
    deleteTag,
    deleteNote,
    updateTag,
    updateUser,
  };
};
