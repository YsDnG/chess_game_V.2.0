import React, { useState, useEffect, useRef, useContext } from 'react';
import { WebSocketContext } from '../context/WebSocketContext';
import { getEvaluation } from '../services/stockfishService';
import { Chessboard } from 'react-chessboard';
import { onPieceClick, onPieceDrop } from '../utils/MoveHandler';
import { createNewGame } from '../utils/GameState';
import { Chess } from 'chess.js';
import MoveRecapComponents from './MoveRecapComponents';
import GameStatus from './GameStatusComponents';
import { FaHistory } from 'react-icons/fa';

const ChessboardComponent = ({ 
  socket, 
  gameId, 
  playerColor,
  boardSizePx,
  
  displayRecap = true,
  displayStatus = true
}) => {
  
  const [game, setGame] = useState(createNewGame());
  const [squareStyles, setSquareStyles] = useState({});
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState([]);
  const [gameStatus, setGameStatus] = useState("En cours: Au blanc de jouer");
  const [isGameOver, setIsGameOver] = useState(false);
  const [isIAPlaying, setIsIAPlaying] = useState(false);
  const [difficulty, setDifficulty] = useState('debutant');
  const [isIATurn, setIsIATurn] = useState(false);
  const iaColor = "b"
  const [moves, setMoves] = useState([]);
  const { setEvaluation } = useContext(WebSocketContext); // Accès à la fonction pour mettre à jour l'évaluation

  const [screenUnder950px, setScreenUnder950px] = useState(false);
  const [showRecap, setShowRecap] = useState(false);



  const currentGameIdRef = useRef(gameId);  // Permet d’accéder au gameId sans redéclencher useEffect
  const gameRef = useRef(game);             // Permet d’accéder à la game actuelle sans stale state

  useEffect(() => {
    currentGameIdRef.current = gameId;
  }, [gameId]);

  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // 🟢 Nouveau jeu reçu du serveur
        if (data.type === 'gameStart') {
          setGame(new Chess());
          setMoves([]);
          setGameStatus("En cours: Au blanc de jouer");
          setIsGameOver(false);
          return;
        }

        // 🔄 Coup reçu
        if (data.type === 'move' && data.gameId === currentGameIdRef.current) {
          const gameCopy = new Chess(gameRef.current.fen());
          const { from, to, promotion } = data.move;
          const move = gameCopy.move({ from, to, promotion });

          if (!move) {
            console.error("❌ Coup invalide :", data.move);
            return;
          }

          setGame(gameCopy);
          setMoves((prev) => [...prev, `${move.piece}.${move.from} -> ${move.piece}.${move.to}`]);
          requestEvaluation(gameCopy.fen()); // Demande d'évaluation après un coup reçu
          setGameStatus(
            gameCopy.isCheckmate()
              ? 'Échec et mat'
              : gameCopy.turn() === 'w'
                ? 'En cours: Au blanc de jouer'
                : 'En cours: Au noir de jouer'
          );
        }

        // 🚩 Fin de partie
        if (data.type === "gameOver") {
          console.log("📩 Réception de gameOver :", data);
          setGameStatus(data.winner);
          setIsGameOver(true);
          setGame(new Chess());
          setMoves([]);
        }
      } catch (error) {
        console.error("Erreur WebSocket :", error);
      }
    };

    // 🎯 Attache le listener
    socket.addEventListener("message", handleMessage);

    return () => {
      // 🧹 Nettoyage lors d’un changement de socket (ou unmount du composant)
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]); 


  // Effet pour gérer le tour de l'IA
  useEffect(() => {
    if (!isIAPlaying) {
      setIsIATurn(false);
      return; // Ne rien faire si l'IA est désactivée
    }
    
    const currentTurn = game.turn();
    const isIAPlayerTurn = (currentTurn === 'b');
    
    setIsIATurn(isIAPlayerTurn);
    
    if (isIAPlayerTurn && !game.isGameOver()) {
      const fen = game.fen();
      
      const requestIAMove = async () => {
        try {
          const evaluationData = await getEvaluation(fen, difficulty);
          if (!evaluationData?.bestMove) return;
          
          const iaMove = evaluationData.bestMove;
          console.log("IA joue :", iaMove);
          
          const gameCopy = new Chess(fen);
          const move = gameCopy.move({
            from: iaMove.substring(0, 2),
            to: iaMove.substring(2, 4),
            promotion: 'q'
          });
          
          if (move) {
            setGame(gameCopy);
            setMoves(prevMoves => [...prevMoves, move.san]);
            
            if (gameCopy.isGameOver() || gameCopy.isDraw()) {
              setGameStatus("Partie terminée");
              setIsGameOver(true);
            } else {
              const nextTurn = gameCopy.turn() === 'w' ? 'blanc' : 'noir';
              setGameStatus(`En cours: Au ${nextTurn} de jouer`);
              
              // Mettre à jour l'évaluation après le coup de l'IA
              if (setEvaluation) {
                requestEvaluation(gameCopy.fen());
              }
            }
          }
        } catch (e) {
          console.error("Erreur lors du coup de l'IA:", e);
        }
      };
      
      // Petit délai pour laisser le temps à l'UI de se mettre à jour
      const timer = setTimeout(requestIAMove, 300);
      return () => clearTimeout(timer);
    } else if (setEvaluation) {
      // Mettre à jour l'évaluation après le coup du joueur
      requestEvaluation(game.fen());
    }
  }, [game, isIAPlaying, playerColor, difficulty]);
  
  const requestEvaluation = async (fen) => {
    if (!setEvaluation) return;
    
    const evaluationData = await getEvaluation(fen, difficulty);
    if (evaluationData) {
      setEvaluation(evaluationData);
    }
  };

  const handleReset = (isAbandon = false) => {
    if (isAbandon) {
      socket.send(JSON.stringify({ 
        type: "abandon", 
        gameId, 
        playerColor 
      }));
    } else {
      setGameStatus("En cours: Au blanc de jouer");
      setGame(createNewGame()); // Utiliser createNewGame() pour la réinitialisation
      setIsIATurn(false); // Réinitialiser le tour de l'IA
    }
    if (!isAbandon) {
      setGame(createNewGame()); // Réinitialiser seulement en cas de reset, pas d'abandon !
    }
    setIsGameOver(isAbandon); // Si abandon => partie terminée
    setMoves([]);
  };
  

  return (
    <div className="board_recap-container">
      <div className={`chessboard-container ${isGameOver ? 'inactive' : ''}`}>
        <div className="ai-controls">
          <span>Jouer contre l'IA</span>
          <select 
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            disabled={!isIAPlaying}
          >
            <option value="debutant">Débutant (niv 1, ~400 ELO)</option>
            <option value="intermediaire_bas">Intermédiaire bas (niv 3, ~600 ELO)</option>
            <option value="intermediaire">Intermédiaire (niv 7, ~800 ELO)</option>
            <option value="confirme">Confirmé (niv 12, ~1200 ELO)</option>
            <option value="expert">Expert (niv 15, ~1800 ELO)</option>
            <option value="fort">Fort (niv 18, ~2200 ELO)</option>
            <option value="grand_maitre">Grand Maître (niv 20, ~2500 ELO)</option>
          </select>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={isIAPlaying}
              onChange={(e) => setIsIAPlaying(e.target.checked)}
            />
            <span className="slider round"></span>
          </label>
        </div>
        
        <Chessboard 
          position={game.fen()}
          onPieceDrop={(sourceSquare, targetSquare) =>
            !isGameOver && onPieceDrop(
              game,
              sourceSquare,
              targetSquare,
              setGame,
              setSquareStyles,
              setGameStatus,
              setIsGameOver,
              setMoves,
              moves,
              socket,
              gameId,
              playerColor,
              requestEvaluation
            )
          }
          onSquareClick={(square) =>
            !isGameOver && onPieceClick(
              game,
              square,
              setSquareStyles,
              setSelectedSquare,
              selectedSquare,
              possibleMoves,
              setPossibleMoves,
              setGame,
              setGameStatus,
              setIsGameOver,
              setMoves,
              moves,
              socket,
              gameId,
              playerColor,
              requestEvaluation
            )
          }
          boardWidth={boardSizePx}
          customBoardStyle={{
            borderRadius: '4px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
          }}
          customSquareStyles={squareStyles}
          className={isGameOver ? 'chessboard-disabled' : ''}
        />
        
        {displayStatus && (
          <GameStatus 
            gameStatus={gameStatus}
            socket={socket}
            handleReset={handleReset}
          />
        )}
      </div>
      
      {/* Affichage normal pour les grands écrans */}
      {displayRecap && !screenUnder950px && (
        <div className="move-recap-container">
          <MoveRecapComponents move={moves} />
        </div>
      )}
      
      {/* Bouton flottant pour les mobiles */}
      {screenUnder950px && displayRecap && (
        <>
          <button 
            className="show-history-btn" 
            onClick={() => setShowRecap((prev) => !prev)}
            aria-label="Afficher l'historique des coups"
          >
            <FaHistory />
          </button>
          
          {/* Popup d'historique pour mobile */}
          {showRecap && (
            <div className="move-recap-popup show">
              <h4>Historique des coups</h4>
              <div className="move-recap-content">
                <MoveRecapComponents move={moves} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ChessboardComponent;