import React from 'react';

const InsuranceModal = ({ showInsurance, insuranceTaken, handleInsurance }) => {
  if (!showInsurance || insuranceTaken) return null;

  return (
    <div className="insurance-modal-overlay">
      <div className="insurance-modal-content">
        <p className="insurance-text">The dealer is showing an Ace. Take insurance?</p>
        <div className="insurance-buttons">
          <button onClick={() => handleInsurance(true)}>Yes</button>
          <button onClick={() => handleInsurance(false)}>No</button>
        </div>
      </div>
    </div>
  );
};

export default InsuranceModal;