import React from 'react';

const Hand = ({ cards }) => {
  return (
    <div>
      {cards && cards.length > 0 ? (
        cards.map((card, index) => (
          <p key={index}>
            {card ? `${card.rank} of ${card.suit}` : 'Invalid card'}
          </p>
        ))
      ) : (
        <p>No cards available</p>
      )}
    </div>
  );
};

export default Hand;
