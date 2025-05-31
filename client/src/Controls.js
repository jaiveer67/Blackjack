import React from 'react';

const Controls = ({ onHit, onStand, onDouble, onPlayAgain }) => {
  return (
    <div className="controls">
      <button onClick={onHit}>Hit</button>
      <button onClick={onStand}>Stand</button>
      <button onClick={onDouble}>Double Down</button>
      <button onClick={onPlayAgain}>Play Again</button>
    </div>
  );
};

export default Controls;