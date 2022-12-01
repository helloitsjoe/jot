import { supabase } from './supabase';

// Supabase returns an error in 200 response, unwrap and throw if it exists.
const validate = (res) => {
  const { data, error } = res;
  if (error) {
    throw error;
  }
  return data;
};

export const addTagsToNotes = (allNotes, notesTags) => {
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

export const createApi = (db = supabase) => {
  const getSession = () => db.auth.getSession();

  const getUser = async () => {
    const res = await db.auth.getUser();
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
    const [user] = validate(res);
    return user;
  };

  const addNote = async (text, tag_ids) => {
    console.log('tag_ids', tag_ids);

    // TODO: updated_at
    const {
      user: { id: user_id },
    } = await getUser();

    // TODO: Batch notes and notes_tags
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

    // console.log('toInsert', toInsert);

    const foo = await db.from('notes_tags').insert(toInsert).select('*');

    console.log('foo', foo);

    return note;
  };

  const updateNote = async ({ id, text, oldTagIds = [], newTagIds = [] }) => {
    // TODO: updated_at
    console.log(
      `Updating... ${text}, old tags: ${oldTagIds}, new tags: ${newTagIds}`
    );

    const {
      user: { id: user_id },
    } = await getUser();

    const toInsert = newTagIds
      .filter((newId) => !oldTagIds.includes(newId))
      .map((tag_id) => ({ user_id, note_id: id, tag_id }));
    const toDelete = oldTagIds
      .filter((oldId) => !newTagIds.includes(oldId))
      .map((tag_id) => ({ note_id: id, tag_id }));

    const promises = [
      db.from('notes').update({ id, text }).select(),
      db.from('notes_tags').insert(toInsert),
      ...toDelete.map(({ note_id, tag_id }) =>
        db
          .from('notes_tags')
          .delete()
          .eq('note_id', note_id)
          .eq('tag_id', tag_id)
      ),
    ];

    // notes_tags response is unused
    const [noteRes, notesTagsRes] = await Promise.all(promises);
    console.log('notesTagsRes', notesTagsRes);
    const [note] = validate(noteRes);
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

    console.log('user', user);

    // Tags are required to have user, text, color
    const res = await db
      .from('tags')
      .insert([{ text: text.toLowerCase(), color, user_id: user.id }], {
        return: 'representation',
      })
      .select();
    console.log('res', res);

    const [newTag] = validate(res);

    return newTag;
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
    console.log('deleted', res);
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
    getSession,
    addUser,
    deleteTag,
    deleteNote,
    updateTag,
    updateUser,
  };
};
