import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createApi } from './services';
import { supabase } from './supabase';
import App from './App';

const api = createApi(supabase);

const root = createRoot(document.getElementById('root'));
root.render(<App api={api} />);
