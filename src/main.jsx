import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { supabase } from '@/supabase/supabaseClient.js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { AuthProvider } from '@/contexts/AuthContext.jsx';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <SessionContextProvider supabaseClient={supabase}>
      <App />
    </SessionContextProvider>
  </AuthProvider>
);
