import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rnhwyzatwocjkkikldve.supabase.co";
// const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaHd5emF0d29jamtraWtsZHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzOTUyMDEsImV4cCI6MjA1NDk3MTIwMX0.9S_bB3LqwJ_iS8NCNmSPcbld5yTfaF1EvnNEkun9u6Y";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuaHd5emF0d29jamtraWtsZHZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNzUzMDksImV4cCI6MjA1Njk1MTMwOX0.14swsOmKchfmGpQ5Yh2b48BPowrUOY0K3rVPlu3ERks";

// Base client for unauthenticated access
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Authenticated client with JWT from Clerk
export const getAuthenticatedClient = (accessToken: string) => {
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  });
};
