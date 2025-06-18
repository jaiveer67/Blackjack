import React from 'react';
import Hand from '../hand';

const SingleHandWrapper = ({
  cards,
  displayValue,
  bet,
  isGameOver,
  resultMessage,
  cardsDealt,
}) => (
  <div className="hand-wrapper">
    <div className="result-message-wrapper">
      {isGameOver && (
        <div className="result-message">{resultMessage}</div>
      )}
    </div>
    <div className="hand-row">
      <div className="hand-label">
        {cardsDealt
          ? `Your Hand (${displayValue})`
          : <span style={{ visibility: "hidden" }}>Your Hand (00)</span>
        }
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

export default SingleHandWrapper;