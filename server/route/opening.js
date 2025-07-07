import express from 'express';
import supabase from '../db/supabase.js';

const router = express.Router();

// Route GET /api/openings
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('openings')
      .select('*');

    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération des ouvertures:', error);
    res.status(500).json({ 
      message: 'Erreur serveur',
      details: error.message 
    });
  }
});

export default router;
