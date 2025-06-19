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
    <div className="result-message-wrapper" style={{ minHeight: "24px" }}>
      <div
        className="result-message"
        style={{
          visibility: isGameOver && resultMessage ? "visible" : "hidden"
        }}
      >
        {resultMessage || "Placeholder"}
      </div>
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
      <div
  className="current-bet-display"
  style={{ visibility: cardsDealt ? "visible" : "hidden" }}
>
  Bet: ${bet}
</div>
  </div>
);

export default PlayerHandWrapper;