import React from 'react';

const Card = ({ rank, suit }) => {
  return (
    <div className="card">
      {rank} of {suit}
    </div>
  );
};

export default Card; 
