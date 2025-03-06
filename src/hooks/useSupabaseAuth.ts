import { useAuth } from '@/context/AuthContext';
import { supabase, getAuthenticatedClient } from '@/integrations/supabase/client';

export const useSupabaseAuth = () => {
  const { user } = useAuth();
  
  if (user?.supabaseAccessToken) {
    return getAuthenticatedClient(user.supabaseAccessToken);
  }
  
  return supabase;
};
