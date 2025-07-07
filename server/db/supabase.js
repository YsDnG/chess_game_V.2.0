import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Vérification des variables d'environnement
console.log('Configuration Supabase:');
console.log('- URL:', process.env.SUPABASE_URL);
console.log('- Clé API présente:', !!process.env.SUPABASE_KEY);

const supabaseUrl = process.env.SUPABASE_URL || 'https://vcsxawaglymmllesjtfg.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY?.trim(); // Supprime les espaces inutiles

if (!supabaseKey) {
  console.error('❌ ERREUR: SUPABASE_KEY est manquante dans les variables d\'environnement');
  throw new Error('SUPABASE_KEY is not defined in environment variables');
}

let supabase;

try {
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  console.log('✅ Client Supabase initialisé avec succès');
} catch (error) {
  console.error('❌ Erreur lors de la création du client Supabase:', error.message);
  throw error;
}

export default supabase;
