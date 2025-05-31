import React from 'react';

const Card = ({ rank, suit, faceDown }) => {
  if (faceDown) {
    return <div className="card hidden-card">🂠</div>;
  }
  return (
    <div className="card">
      {rank} of {suit}
    </div>
  );
};

export default Card;