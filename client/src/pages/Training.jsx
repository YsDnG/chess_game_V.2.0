import '../App.css';
import ChessboardComponent from '../components/ChessboardComponents.jsx';
import React, { useState, useEffect, useContext } from 'react';
import { WebSocketContext } from '../context/WebSocketContext.jsx';
import CardsSection from '../components/CardsSections.jsx';
import Header from '../components/Header.jsx';
import EvaluationPanel from '../components/EvaluationPanel.jsx';

const Training = () => {
  const { socket, gameId, playerColor, findOrCreateGame, errorPopup, setErrorPopup, quitGame } = useContext(WebSocketContext);

  const [mediawidth, setMediawidth] = useState(window.innerWidth);
  const [boardSizePx, setboardSizePx] = useState(300);


  const calculateWidth = (width) => {
    const percent = Math.floor(width * 0.3333);
    const clamped = Math.max(200, Math.min(percent, 450));
    return clamped;
  };

  useEffect(() => {
    const updateWidth = () => {
      const widthScreen = window.innerWidth;
      setboardSizePx(calculateWidth(widthScreen));
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <>
      {errorPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <p>{errorPopup}</p>
            <button onClick={() => setErrorPopup(null)}>Fermer</button>
          </div>
        </div>
      )}

      <div className="App">
        <div className="header">
          <Header />
        </div>

        
          <CardsSection 
            findOrCreateGame={findOrCreateGame} 
            quitData={{quitGame,gameId,playerColor}}
          />
        

        <div className={mediawidth < 950 ? "small-media-display" : "desktop-display"}>
          <main className="game-section">
            <EvaluationPanel />
            <ChessboardComponent
              key={gameId || "solo"}
              socket={gameId ? socket : null}
              gameId={gameId}
              playerColor={playerColor}
              boardSizePx={boardSizePx}

            />
          </main>
        </div>
      </div>
    </>
  );
};

export default Training;
