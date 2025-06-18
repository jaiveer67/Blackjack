import React from 'react';

const OptionsModal = ({
  showOptions,
  setShowOptions,
  selectedDecks,
  setSelectedDecks,
  dealerHitsSoft17,
  setDealerHitsSoft17,
  handleOptions, 
}) => {
  if (!showOptions) return null;

  return (
    <div className="options-modal-overlay">
      <div className="options-modal-content">
        <button
          className="close-options-x"
          onClick={() => setShowOptions(false)}
        >
          ❌
        </button>
        <h2>Game Options</h2>
        <div>
          <label>
            Number of Decks:&nbsp;
            <select
              value={selectedDecks}
              onChange={e => setSelectedDecks(Number(e.target.value))}
            >
              {[1, 2, 4, 6, 8].map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              checked={dealerHitsSoft17}
              onChange={e => setDealerHitsSoft17(e.target.checked)}
            />
            Dealer hits on soft 17
          </label>
        </div>
        <button onClick={handleOptions}>Save</button>
      </div>
    </div>
  );
};

export default OptionsModal;