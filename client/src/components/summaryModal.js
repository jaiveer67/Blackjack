import React from 'react';

const SummaryModal = ({ showSummary, cashOutSummary, isBankrupt }) => {
  if (!showSummary || !cashOutSummary) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {isBankrupt ? (
          <>
            <h2>Bankrupt!</h2>
            <p>You lose! Better luck next time.</p>
          </>
        ) : (
          <h2>Game Summary</h2>
        )}
        <p><strong>Final Balance:</strong> ${cashOutSummary.finalMoney}</p>
        <p><strong>Max Balance Reached:</strong> ${cashOutSummary.maxMoney}</p>
        <p><strong>Hands Won:</strong> {cashOutSummary.handsWon}</p>
        <p><strong>Net Earnings:</strong> ${cashOutSummary.profit}</p>
        <button onClick={() => window.location.reload()}>New Game</button>
      </div>
    </div>
  );
};

export default SummaryModal;