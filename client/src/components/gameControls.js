import React from 'react';

const GameControls = ({
  gameStarted,
  cardsDealt,
  turnOver,
  handleHit,
  handleStand,
  handleDouble,
  handleSplit,
  playerMoney,
  currentBet,
  canDouble,
  playerHand1,
  playerValue2,
  isSplit,
  getCardValue,
}) => (
  <div
    className="controls"
    style={{ visibility: gameStarted && cardsDealt && !turnOver ? 'visible' : 'hidden' }}
  >
    <button onClick={handleHit}>Hit</button>
    <button onClick={handleStand}>Stand</button>
    <button
      disabled={playerMoney < currentBet || !canDouble}
      onClick={handleDouble}
    >
      Double
    </button>
    <button
      onClick={handleSplit}
      disabled={
        playerHand1.length !== 2 ||
        getCardValue(playerHand1[0]) !== getCardValue(playerHand1[1]) ||
        playerValue2 !== 0 ||
        playerMoney < currentBet ||
        isSplit
      }
    >
      Split
    </button>
  </div>
);

export default GameControls;