import React from 'react';

const Controls = ({ onHit, onStand, onDouble}) => {
  return (
    <div className="controls">
      <button onClick={onHit}>Hit</button>
      <button onClick={onStand}>Stand</button>
      <button onClick={onDouble}>Double Down</button>
    </div>
  );
};

export default Controls;