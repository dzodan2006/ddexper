import { createClient } from '@supabase/supabase-js';

let rawUrl = import.meta.env.VITE_SUPABASE_URL || '';
// Čistimo URL ako sadrži /rest/v1/ na kraju jer ga SDK sam dodaje
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = supabaseUrl && supabaseUrl.startsWith('https://');

if (!isValidUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing or invalid! Ensure VITE_SUPABASE_URL is like "https://xyz.supabase.co"');
}

export const supabase = createClient(
  isValidUrl ? supabaseUrl : 'https://placeholder-project.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);
