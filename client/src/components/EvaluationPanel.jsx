import React, { useContext } from 'react';
import { WebSocketContext } from '../context/WebSocketContext';

const EvaluationPanel = () => {
  const { evaluation } = useContext(WebSocketContext);
  let percentage = 0;
  if(evaluation){
    const clippedScore= Math.max(-5, Math.min(5, evaluation.score));
    percentage = ((clippedScore + 5) /10) *100;
  }
  // Style dynamique pour le gradient
  const sliderStyle = {
    background: `linear-gradient(90deg, 
      #ffffff 0%, 
      #ffffff ${percentage}%, 
      #000000 ${percentage}%, 
      #000000 100%
    )`
  };

  return (
    <div className="evaluation-panel">
      <h3>Évaluation</h3>
      <div className="info-group">
        {evaluation ? (
          <>
          {evaluation.score &&
            <div className="info-item score">
              <span className="score-label">{percentage >= 50 ? "+" : ""}{evaluation.score.toFixed(2)}</span>
              <input
                type="range"
                min="0"
                max="100"
                value={percentage}
                readOnly
                className="score-slider"
                style={sliderStyle}
              />
            </div>
}
            <div className="info-item">
              <label>Meilleur coup</label>
              <div className="value move-description">
                <span className="position">{evaluation.bestMove}</span>
              </div>
            </div>
            <div className="info-item">
              <label>Profondeur d'analyse</label>
              <span className="value">{evaluation.depth || 'N/A'}</span>
            </div>
            {evaluation.estimated_elo && (
              <div className="info-item elo-estimate">
                <label>Niveau estimé</label>
                <span className="value">{evaluation.estimated_elo} ELO</span>
              </div>
            )}
          </>
        ) : (
          <div className="info-item">
            <label>En attente d'analyse...</label>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvaluationPanel;
