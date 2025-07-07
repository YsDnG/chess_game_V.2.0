import { createClient } from '@supabase/supabase-js';

// Configuration pour le frontend (utilisez la clé anon pour le frontend)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://vcsxawaglymmllesjtfg.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.warn('Avertissement: REACT_APP_SUPABASE_ANON_KEY n\'est pas définie');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

export default supabase;
