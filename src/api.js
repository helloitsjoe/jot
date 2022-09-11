/* eslint-disable import/prefer-default-export */
import { supabase } from './supabase';

const validate = (res) => {
  const { data, error } = res;
  if (error) {
    throw error;
  }
  return data;
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

  const addNote = async (text, tagIds) => {
    const res = await db.from('notes').insert([{ text, tag_ids: tagIds }]);
    return validate(res);
  };

  const addTag = async ({ text, color }) => {
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
    const res = await db.from('tags').update({ id, color, text });
    return validate(res);
  };

  const deleteTag = async ({ id }) => {
    const res = await db.from('tags').delete().eq('id', id);
    return validate(res);
  };

  const loadTags = async () => {
    const res = await db.from('tags').select('*');

    return validate(res) || [];
  };

  return {
    getUser,
    signUp,
    signIn,
    signOut,
    addNote,
    addTag,
    loadTags,
    getSession,
    addUser,
    deleteTag,
    updateTag,
    updateUser,
  };
};
