export const getEvaluation = async (fen, difficulty = 'medium') => {
  try {
    const response = await fetch('https://chess-stockfish-080p.onrender.com/api/bestmove', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        fen,
        difficulty // Envoyer le niveau de difficulté au serveur
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération du meilleur coup:', error);
    return null;
  }
};
