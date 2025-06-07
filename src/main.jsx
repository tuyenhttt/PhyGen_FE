import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from '@/contexts/AuthContext.js';
import './index.css';
import { supabase } from '@/supabase/supabaseClient.js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <SessionContextProvider supabaseClient={supabase}>
        <App />
      </SessionContextProvider>
    </AuthProvider>
  </StrictMode>
);
