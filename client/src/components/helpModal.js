import React from 'react';

const HelpModal = ({ showHelp, helpPage, setShowHelp, setHelpPage }) => {
  if (!showHelp) return null;

  return (
    <div className="help-modal-overlay">
      <div className="help-modal-content">
        <button
          className="close-help-x"
          onClick={() => {
            setShowHelp(false);
            setHelpPage(1);
          }}
        >
          ❌
        </button>
        {helpPage === 1 && (
          <>
            <h2>What Is Blackjack?</h2>
            <p>
              Blackjack is a popular card game where the goal is to beat the dealer by getting as close to 21 as possible without going over. 
              It’s also known as "21" and is one of the most played casino games worldwide.
            </p>
            <p>
              Players are initially dealt two cards and can choose to draw another card ("Hit") to improve their hand or stick with what they have ("Stand").
            </p>
          </>
        )}
        {helpPage === 2 && (
          <>
            <h2>How to Play</h2>
            <ul style={{ textAlign: 'left' }}>
              <li><strong>Hit:</strong> Take another card to get closer to 21.</li>
              <li><strong>Stand:</strong> Keep your current hand and end your turn.</li>
              <li><strong>Double:</strong> Double your bet, receive one more card, and end your turn.</li>
              <li><strong>Split:</strong> If your first two cards are the same value, you can split them into two hands.</li>
            </ul>
            <p>
              Aces count as either 1 or 11. Face cards (J, Q, K) count as 10.
            </p>
          </>
        )}
        {helpPage === 3 && (
          <>
            <h2>Dealer Rules & Payouts</h2>
            <p>
              After the player has finished, the dealer reveals their hidden card and draws cards until reaching at least 17.
              Depending on the selected game options, the dealer may either <strong>stand</strong> or <strong>hit on a soft 17</strong> (a hand totaling 17 that includes an Ace counted as 11).
            </p>
            <p>
              If the dealer busts (goes over 21), the player wins. If not, the hand closer to 21 wins.
            </p>
            <p>
              <strong>Payouts:</strong>
            </p>
            <ul style={{ textAlign: 'left' }}>
              <li>Win: 2× your bet</li>
              <li>Blackjack: 3:2 payout (if you get 21 with your first 2 cards)</li>
              <li>Push (tie): Bet returned</li>
              <li>Lose: You lose your bet</li>
            </ul>
          </>
        )}
        {helpPage === 4 && (
          <>
            <h2>Insurance</h2>
            <p>
              If the dealer’s face-up card is an Ace, you’ll be offered the option to take <strong>Insurance</strong>.
            </p>
            <p>
              Insurance is a side bet that costs half your original bet. It pays 2:1 if the dealer has a Blackjack.
              This way, you can break even even if the dealer wins.
            </p>
            <p>
              If the dealer does <strong>not</strong> have Blackjack, you lose the insurance bet and the round continues as normal.
            </p>
            <p>
              You can choose <strong>Yes</strong> to take Insurance, or <strong>No</strong> to skip it.
            </p>
          </>
        )}
        <div className="help-nav-buttons">
          {helpPage > 1 && (
            <button onClick={() => setHelpPage(helpPage - 1)}>Back</button>
          )}
          {helpPage < 4 && (
            <button onClick={() => setHelpPage(helpPage + 1)}>Next</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpModal;