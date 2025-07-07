from flask import Flask, request, jsonify
from flask_cors import CORS
import chess
import sys
import os

# Ajoute le répertoire parent au chemin de recherche de Python
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from stockfish_manager import StockfishManager
import asyncio

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialisation de StockfishManager
# Mettre dans un try-except pour gérer une éventuelle FileNotFoundError
try:
    stockfish = StockfishManager(skill_level=15)
except FileNotFoundError as e:
    print(f"ERREUR CRITIQUE: {e}")
    print("Veuillez vous assurer que l'exécutable Stockfish est présent à la racine du projet ou dans le dossier 'server'.")
    # On pourrait choisir de quitter l'application ici si Stockfish est indispensable
    # sys.exit(1) 
    stockfish = None # Permet à l'app de démarrer mais les routes Stockfish échoueront

@app.route('/api/bestmove', methods=['POST'])
def get_best_move_route():
    if not stockfish:
        return jsonify({'error': 'Stockfish engine not initialized.'}), 503  # Service Unavailable
    try:
        data = request.get_json()
        if not data or 'fen' not in data:
            return jsonify({'error': 'FEN string is required'}), 400
            
        difficulty = data.get('difficulty', 'medium')
        
        # Configuration de Stockfish en fonction de la difficulté
        # Niveaux ajustés pour correspondre exactement aux niveaux de get_estimated_elo
        if difficulty == 'debutant':
            # Niveau débutant
            stockfish.set_skill_level(level=1, depth=5)
        elif difficulty == 'intermediaire_bas':
            # Niveau intermédiaire bas
            stockfish.set_skill_level(level=3, depth=8)
        elif difficulty == 'intermediaire':
            # Niveau intermédiaire
            stockfish.set_skill_level(level=7, depth=10)
        elif difficulty == 'confirme':
            # Niveau confirmé
            stockfish.set_skill_level(level=12, depth=12)
        elif difficulty == 'expert':
            # Niveau expert
            stockfish.set_skill_level(level=15, depth=15)
        elif difficulty == 'fort':
            # Niveau fort
            stockfish.set_skill_level(level=18, depth=18)
        elif difficulty == 'grand_maitre':
            # Niveau grand maître
            stockfish.set_skill_level(level=20, depth=20)
        else:
            # Niveau par défaut (débutant)
            stockfish.set_skill_level(level=1, depth=5)

            
        app.logger.info(f"Difficulté: {difficulty}, Niveau: {stockfish.skill_level}, Profondeur: {stockfish.depth}")
        
        board = chess.Board(data['fen'])
        # Utilisation de la profondeur définie dans stockfish
        evaluation_data = stockfish.get_best_move(board, depth=None)  # None pour utiliser la profondeur par défaut
        # Ajout de l'estimation ELO
        evaluation_data['estimated_elo'] = stockfish.get_estimated_elo()
        return jsonify(evaluation_data)
        
    except Exception as e:
        # Log l'erreur côté serveur pour le débogage
        app.logger.error(f"Error in /api/bestmove: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Configuration du logging pour Flask
    import logging
    logging.basicConfig(level=logging.INFO)
    # Si vous voulez voir les logs de Flask en mode DEBUG (plus verbeux)
    # app.logger.setLevel(logging.DEBUG)
    
    # Vérifier si Stockfish a été initialisé avant de démarrer
    if not stockfish:
        print("ATTENTION: Le serveur Flask démarre, mais Stockfish n'a pas pu être initialisé.")
        print("Les requêtes à /api/bestmove échoueront.")

    app.run(host='0.0.0.0', port=5000, debug=True) # debug=True est utile pour le développement, debug=True)  # ← active le mode debug ici

