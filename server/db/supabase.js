import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration du chemin
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
const envPath = process.env.NODE_ENV === 'production' 
  ? path.resolve(process.cwd(), '.env')
  : path.resolve(process.cwd(), '../../.env');

console.log('Chargement du fichier .env depuis:', envPath);
console.log('Dossier de travail:', process.cwd());
console.log('__dirname:', __dirname);

dotenv.config({ path: envPath });


// Vérification des variables d'environnement
console.log('Variables d\'environnement chargées:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- SUPABASE_URL:', process.env.SUPABASE_URL ? 'définie' : 'non définie');
console.log('- SUPABASE_KEY:', process.env.SUPABASE_KEY ? 'définie' : 'non définie');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY?.trim();

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configuration Supabase manquante:');
  console.error('- SUPABASE_URL:', supabaseUrl || 'non définie');
  console.error('- SUPABASE_KEY:', supabaseKey ? 'définie' : 'non définie');
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

export { supabase };
// Compatibilité avec les imports existants
export default supabase;