/* eslint-disable import/prefer-default-export */
import { supabase } from './supabase';

export const createApi = (db = supabase) => {
  const getUser = () => db.auth.getUser();

  const signUp = async ({ email, password }) => {
    const { user, error } = await db.auth.signUp({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return user;
  };

  const signIn = async ({ email, password }) => {
    const { user, error } = await db.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return user;
  };

  const addNote = async (text, tags) => {
    // TODO: Supabase
    console.log('text', text);
    console.log('tags', tags);
  };

  const addTag = async ({ text, color }) => {
    // TODO: Supabase
    const { data, error } = await db
      .from('tags')
      .insert([{ text: text.toLowerCase(), color }]);

    if (error) {
      throw error;
    }

    return data;
  };

  const loadTags = async () => {
    // TODO: Supabase
    return db.from('tags').select('*');
    // return Promise.resolve([{ color: 'cornflowerblue', text: 'hello' }]);
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
  };
};
