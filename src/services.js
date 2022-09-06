/* eslint-disable import/prefer-default-export */
import { supabase } from './supabase';

export const createApi = (db = supabase) => {
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
    addNote,
    addTag,
    loadTags,
  };
};
