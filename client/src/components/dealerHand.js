import React from 'react';
import Hand from '../hand';

const DealerHand = ({ cardsDealt, dealerValue, dealerHand, revealedDealerCardsCount }) => (
  <div className="dealer-section">
    <div className="hand-row">
      <div className="hand-label" style={{ visibility: cardsDealt ? 'visible' : 'hidden' }}>
        Dealer's Hand ({dealerValue})
      </div>
      <Hand
        cards={
          dealerHand.slice(0, revealedDealerCardsCount).concat(
            dealerHand.length > revealedDealerCardsCount ? [{ faceDown: true }] : []
          )
        }
      />
    </div>
  </div>
);

export default DealerHand;