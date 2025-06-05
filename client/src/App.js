import { useState, useEffect, useRef } from 'react'
import Hand from './Hand';
import './App.css';
import cardSound from './assets/sounds/card_deal.mp3'
import backgroundMusic from './assets/sounds/casino_music.mp3'
import blackjackSound from './assets/sounds/blackjack.mp3'
import logo from './assets/images/home_screen.png'

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
  const [playerMoney, setPlayerMoney] = useState(2000);
  const [showSummary, setShowSummary] = useState(false);
  const [cashOutSummary, setCashOutSummary] = useState(null);
  const [isBankrupt, setIsBankrupt] = useState(false);
  const [cardsDealt, setCardsDealt] = useState(false);
  const [lastBet, setLastBet] = useState(0);
  const [isSplit, setIsSplit] = useState(false);

  const chipValues = [1, 10, 25, 50, 100, 500];
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

      audioRef.current.play().catch(err => {
        console.warn("Autoplay blocked:", err);
      });

    return () => {
      audioRef.current?.pause();
    };
  });

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

const toggleMute = () => setIsMuted(prev => !prev);

const handleChipClick = (amount) => {
  if (playerMoney >= currentBet + amount) {
    setCurrentBet(prev => {
      const newBet = prev + amount;
      return newBet;
    });
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

  setLastBet(currentBet);

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
  setPlayerMoney(data.playerMoney);
  setGameStarted(true);
  const playerCards = data.playerHand;
  const dealerCards = data.dealerHand;
      
  setPlayerHand1([]);
  setDealerHand([]);
  
  // Deal cards one by one
  setTimeout(() => {
  setPlayerHand1([playerCards[0]]);
  playSound(cardSound);
}, 600);

setTimeout(() => {
  setDealerHand([dealerCards[0]]);
  playSound(cardSound);
}, 1200);

setTimeout(() => {
  setPlayerHand1([playerCards[0], playerCards[1]]);
  playSound(cardSound);
}, 1800);

setTimeout(() => {
  setDealerHand([dealerCards[0], dealerCards[1]]);
  playSound(cardSound);
}, 2400); 

setTimeout(() => {
  setCardsDealt(true);
}, 3000);

  setTimeout(() => {
    setPlayerValue1(data.playerValue);
    setDealerValue(data.dealerValue);
    setResultMessages(data.result || []);
    setGameOver(data.gameOver);
    setActiveHand(1);
    setBettingPhase(false);
    if (data.gameOver) handleGameOver();
    }, 3100);
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
          if (data.playerMoney <= 0) {
            setIsBankrupt(true);
            setIsMuted(true);
            setCashOutSummary(data);
            setShowSummary(true);
            }
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
        if (data.playerMoney <= 0) {
            setIsBankrupt(true);
            setIsMuted(true);
            handleCashOut();
            }
      });
  }
};

const handleDouble = () => {
  setCurrentBet(2*currentBet);
  fetch("/double", { method: "POST" })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }
      setPlayerHand1(data.playerHand);
      setPlayerValue1(data.playerValue);
      setPlayerMoney(data.playerMoney);
      setGameOver(data.gameOver);
      // End turn after double (whether bust or not)
      handleStand();
    });
};

const handleSplit = () => {
  setIsSplit(true);
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
      setCardsDealt(false);
      setIsSplit(false);
      setDealerValue(0);
      setPlayerValue1(0);
      setResultMessages([]);
      setPlayerHand2([]);
      setPlayerValue2(0);
      setCurrentBet(data.currentBet);
      setBettingPhase(true);  // Go back to betting screen
      setGameStarted(false); 
      handleClearBet();
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
        setPlayerMoney(2000);
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

const handleCashOut = () => {
  fetch("/cashout")
    .then(res => res.json())
    .then(data => {
      setCashOutSummary(data);
      setShowSummary(true);
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
  const audio = new Audio(sound);
  audio.play();
};

return (
  <div className="App">
  <h1>Blackjack</h1>

  {!gameStarted && !bettingPhase && (
    <div className="start-button-container">
      <img src={logo} alt="Blackjack Logo" className="start-logo" />
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
      <button
    onClick={() => {
      if (lastBet > 0 && lastBet <= playerMoney) {
        setCurrentBet(lastBet);
      }
    }}
    disabled={lastBet <= 0 || lastBet > playerMoney}
    className="deal-button"
  >
    Rebet
  </button>
      <div className="cashout-button-container">
    <button onClick={handleCashOut}>Cash Out</button>
  </div>
      <div className ="mute-button-container">
    <button onClick={toggleMute}>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
</div>
    </div>
  )}
    {gameStarted && (
      <>
      <div className ="mute-button-container">
    <button onClick={toggleMute}>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
</div>
        <div className="hands-section">
          {playerHand2.length > 0 ? (
            <div className="split-hands">
             <div className="hand-wrapper">
  <div className="result-message-wrapper">
    <div className="result-message" style={{ visibility: gameOver ? 'visible' : 'hidden' }}>
  {resultMessages[0] || ""}
</div>
  </div>
  <div className="hand-row">
    <div className="hand-label">
  {cardsDealt ? `Hand 1 (${playerValue1})` : <span style={{ visibility: "hidden" }}>Hand 1 (00)</span>}
</div>


    <Hand cards={playerHand1} />
  </div>
  <div className="current-bet-display">
    Bet: ${currentBet}
  </div>
</div>

              <div className="hand-wrapper">
  <div className="result-message-wrapper">
    {gameOver && resultMessages.length > 0 && (
      <div className="result-message">{resultMessages[1]}</div>
    )}
  </div>
  <div className="hand-row">
    <div className="hand-label">
  {cardsDealt ? `Hand 2 (${playerValue2})` : <span style={{ visibility: "hidden" }}>Hand 2 (00)</span>}
</div>

    <Hand cards={playerHand2} />
  </div>
  <div className="current-bet-display">
    Bet: ${currentBet}
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
  <div className="hand-label">
  {cardsDealt ? `Your Hand (${playerValue1})` : <span style={{ visibility: "hidden" }}>Your Hand (00)</span>}
</div>
    <Hand cards={playerHand1} />
  </div>
</div>
          )}
        </div>
        {gameStarted && cardsDealt && !isSplit && (
  <div className="current-bet-display">
    Bet: ${currentBet}
  </div>
)}
        <div className="dealer-section">
          <div className="hand-row">
  <div className="hand-label" style={{ visibility: cardsDealt ? 'visible' : 'hidden' }}>
    Dealer's Hand ({dealerValue})
  </div>
            <Hand
              cards={
                gameOver
                  ? dealerHand
                  : dealerHand.length === 1
                    ? [dealerHand[0]]
                    : dealerHand.length === 2
                      ? [dealerHand[0], { faceDown: true }]
                      : []
              }
            />
          </div>
        </div>
      </>
    )}

    <div
  className="controls"
  style={{ visibility: !gameOver && gameStarted && cardsDealt ? 'visible' : 'hidden' }}
>
  <button onClick={handleHit}>Hit</button>
  <button onClick={handleStand}>Stand</button>
  <button
  disabled={playerMoney < currentBet}
    onClick={handleDouble}
  >
    Double
  </button>
  <button
    onClick={handleSplit}
    disabled={
      playerHand1.length !== 2 ||
      getCardValue(playerHand1[0]) !== getCardValue(playerHand1[1]) ||
      playerValue2 !== 0 ||
      playerMoney < currentBet
    }
  >
    Split
  </button>
</div>

    {gameOver && (
      <div className="play-again-button-container">
        <button onClick={handlePlayAgain}>Play Again</button>
      </div>
    )}

    {showSummary && cashOutSummary && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Game Summary</h2>
      <p><strong>Final Money:</strong> ${cashOutSummary.finalMoney}</p>
      <p><strong>Max Money Reached:</strong> ${cashOutSummary.maxMoney}</p>
      <p><strong>Hands Won:</strong> {cashOutSummary.handsWon}</p>
      <p><strong>Net Earnings:</strong> ${cashOutSummary.profit}</p>
      <button onClick={() => window.location.reload()}>New Game</button>
    </div>
  </div>
)}

{showSummary && cashOutSummary && isBankrupt && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Bankrupt!</h2>
      <p>You lose! Better luck next time.</p>
      <p><strong>Final Money:</strong> ${cashOutSummary.finalMoney}</p>
      <p><strong>Max Money Reached:</strong> ${cashOutSummary.maxMoney}</p>
      <p><strong>Hands Won:</strong> {cashOutSummary.handsWon}</p>
      <p><strong>Net Earnings:</strong> ${cashOutSummary.profit}</p>
      <button onClick={() => window.location.reload()}>New Game</button>
    </div>
  </div>
)}

{gameStarted && (
  <div className="money-display">
    Money: ${playerMoney}
  </div>
)}
  </div>
);
}
export default App;