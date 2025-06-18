import React from 'react';

const TopButtons = ({ isMuted, toggleMute, setShowHelp }) => (
  <div className="top-buttons-container">
    <button onClick={toggleMute}>
      {isMuted ? 'Unmute' : 'Mute'}
    </button>
    <button onClick={() => setShowHelp(true)}>
      Help
    </button>
  </div>
);

export default TopButtons;