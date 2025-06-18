import React from 'react';

const Banner = ({ show, message }) => {
  if (!show) return null;

  return (
    <div className="banner new-max-banner">
        <span>{message}</span>
      </div>
  );
};

export default Banner;