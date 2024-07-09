import React, { useState, useEffect } from 'react';
import Hand from './components/Hand';
import Controls from './components/Controls';

const App = () => {
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    fetch('/api/start')
      .then(response => response.json())
      .then(data => {
        setPlayerHand(data.playerHand || []);
        setDealerHand(data.dealerHand || []);
      })
      .catch(error => console.error('Error fetching initial data:', error));
  }, []);

  const handleHit = () => {
    fetch('/api/hit')
      .then(response => response.json())
      .then(data => {
        setPlayerHand(data.playerHand || []);
        if (data.gameOver) {
          setGameOver(true);
        }
      })
      .catch(error => console.error('Error handling hit:', error));
  };

  const handleStand = () => {
    fetch('/api/stand')
      .then(response => response.json())
      .then(data => {
        setDealerHand(data.dealerHand || []);
        setGameOver(true);
      })
      .catch(error => console.error('Error handling stand:', error));
  };

  const handlePlayAgain = () => {
    setGameOver(false);
    fetch('/api/start')
      .then(response => response.json())
      .then(data => {
        setPlayerHand(data.playerHand || []);
        setDealerHand(data.dealerHand || []);
      })
      .catch(error => console.error('Error handling play again:', error));
  };

  return (
    <div className="App">
      <h1>Blackjack</h1>
      <h2>Player's Hand</h2>
      <Hand cards={playerHand} />
      <h2>Dealer's Hand</h2>
      <Hand cards={gameOver ? dealerHand : [dealerHand[0], { rank: '?', suit: '?' }]} />
      {!gameOver && (
        <Controls
          onHit={handleHit}
          onStand={handleStand}
          onPlayAgain={handlePlayAgain}
        />
      )}
      {gameOver && <button onClick={handlePlayAgain}>Play Again</button>}
    </div>
  );
};

export default App;
