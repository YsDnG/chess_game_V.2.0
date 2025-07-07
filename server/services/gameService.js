import { supabase } from '../db/supabase.js';

export const GameService = {
  // Créer une nouvelle partie
  async createGame(player1Id, fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
    const { data, error } = await supabase
      .from('games')
      .insert([
        { 
          player1_id: player1Id,
          fen,
          status: 'waiting',
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Rejoindre une partie existante
  async joinGame(gameId, player2Id) {
    const { data, error } = await supabase
      .from('games')
      .update({ 
        player2_id: player2Id,
        status: 'in_progress',
        updated_at: new Date().toISOString()
      })
      .eq('id', gameId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mettre à jour l'état d'une partie
  async updateGame(gameId, updates) {
    const { data, error } = await supabase
      .from('games')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', gameId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Récupérer une partie par son ID
  async getGame(gameId) {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();

    if (error) throw error;
    return data;
  },

  // Récupérer les parties en attente
  async getWaitingGames() {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'waiting');

    if (error) throw error;
    return data;
  }
};
