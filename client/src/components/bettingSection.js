import React from 'react';

const BettingSection = ({
  playerMoney,
  currentBet,
  chipValues,
  handleChipClick,
  handleClearBet,
  handleDeal,
  handleCashOut,
  lastBet,
  setCurrentBet,
  isMuted,
  toggleMute,
  setShowHelp,
}) => (
  <div className="betting-section">
    <h2>Balance: ${playerMoney - currentBet}</h2>
    <h2>Current Bet: ${currentBet}</h2>
    <div className="chip-container">
      {chipValues
        .filter((_, index) => playerMoney - currentBet >= chipValues[index])
        .map((value, index) => (
          <div
            key={value}
            className={`chip chip-${index + 1}`}
            onClick={() => handleChipClick(value)}
            title={`$${value}`}
          />
        ))}
      <button 
        onClick={handleClearBet}
        disabled={currentBet === 0}
      >Clear Bet</button>
    </div>
    <button 
      onClick={handleDeal} 
      disabled={currentBet === 0}
      className="deal-button"
    >
      Deal
    </button>
    <button
      onClick={() => {
        if (lastBet > 0 && lastBet <= playerMoney) {
          setCurrentBet(lastBet);
        }
      }}
      disabled={lastBet <= 0 || lastBet > playerMoney}
      className="deal-button"
    >
      Rebet
    </button>
    <div className="cashout-button-container">
      <button onClick={handleCashOut}>Cash Out</button>
    </div>
    <div className="top-buttons-container">
      <button onClick={toggleMute}>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
      <button onClick={() => setShowHelp(true)}>
        Help
      </button>
    </div>
  </div>
);

export default BettingSection;