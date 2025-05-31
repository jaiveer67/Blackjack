import React from 'react';
import Card from './Card';

const Hand = ({ cards }) => {
  if (cards == null) {
    console.warn("Invalid cards:", cards);  // ← will show you the culprit
    return <div className="hand">No cards to display.</div>;
  }
   return (
    <div className="hand">
      {cards.map((card, index) => {
        if (!card) return null;

        return (
          <Card
            key={index}
            rank={card.rank}
            suit={card.suit}
            faceDown={card.faceDown}
          />
        );
      })}
    </div>
  );
};

export default Hand;