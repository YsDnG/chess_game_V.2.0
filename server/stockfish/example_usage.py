import asyncio
from stockfish_manager import StockfishManager
import chess

def main():
    # Créer une instance de Stockfish avec un niveau moyen (10)
    stockfish = StockfishManager(skill_level=10)
    
    # Créer un plateau d'échecs
    board = chess.Board()
    
    # Exemple d'évaluation de position
    print("Évaluation initiale:", stockfish.evaluate_position(board))
    
    # Exemple de meilleur coup
    best_move = stockfish.get_best_move(board)
    print("Meilleur coup:", best_move)
    
    # Changer le niveau de difficulté
    stockfish.set_skill_level(15)
    print("Niveau de difficulté ajusté à 15")
    
    # Fermer proprement Stockfish
    stockfish.close()

if __name__ == "__main__":
    main()
