// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vweiezyatkmlqesejmxj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ3ZWllenlhdGttbHFlc2VqbXhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NTE3NTQsImV4cCI6MjA1MjAyNzc1NH0._BhJttZ9TSpSrY8zbRDyIXy5XR1RQXrB_vm8iC7Wy9I";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);