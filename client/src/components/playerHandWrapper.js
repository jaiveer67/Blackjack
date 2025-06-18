import React from 'react';
import Hand from '../hand';

const PlayerHandWrapper = ({
  handNumber,
  cards,
  displayValue,
  bet,
  isActive,
  isGameOver,
  resultMessage,
  cardsDealt,
}) => (
  <div className="hand-wrapper">
    <div className="result-message-wrapper">
      {isGameOver && (
        <div className="result-message" style={{ visibility: isGameOver ? 'visible' : 'hidden' }}>
          {resultMessage}
        </div>
      )}
    </div>
    <div className="hand-row">
      <div className="hand-label">
        {cardsDealt ? (
          <>
            Hand {handNumber} ({displayValue}) {isActive && <span>(Active)</span>}
          </>
        ) : (
          <span style={{ visibility: "hidden" }}>Hand {handNumber} (00)</span>
        )}
      </div>
      <Hand cards={cards} />
    </div>
    {cardsDealt && (
  <div className="current-bet-display">
    Bet: ${bet}
  </div>
)}
  </div>
);

export default PlayerHandWrapper;