/* eslint-disable import/prefer-default-export */
/* eslint-disable camelcase */
import { supabase } from './supabase';

const validate = (res) => {
  const { data, error } = res;
  if (error) {
    throw error;
  }
  return data;
};

export const addTagsToNotes = (notesTags) => {
  const notesMap = notesTags.reduce((acc, { notes, tags }) => {
    const noteId = notes.id;
    if (!acc[noteId]) {
      acc[noteId] = notes;
    }
    const prevAddedTags = acc[noteId].tags || [];
    acc[noteId].tags = [...prevAddedTags, tags];
    return acc;
  }, {});

  return Object.values(notesMap);
};

export const createApi = (db = supabase) => {
  const getSession = () => db.auth.getSession();

  const getUser = async () => {
    const res = await db.auth.getUser();
    console.log('res', res);
    return validate(res);
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
    console.log('tag_ids', tag_ids);
    if (!tag_ids.length) {
      // TODO: Revisit this
      throw new Error('Notes must have tags');
    }
    // TODO: updated_at
    const {
      user: { id: user_id },
    } = await getUser();

    const res = await db
      .from('notes')
      .insert([{ user_id, text, tag_ids }])
      .select();

    const [note] = validate(res);
    console.log('note.id', note.id);

    const toInsert = tag_ids.map((tag_id) => ({
      user_id,
      note_id: note.id,
      tag_id,
    }));

    await db.from('notes_tags').insert(toInsert).then(validate);

    return note;
  };

  const addTag = async ({ text, color }) => {
    // TODO: updated_at
    if (!text || !color) {
      throw new Error('Text and color are required for tags!');
    }

    const {
      data: { user },
    } = await db.auth.getUser();

    // Tags are required to have user, text, color
    const res = await db
      .from('tags')
      .insert([{ text: text.toLowerCase(), color, user_id: user.id }])
      .select();
    console.log('res', res);

    return validate(res);
  };

  const updateTag = async ({ id, color, text }) => {
    // TODO: updated_at
    const res = await db.from('tags').update({ id, color, text });
    return validate(res);
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
    const res = await db.from('tags').select('*');
    return validate(res) || [];
  };

  const loadNotes = async () => {
    const res = await db.from('notes_tags').select(
      `
      notes (
        *
      ),
      tags (
        *
      )
    `
    );

    const notesTags = validate(res);

    return addTagsToNotes(notesTags);
  };

  return {
    getUser,
    signUp,
    signIn,
    signOut,
    addNote,
    addTag,
    loadTags,
    loadNotes,
    getSession,
    addUser,
    deleteTag,
    deleteNote,
    updateTag,
    updateUser,
  };
};
