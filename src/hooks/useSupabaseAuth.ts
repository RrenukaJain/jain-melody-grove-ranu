import { useAuth } from '@/context/AuthContext';
import { supabase, getAuthenticatedClient } from '@/integrations/supabase/client';

export const useSupabaseAuth = () => {
  const { user } = useAuth();
  
  if (user?.supabaseAccessToken) {
    console.log('useSupabaseAuth: Using authenticated client with token');
    return getAuthenticatedClient(user.supabaseAccessToken);
  }
  
  console.log('useSupabaseAuth: Using anonymous client (no token)');
  return supabase;
};
