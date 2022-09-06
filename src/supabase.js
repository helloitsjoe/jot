import { createClient } from '@supabase/supabase-js';

const URL = 'https://faxousvhzthjbkpymmvz.supabase.co';
const ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZheG91c3ZoenRoamJrcHltbXZ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjI0MDg5MTMsImV4cCI6MTk3Nzk4NDkxM30.Cd9IHu1z3vB8ddz9v6-wki3_Keym0y2iUi6YnWpspfg';

export const supabase = createClient(URL, ANON_KEY);
