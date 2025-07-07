import chess
import chess.engine
import os
import random
from typing import List, Optional, Dict, Any

class StockfishManager:
    def __init__(self, skill_level: int = 15):
        """
        Initialise le gestionnaire Stockfish avec un niveau de difficulté.
        
        Args:
            skill_level: Niveau de compétence entre 0 (très facile) et 20 (très difficile)
        """
        self.stockfish_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "stockfish")
        
        if not os.path.exists(self.stockfish_path):
            # Essayer dans le dossier 'server'
            self.stockfish_path = os.path.join(
                os.path.dirname(os.path.abspath(__file__)), 
                "server", 
                "stockfish"
            )
            if not os.path.exists(self.stockfish_path):
                raise FileNotFoundError(f"Stockfish executable not found at {self.stockfish_path}")

        self.engine = chess.engine.SimpleEngine.popen_uci(self.stockfish_path)
        self.skill_level = skill_level
        self.depth = 15  # Profondeur par défaut
        self.randomness = self._calculate_randomness()

    def _calculate_randomness(self) -> float:
        """
        Calcule le facteur d'aléa en fonction du niveau de compétence.
        Plus le niveau est bas, plus l'aléa est élevé.
        """
        # Correspondance niveau -> ELO
        level_to_elo = {
            1: 400,    # Débutant
            3: 600,    # Intermédiaire bas
            7: 800,    # Intermédiaire
            12: 1200,  # Confirmé
            15: 1800,  # Expert
            18: 2200,  # Fort
            20: 2500   # Grand maître
        }
        
        elo = level_to_elo.get(self.skill_level, 2500)
        # Calcul : 0.8 - (ELO / 2500 * 0.79)
        # Donne une plage d'environ 0.8 pour 400 ELO à 0.01 pour 2500 ELO
        randomness = max(0.01, 0.8 - (elo / 2500 * 0.79))
        return round(randomness, 2)
        
    def _get_mistake_probability(self) -> float:
        """
        Retourne la probabilité de faire une erreur en fonction du niveau de compétence.
        - En dessous de 1800 ELO : 15% de base, -1% par 100 ELO
        - Au-dessus de 1800 ELO : décroissance rapide vers 0.1% à 2000 ELO
        """
        # Correspondance niveau -> ELO
        level_to_elo = {
            1: 400,    # Débutant
            3: 600,    # Intermédiaire bas
            7: 800,    # Intermédiaire
            12: 1200,  # Confirmé
            15: 1800,  # Expert
            18: 2200,  # Fort
            20: 2500   # Grand maître
        }
        
        elo = level_to_elo.get(self.skill_level, 2500)
        
        if elo < 1800:
            # Formule pour ELO < 1800 : 15% - (ELO/100 * 1%)
            probability = 0.15 - (elo / 100) * 0.01
        else:
            # Formule pour ELO >= 1800 : 1% à 1800 ELO, 0.1% à 2000 ELO, puis plat
            if elo >= 2000:
                probability = 0.001  # 0.1% à partir de 2000 ELO
            else:
                # Décroissance linéaire de 1% à 1800 ELO à 0.1% à 2000 ELO
                progress = (elo - 1800) / 200  # 0 à 1 entre 1800 et 2000
                probability = 0.01 - (0.01 - 0.001) * progress
        
        # On ne descend jamais en dessous de 0.1%
        return max(0.001, round(probability, 3))
        
    def make_mistake(self, board: chess.Board, severity: float = None) -> str:
        """
        Sélectionne un coup aléatoire potentiellement mauvais.
        
        Args:
            board: Position actuelle de l'échiquier
            severity: Niveau de sévérité de l'erreur (0.0 à 1.0), si None utilise une valeur par niveau
            
        Returns:
            Un coup UCI potentiellement mauvais
        """
        # Définit la sévérité en fonction du niveau si non spécifiée
        if severity is None:
            if self.skill_level == 1:    # Débutant
                severity = 0.9
            elif self.skill_level == 3:  # Intermédiaire bas
                severity = 0.7
            elif self.skill_level == 7:  # Intermédiaire
                severity = 0.5
            elif self.skill_level == 12: # Confirmé
                severity = 0.3
            elif self.skill_level == 15: # Expert
                severity = 0.1
            elif self.skill_level == 18: # Fort
                severity = 0.05
            else:                        # Grand maître
                severity = 0.0
        """
        Sélectionne un coup aléatoire potentiellement mauvais.
        
        Args:
            board: Position actuelle de l'échiquier
            severity: Niveau de sévérité de l'erreur (0.0 à 1.0)
            
        Returns:
            Un coup UCI potentiellement mauvais
        """
        legal_moves = list(board.legal_moves)
        if not legal_moves:
            return None
            
        # Si très peu de coups possibles, on en choisit un au hasard
        if len(legal_moves) <= 2:
            return random.choice(legal_moves).uci()
            
        evaluations = []
        
        # Évaluation rapide de chaque coup légal
        for move in legal_moves:
            board.push(move)
            try:
                eval_result = self.engine.analyse(board, chess.engine.Limit(depth=3, nodes=100))
                score = eval_result['score'].white().score(mate_score=10000)
                evaluations.append((move, score if score is not None else 0))
            except Exception as e:
                evaluations.append((move, 0))
            board.pop()
        
        # Trie du pire au meilleur
        evaluations.sort(key=lambda x: x[1])
        
        # On prend un coup parmi les pires en fonction de la sévérité
        index = min(int(len(evaluations) * severity), len(evaluations) - 1)
        move = evaluations[random.randint(0, index)][0]
        return move.uci()

    def set_skill_level(self, level: int, depth: Optional[int] = None) -> None:
        """
        Définit le niveau de compétence du moteur (0-20) et éventuellement la profondeur.
        
        Args:
            level: Niveau de compétence entre 0 et 20
            depth: Profondeur d'analyse (optionnel)
        """
        if not 0 <= level <= 20:
            raise ValueError("Le niveau de compétence doit être compris entre 0 et 20")
            
        self.skill_level = level
        if depth is not None:
            self.depth = depth
            
        self.randomness = self._calculate_randomness()
        
        # Configuration de base du moteur Stockfish
        config = {
            "Skill Level": self.skill_level
        }
        
        # N'appliquer que les options supportées
        supported_options = self.engine.options.keys()
        valid_config = {k: v for k, v in config.items() 
                       if k.lower() in (opt.lower() for opt in supported_options)}
        
        if valid_config:
            self.engine.configure(valid_config)

    def get_best_move(self, board: chess.Board, depth: Optional[int] = None, 
                     time_limit: float = 0.5, randomness: Optional[float] = None) -> Dict[str, Any]:
        """
        Analyse la position et retourne une évaluation complète.
        
        Args:
            board: Position actuelle de l'échiquier
            depth: Profondeur d'analyse (optionnel)
            time_limit: Temps maximum d'analyse en secondes
            randomness: Niveau d'aléa (0.0 à 1.0), si None utilise la valeur par défaut
            
        Returns:
            Dictionnaire contenant le score, le meilleur coup et la profondeur
        """
        # Utilisation de la profondeur fournie ou de la profondeur par défaut
        current_depth = depth if depth is not None else self.depth
        limit = chess.engine.Limit(depth=current_depth) if depth is not None else chess.engine.Limit(time=time_limit)
        
        # On stocke la profondeur utilisée pour ce coup
        depth_used = current_depth

        # Gestion des erreurs potentielles
        current_randomness = self.randomness if randomness is None else randomness
        
        # Probabilité de faire une grosse erreur (diminue avec le niveau)
        if random.random() < self._get_mistake_probability():
            mistake_move = self.make_mistake(board, severity=0.7)
            if mistake_move:
                # Créer un objet info pour le coup d'erreur
                info = {
                    'pv': [chess.Move.from_uci(mistake_move)],
                    'score': chess.engine.PovScore(chess.engine.Cp(0), chess.WHITE),
                    'depth': 3
                }
                return {
                    'score': 0,
                    'bestMove': mistake_move,
                    'depth': current_depth,
                    'is_mistake': True
                }
        
        # Sinon, logique normale avec aléa contrôlé
        if current_randomness > 0.05:  # Seuil minimal d'aléa
            # Pour les niveaux bas, on prend plus de coups en compte
            num_moves = max(2, min(5, int(1 + (current_randomness * 10))))
            top_moves = self.get_top_moves(board, num_moves=num_moves, time_limit=time_limit)
            
            # On choisit aléatoirement parmi les meilleurs coups, avec biais vers les meilleurs
            if top_moves and len(top_moves) > 1:
                # Poids exponentiellement décroissant
                weights = [(1.0 / (i + 1)) ** (1.0 / (current_randomness + 0.1)) 
                          for i in range(len(top_moves))]
                total = sum(weights)
                weights = [w/total for w in weights]
                
                # Choix pondéré
                chosen_move = random.choices(top_moves, weights=weights, k=1)[0]
                info = chosen_move
            else:
                info = self.engine.analyse(board, limit)
        else:
            info = self.engine.analyse(board, limit)
            
        # Extraction du meilleur coup et du score
        best_move = info.get('pv', [None])[0] if info else None
        score_obj = info.get('score', chess.engine.PovScore(chess.engine.Mate(0), chess.WHITE))
        
        # Conversion du score en une valeur numérique simple
        if score_obj.is_mate():
            # Si c'est un mat, on retourne une valeur élevée avec le signe approprié
            score = 1000 if score_obj.relative.mate() > 0 else -1000
        else:
            # Sinon, on prend le score en centièmes de pion
            score = score_obj.relative.score(mate_score=10000) / 100.0
        
        # On utilise la profondeur configurée plutôt que celle de l'analyse
        depth_used = current_depth
        
        return {
            "score": score,
            "bestMove": best_move.uci() if best_move else None,
            "depth": depth_used,
            "is_mistake": False
        }

    def get_top_moves(self, board: chess.Board, num_moves: int = 3, time_limit: float = 0.5) -> List[Dict[str, Any]]:
        """
        Récupère les N meilleurs coups pour une position donnée.
        
        Args:
            board: Position actuelle de l'échiquier
            num_moves: Nombre de meilleurs coups à retourner
            time_limit: Temps maximum d'analyse en secondes
            
        Returns:
            Liste des meilleurs coups avec leurs évaluations
        """
        result = self.engine.analyse(
            board,
            chess.engine.Limit(time=time_limit),
            multipv=num_moves
        )
        
        if not isinstance(result, list):
            result = [result]
            
        return result
        
    def get_top_moves_list(self, board: chess.Board, num_moves: int = 3, time_limit: float = 0.5) -> List[Dict[str, Any]]:
        """
        Version simplifiée de get_top_moves pour compatibilité ascendante.
        """
        results = self.get_top_moves(board, num_moves, time_limit)
        return [{"pv": r.get("pv", [])[:1]} for r in results]  # Ne garder que le premier coup de chaque variation

    def play_move(self, board: chess.Board, randomness: Optional[float] = None) -> Optional[str]:
        """
        Joue un coup sur l'échiquier avec un niveau d'aléa donné.
        
        Args:
            board: Position actuelle de l'échiquier
            randomness: Niveau d'aléa (0.0 à 1.0), si None utilise la valeur par défaut
            
        Returns:
            Le coup joué en notation UCI, ou None si aucun coup n'est possible
        """
        if board.is_game_over():
            return None
            
        current_randomness = self.randomness if randomness is None else randomness
        
        # Pour les très hauts niveaux d'aléa, on choisit un coup totalement aléatoire
        if current_randomness > 0.8 and random.random() < 0.3:  # 30% de chance de faire un coup aléatoire
            legal_moves = [move.uci() for move in board.legal_moves]
            if legal_moves:
                return random.choice(legal_moves)
        
        # Sinon, on utilise la logique de get_best_move
        result = self.get_best_move(board, randomness=current_randomness)
        return result.get("bestMove")

    def get_estimated_elo(self) -> int:
        """
        Retourne une estimation du niveau ELO basée sur le niveau de compétence actuel.
        
        Returns:
            int: Estimation du niveau ELO basée sur les niveaux du serveur
        """
        # Mapping des niveaux de compétence vers des plages ELO spécifiques
        if self.skill_level <= 1:    # Débutant
            return 400
        elif self.skill_level <= 3:   # Intermédiaire bas
            return 600
        elif self.skill_level <= 7:   # Intermédiaire
            return 800
        elif self.skill_level <= 12:  # Confirmé
            return 1200
        elif self.skill_level <= 15:  # Expert
            return 1800
        elif self.skill_level <= 18:  # Fort
            return 2200
        else:                         # Grand maître
            return 2500

    def close(self) -> None:
        """
        Ferme proprement le moteur Stockfish.
        """
        try:
            if self.engine:
                self.engine.quit()
        except Exception as e:
            print(f"Erreur lors de la fermeture du moteur: {e}")
