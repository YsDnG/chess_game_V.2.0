import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configuration du chemin
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
const envPath = path.resolve(process.cwd(), '.env');
console.log('Chargement du fichier .env depuis:', envPath);

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

// ... reste du code inchangé