import React, { useState, useEffect } from 'react'
import Hand from './Hand';
import Controls from './Controls';
import './App.css';

function App() {
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [playerValue, setPlayerValue] = useState(0);
  const [dealerValue, setDealerValue] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

const startGame = () => {
    console.log("Fetching")
    fetch("/start")
      .then(response => response.json())
      .then(data => {
        setPlayerHand(data.playerHand);
        setDealerHand(data.dealerHand);
        setPlayerValue(data.playerValue);
        setDealerValue(data.dealerValue);
        setGameStarted(true);
        if (data.playerValue === 21) {
          handleStand()
        }
        console.log(data)
        console.log(playerHand)
      });
    }

const handleHit = () => {
  fetch("/hit")
    .then(response => response.json())
    .then(data => {
      setPlayerHand(data.playerHand);
      setPlayerValue(data.playerValue);
      if (data.playerValue === 21) {
        handleStand()
      } 
      if (data.gameOver) {
        setGameOver(true);
      }
    });
};
  
const handleStand = () => {
  fetch("/stand")
    .then(response => response.json())
    .then(data => {
      setDealerHand(data.dealerHand);
      setDealerValue(data.dealerValue);
      setGameOver(true);
    });
};

const handlePlayAgain = () => {
  setGameOver(false);
  fetch("/start")
    .then(response => response.json())
    .then(data => {
      setPlayerHand(data.playerHand);
      setDealerHand(data.dealerHand);
      setPlayerValue(data.playerValue);
      setDealerValue(data.dealerValue);
    });
};

  return (
  <div>
    <h1>Blackjack</h1>

    {!gameStarted && (
      <button onClick={startGame}>Start Game</button>
    )}

    {gameStarted && (
      <>
        <div>
          <h2>Player's Hand ({playerValue})</h2>
          <Hand cards={playerHand} />
        </div>

        <div>
          <h2>Dealer's Hand ({dealerValue}){gameOver}</h2>
          <Hand
            cards={
              gameOver
                ? dealerHand
                : dealerHand.length > 0
                  ? [dealerHand[0], { faceDown: true }]
                  : []
            }
          />
        </div>
      </>
    )}

    <div>
      {!gameOver && gameStarted && (
        <Controls
          onHit={handleHit}
          onStand={handleStand}
          onPlayAgain={handlePlayAgain}
        />
      )}
      {gameOver && (
        <button onClick={handlePlayAgain}>Play Again</button>
      )}
    </div>
  </div>
);
}
export default App;