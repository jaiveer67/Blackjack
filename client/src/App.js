import { useState, useEffect, useRef } from 'react'
import Hand from './Hand';
import './App.css';
import cardSound from './assets/sounds/card_deal.mp3'
import backgroundMusic from './assets/sounds/casino_music.mp3'
import blackjackSound from './assets/sounds/blackjack.mp3'

function App() {
  const [playerHand1, setPlayerHand1] = useState([]);
  const [playerHand2, setPlayerHand2] = useState([]);
  const [activeHand, setActiveHand] = useState(1);
  const [dealerHand, setDealerHand] = useState([]);
  const [playerValue1, setPlayerValue1] = useState(0);
  const [playerValue2, setPlayerValue2] = useState(0);
  const [dealerValue, setDealerValue] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [resultMessages, setResultMessages] = useState([]);
  const [bettingPhase, setBettingPhase] = useState(false);
  const [currentBet, setCurrentBet] = useState(0);
  const [playerMoney, setPlayerMoney] = useState(3000);
  const chipValues = [1, 10, 25, 50, 100];

  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);

useEffect(() => {
    if (!audioRef.current) {
      const music = new Audio(backgroundMusic);
      music.loop = true;
      music.volume = 0.2;
      music.muted = isMuted;
      audioRef.current = music;
    }

    if (gameStarted) {
      audioRef.current.play().catch(err => {
        console.warn("Autoplay blocked:", err);
      });
    }

    return () => {
      audioRef.current?.pause();
    };
  }, [gameStarted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = () => setIsMuted(prev => !prev);

const handleChipClick = (amount) => {
  if (playerMoney >= currentBet + amount) {
    setCurrentBet(prev => prev + amount);
  }
};

const handleClearBet = () => {
  setCurrentBet(0);
};

const handleDeal = () => {
  if (currentBet <= 0 || currentBet > playerMoney) {
    alert("Place a valid bet");
    return;
  }

  fetch(`/bet/${currentBet}`, { method: "POST" })
    .then(res => {
      if (!res.ok) throw new Error("Invalid bet");
      return res.json();
    })
    .then(() => {
      return fetch("/start");
    })
    .then(res => res.json())
    .then(data => {
      setPlayerHand1(data.playerHand);
      setDealerHand(data.dealerHand);
      setPlayerValue1(data.playerValue);
      setDealerValue(data.dealerValue);
      setResultMessages(data.result || []);
      setGameOver(data.gameOver);
      setPlayerMoney(data.playerMoney);
      setActiveHand(1);
      setBettingPhase(false);   // Exit betting
      setGameStarted(true);     // Show game UI
      setCurrentBet(data.currentBet)
      if (data.gameOver) handleGameOver();
    })
};

const handleHit = () => {
    playSound(cardSound);
    const endpoint = activeHand === 1 ? "/hit/1" : "/hit/2";
    fetch(endpoint)
      .then(response => response.json())
      .then(data => {
        if (activeHand === 1) {
          setPlayerHand1(data.playerHand);
          setPlayerValue1(data.playerValue);
        } else {
          setPlayerHand2(data.playerHand);
          setPlayerValue2(data.playerValue);
        }

        const moveToNextHand = activeHand === 1 && playerHand2.length > 0;
        const isDone = data.playerValue === 21 || data.gameOver;

        if (isDone) {
          if (moveToNextHand) {
            setActiveHand(2);
          } else {
            handleStand();
          }
        }
      });
  };

  const handleStand = () => {
  if (activeHand === 1 && playerHand2.length > 0) {
    setActiveHand(2);
    const isBlackjack = playerHand2.length === 2 && playerValue2 === 21;
    if (isBlackjack) {
      fetch("/stand")
        .then(response => response.json())
        .then(data => {
          setDealerHand(data.dealerHand);
          setDealerValue(data.dealerValue);
          setGameOver(true);
          setResultMessages(data.results || []);
          setPlayerMoney(data.playerMoney);
        });
    }
  } else {
    fetch("/stand")
      .then(response => response.json())
      .then(data => {
        setDealerHand(data.dealerHand);
        setDealerValue(data.dealerValue);
        setGameOver(true);
        setResultMessages(data.results || []);
        setPlayerMoney(data.playerMoney);
      });
  }
};

const handleSplit = () => {
  fetch("/split")
    .then(response => response.json())
    .then(data => {
      setPlayerHand1(data.playerHand1);
      setPlayerHand2(data.playerHand2);
      setPlayerValue1(data.playerValue1);
      setPlayerValue2(data.playerValue2);
      setActiveHand(1);
    });
};

const handlePlayAgain = () => {
  setGameOver(false);
  fetch("/start")
    .then(response => response.json())
    .then(data => {
      setGameOver(false);
      setResultMessages([]);
      setPlayerHand2([]);
      setPlayerValue2(0);
      setCurrentBet(0);
      setBettingPhase(true);  // Go back to betting screen
      setGameStarted(false); 
    });
};

const handleGameOver = () => {
  setGameOver(true);
  fetch("/gameOver")
    .then(response => response.json())
    .then(data => {
      setDealerValue(data.dealerValue);
      playSound(blackjackSound);
      setResultMessages(data.results || [])
    });
};

const handleReset = () => {
  setGameOver(true);
  fetch("/reset", { method: "POST" })
      .then(res => res.json())
      .then(() => {
        setPlayerMoney(3000);
        setCurrentBet(0);
        setPlayerHand1([]);
        setPlayerHand2([]);
        setDealerHand([]);
        setGameStarted(false);
        setGameOver(false);
        setResultMessages([]);
        setBettingPhase(true);  // move to betting screen
      });
};

const getCardValue = (card) => {
  const valueMap = {
    '2': 2, '3': 3, '4': 4, '5': 5,
    '6': 6, '7': 7, '8': 8, '9': 9,
    '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11
  };
  return valueMap[card?.rank] ?? 0;
};

const playSound = (sound) => {
  new Audio(sound).play();
};

return (
  <div className="App">
  <h1>Blackjack</h1>

  {!gameStarted && !bettingPhase && (
    <div className="start-button-container">
      <button
  onClick={handleReset}
>
  Start Game
</button>
    </div>
  )}

  {bettingPhase && !gameStarted && (
    <div className="betting-section">
      <h2>Your Money: ${playerMoney - currentBet}</h2>
      <h2>Current Bet: ${currentBet}</h2>
      <div className="chip-container">
        {chipValues.map((value) => (
          <button key={value} onClick={() => handleChipClick(value)}>
            ${value}
          </button>
        ))}
        <button onClick={handleClearBet}>Clear</button>
      </div>
      <button 
        onClick={handleDeal} 
        disabled={currentBet === 0}
        className="deal-button"
      >
        Deal
      </button>
    </div>
  )}

    <div className ="mute-button-container">
    <button onClick={toggleMute}>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
</div>
    {gameStarted && (
      <>
        <div className="hands-section">
          {playerHand2.length > 0 ? (
            <div className="split-hands">
             <div className="hand-wrapper">
  <div className="result-message-wrapper">
    {gameOver && resultMessages.length > 0 && (
      <div className="result-message">{resultMessages[0]}</div>
    )}
  </div>
  <div className="hand-row">
    <div className="hand-label">Hand 1 ({playerValue1}) {activeHand === 1 && "(Active)"}</div>
    <Hand cards={playerHand1} />
  </div>
</div>

              <div className="hand-wrapper">
  <div className="result-message-wrapper">
    {gameOver && resultMessages.length > 0 && (
      <div className="result-message">{resultMessages[1]}</div>
    )}
  </div>
  <div className="hand-row">
    <div className="hand-label">Hand 2 ({playerValue2}) {activeHand === 2 && "(Active)"}</div>
    <Hand cards={playerHand2} />
  </div>
</div>
            </div>
          ) : (
            <div className="hand-wrapper">
  <div className="result-message-wrapper">
    {gameOver && resultMessages.length > 0 && (
      <div className="result-message">{resultMessages}</div>
    )}
  </div>
  <div className="hand-row">
    <div className="hand-label">Your Hand ({playerValue1})</div>
    <Hand cards={playerHand1} />
  </div>
</div>
          )}
        </div>

        <div className="dealer-section">
          <div className="hand-row">
            <div className="hand-label">Dealer's Hand ({dealerValue})</div>
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
        </div>
      </>
    )}

    {!gameOver && gameStarted && (
  <div className="controls">
    <button onClick={handleHit}>Hit</button>
    <button onClick={handleStand}>Stand</button>
    {playerHand1.length === 2 &&
      getCardValue(playerHand1[0]) === getCardValue(playerHand1[1]) &&
      playerValue2 === 0 && (
        <button onClick={handleSplit}>Split</button>
      )}
  </div>
)}

    {gameOver && (
      <div className="play-again-button-container">
        <button onClick={handlePlayAgain}>Play Again</button>
      </div>
    )}
  </div>
);
}
export default App;