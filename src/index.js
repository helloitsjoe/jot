import * as React from 'react';
import { createRoot } from 'react-dom/client';
import onSwipe, { Directions } from 'swipey';
import { createApi } from './api';
import { supabase } from './supabase';
import App from './App';
import AuthProvider from './components/Auth';
import ModalProvider from './components/Modal';

const api = createApi(supabase);

const reload = () => window.location.reload(true);
onSwipe(Directions.DOWN, reload, { fromTop: true });

const root = createRoot(document.getElementById('root'));
root.render(
  <ModalProvider>
    <AuthProvider api={api}>
      {({ signOut }) => <App api={api} onSignOut={signOut} />}
    </AuthProvider>
  </ModalProvider>
);
