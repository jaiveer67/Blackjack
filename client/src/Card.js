import React from 'react';

const Card = ({ rank, suit, faceDown }) => {
  let imagePath;

  if (faceDown) {
    imagePath = require(`./assets/cards/card_back.png`);
  } else {
    const filename = getCardFilename(rank, suit);
    imagePath = require(`./assets/cards/${filename}`);
  }

  return (
    <div className="card">
      <img
        src={imagePath}
        alt={faceDown ? 'Face-down card' : `${rank} of ${suit}`}
      />
    </div>
  );
};

const getCardFilename = (rank, suit) => {
  return `${rank}_of_${suit.toLowerCase()}.png`;
};

export default Card;