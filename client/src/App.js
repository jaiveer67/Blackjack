import React, { useState, useEffect } from 'react'

function App() {

  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [playerValue, setPlayerValue] = useState(0);
  const [dealerValue, setDealerValue] = useState(0);
  const [result, setResult] = useState('');
  const [bust, setBust] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const startGame = async () => {
    try {
      const response = await fetch("/start")
      const data = await response.json();
      console.log(data)
      setPlayerHand(data.player_hand);
      setDealerHand(data.dealer_hand);
      setPlayerValue(data.player_value);
      setDealerValue(data.dealer_value);
  } catch (error) {
    console.error('Error starting the game:', error);
  }
};

return (
  <div>
    <h1>Blackjack</h1>
    <div>
      <h2>Player's Hand ({playerValue}):</h2>
      <div>
        {playerHand.map((card, i) => (
          <span key={i}>{card.value} of {card.suit}</span>
        ))}
      </div>
    </div>
    <div>
      <h2>Dealer's Hand ({dealerValue}):</h2>
      <div>
        {dealerHand.map((card, i) => (
          <span key={i}>{card.value} of {card.suit}</span>
        ))}
      </div>
    </div>
    <div>
    </div>
    <button onClick={startGame}>Restart</button>
  </div>
);
}

export default App