import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration du chemin pour __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Configuration de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY?.trim();

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERREUR: Configuration Supabase manquante');
  console.error('- SUPABASE_URL:', !!supabaseUrl);
  console.error('- SUPABASE_KEY:', !!supabaseKey);
  throw new Error('Configuration Supabase manquante');
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