// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://bybxkhgchcqyohvxyfhu.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5YnhraGdjaGNxeW9odnh5Zmh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcwMzg1MzgsImV4cCI6MjA1MjYxNDUzOH0.noPpDBiU61MZJkJ0ECzVShQOC1TOBx-YBsb6_BdfbEQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);