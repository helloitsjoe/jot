/* eslint-disable import/prefer-default-export */
import { supabase } from './supabase';

export const createApi = (db = supabase) => {
  const getUser = () => db.auth.getUser();
  const getSession = () => db.auth.getSession();

  const signUp = async ({ email, password }) => {
    const { data, error } = await db.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const signIn = async ({ email, password }) => {
    const { data, error } = await db.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  };

  const addUser = async ({ id }) => {
    const { error } = await db.from('users').insert([{ id }]);
    if (error) {
      throw error;
    }
  };

  const addNote = async (text, tags) => {
    // TODO: Supabase
    console.log('text', text);
    console.log('tags', tags);
  };

  const addTag = async ({ text, color }) => {
    const {
      data: { user },
    } = await db.auth.getUser();
    console.log('user', user);
    const { data, error } = await db
      .from('tags')
      .insert([{ text: text.toLowerCase(), color, user_id: user.id }]);

    if (error) {
      throw error;
    }

    return data;
  };

  const loadTags = async () => {
    const { data: tags, error } = await db.from('tags').select('*');

    if (error) {
      throw error;
    }

    return tags || [];
  };

  // Coerce tags to lowercase
  // Tags are required to have user, text, color

  return {
    getUser,
    signUp,
    signIn,
    addNote,
    addTag,
    loadTags,
    getSession,
    addUser,
  };
};
