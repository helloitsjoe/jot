import * as React from 'react';
import { createRoot } from 'react-dom/client';
import onSwipe, { Directions } from 'swipey';
import { createApi } from './api';
import { createSupabase } from './supabase';
import App from './App';
import AuthProvider from './components/Auth';
import ModalProvider from './components/Modal';

const api = createApi(createSupabase());

const reload = () => window.location.reload();
onSwipe(Directions.DOWN, reload, { fromTop: true });

const root = createRoot(document.getElementById('root'));
root.render(
  <ModalProvider>
    <AuthProvider api={api}>
      {({ signOut }) => <App api={api} onSignOut={signOut} />}
    </AuthProvider>
  </ModalProvider>
);
