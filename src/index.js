import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createApi } from './api';
import { supabase } from './supabase';
import App from './App';
import AuthProvider from './components/Auth';
import ModalProvider from './components/Modal';

const api = createApi(supabase);

const root = createRoot(document.getElementById('root'));
root.render(
  <ModalProvider>
    <AuthProvider api={api}>
      {({ signOut }) => <App api={api} onSignOut={signOut} />}
    </AuthProvider>
  </ModalProvider>
);
