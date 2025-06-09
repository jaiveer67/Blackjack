import { useState, useEffect, useRef} from 'react'
import Hand from './Hand';
import './App.css';
import cardSound from './assets/sounds/card_deal.mp3'
import backgroundMusic from './assets/sounds/casino_music.mp3'
import blackjackSound from './assets/sounds/blackjack.mp3'
import chipSound from './assets/sounds/poker_chips.mp3'
import logo from './assets/images/home_screen.png'

function App() {
  const [playerHand1, setPlayerHand1] = useState([]);
  const [playerHand2, setPlayerHand2] = useState([]);
  const [activeHand, setActiveHand] = useState(1);
  const [dealerHand, setDealerHand] = useState([]);
  const [playerValue1, setPlayerValue1] = useState(0);
  const [playerDisplayValue1, setPlayerDisplayValue1] = useState("");
  const [playerValue2, setPlayerValue2] = useState(0);
  const [playerDisplayValue2, setPlayerDisplayValue2] = useState("");
  const [dealerValue, setDealerValue] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [canDouble, setCanDouble] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [resultMessages, setResultMessages] = useState([]);
  const [bettingPhase, setBettingPhase] = useState(false);
  const [currentBet, setCurrentBet] = useState(0);
  const [baseBet, setBaseBet] = useState(0);
  const [playerMoney, setPlayerMoney] = useState(2000);
  const [showSummary, setShowSummary] = useState(false);
  const [cashOutSummary, setCashOutSummary] = useState(null);
  const [isBankrupt, setIsBankrupt] = useState(false);
  const [cardsDealt, setCardsDealt] = useState(false);
  const [lastBet, setLastBet] = useState(0);
  const [isSplit, setIsSplit] = useState(false);
  const [turnOver, setTurnOver] = useState(false);
  const [revealedDealerCardsCount, setRevealedDealerCardsCount] = useState(1);
  const [roundNumber, setRoundNumber] = useState(1);

  const chipValues = [1, 5, 25, 100, 500];
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

useEffect(() => {
  if (roundNumber > 1 && currentBet > 0) {
    setLastBet(currentBet);
  }
}, [roundNumber, currentBet]);

const toggleMute = () => setIsMuted(prev => !prev);

const handleChipClick = (amount) => {
  playSound(chipSound);
  if (playerMoney >= currentBet + amount) {
    setCurrentBet(prev => {
      const newBet = prev + amount;
      if (roundNumber <= 1) {
        setBaseBet(newBet);
      }
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

  if (roundNumber === 1) {
    setRoundNumber(2);
  } else {
    setLastBet(baseBet);
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
}, 300);

setTimeout(() => {
  setDealerHand([dealerCards[0]]);
  playSound(cardSound);
}, 600);

setTimeout(() => {
  setPlayerHand1([playerCards[0], playerCards[1]]);
  playSound(cardSound);
}, 900);

setTimeout(() => {
  setDealerHand([dealerCards[0], dealerCards[1]]);
  playSound(cardSound);
}, 1200); 

setTimeout(() => {
  setCardsDealt(true);
}, 1500);

  setTimeout(() => {
    setPlayerMoney(data.playerMoney);
    setPlayerValue1(data.playerValue);
    setPlayerDisplayValue1(data.playerDisplayValue);
    setDealerValue(data.dealerValue);
    setResultMessages(data.result || []);
    setGameOver(data.gameOver);
    setActiveHand(1);
    setBettingPhase(false);
    console.log(data.gameOver);
    if (data.gameOver) {
      setTurnOver(true);
      playSound(blackjackSound);
      handleGameOver();
    }
    }, 1500);
})
};

const handleHit = () => {
    playSound(cardSound);
    if (!isSplit || activeHand === 2) {
      setCanDouble(false);
    }
    const endpoint = activeHand === 1 ? "/hit/1" : "/hit/2";
    fetch(endpoint)
      .then(response => response.json())
      .then(data => {
        if (data.gameOver && (!isSplit || activeHand === 2)) {
          setTurnOver(true);
        }
        if (activeHand === 1) {
          setPlayerHand1(data.playerHand);
          setPlayerValue1(data.playerValue);
          setPlayerDisplayValue1(data.playerDisplayValue);
        } else {
          setPlayerHand2(data.playerHand);
          setPlayerValue2(data.playerValue);
          setPlayerDisplayValue2(data.playerDisplayValue);
        }

        const moveToNextHand = activeHand === 1 && playerHand2.length > 0;
        const isDone = data.playerValue === 21 || data.gameOver;

        if (isDone) {
          if (moveToNextHand) {
            setActiveHand(2);
            if (playerValue2 === 21) {
              setTurnOver(true);
              setTimeout(() => {
                handleStand();
              }, 800);
            }
          } else {
            setTimeout(() => {
              setTurnOver(true);
              handleStand();
            }, 800);
          }
        }
      });
  };

const handleStand = () => {
  if (!isSplit || activeHand === 2) {
  setPlayerDisplayValue2(`${(playerValue2)}`)
  setTurnOver(true);
  }
  setPlayerDisplayValue1(`${(playerValue1)}`)
  const graduallyRevealDealerCards = (data) => {
  const totalCards = data.dealerHand.length;
  let i = 2;

  setRevealedDealerCardsCount(2);
  playSound(cardSound);
  setDealerValue(calculateHandValue(data.dealerHand.slice(0,2)));

  const interval = setInterval(() => {
    i++;
    const visibleCards = data.dealerHand.slice(0, i);
    if (i <= totalCards) {
      playSound(cardSound);
    }
    setRevealedDealerCardsCount(i);
    setDealerValue(calculateHandValue(visibleCards));

    if (i >= totalCards) {
      clearInterval(interval);
      setTimeout(() => {
        setResultMessages(data.results || []);
        setGameOver(true);
        setTurnOver(true);
        setPlayerMoney(data.playerMoney);
      }, 100);
      setTimeout(() => {
        if (data.playerMoney <= 0) {
          setIsBankrupt(true);
          setIsMuted(true);
          handleCashOut();
        }
}, 1500);
    }
  }, 600);
  setTimeout(() => {
    handlePlayAgain();
  }, 2500);
};

  if (activeHand === 1 && playerHand2.length > 0) {
    setActiveHand(2);
    const isBlackjack = playerHand2.length === 2 && playerValue2 === 21;
    if (isBlackjack) {
      setTurnOver(true);
      fetch("/stand")
        .then(response => response.json())
        .then(data => {
          setDealerHand(data.dealerHand);
          graduallyRevealDealerCards(data);
        });
    }
  } else {
    fetch("/stand")
      .then(response => response.json())
      .then(data => {
        setDealerHand(data.dealerHand);
        graduallyRevealDealerCards(data)
      });
  }
};

const handleDouble = () => {
  setTurnOver(true);
  setCurrentBet(2*currentBet);
  fetch("/double", { method: "POST" })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        alert(data.error);
        return;
      }
      playSound(cardSound);
      if (activeHand === 1) { 
        setPlayerHand1(data.playerHand);
        setPlayerValue1(data.playerValue);
        setPlayerDisplayValue1(data.playerDisplayValue);
      } else {
        setPlayerHand2(data.playerHand);
        setPlayerValue2(data.playerValue);
        setPlayerDisplayValue2(data.playerDisplayValue);
      }
      setPlayerMoney(data.playerMoney);
      // End turn after double (whether bust or not)
      setTimeout(() => {
              handleStand();
            }, 800);
    });
};

const handleSplit = () => {
  setTurnOver(true);
  setIsSplit(true);
  fetch("/split")
    .then(response => response.json())
    .then(data => {
      const hand1 = [data.playerHand1[0]];
      const hand2 = [data.playerHand2[0]];
      const extra1 = data.playerHand1[1];
      const extra2 = data.playerHand2[1];

      setPlayerHand1(hand1);
      setPlayerHand2(hand2);
      setPlayerValue1(calculateHandValue(hand1));
      setPlayerDisplayValue1(calculateDisplayValue(hand1));
      setPlayerValue2(calculateHandValue(hand2));
      setPlayerDisplayValue2(calculateDisplayValue(hand2));

      setTimeout(() => {
        const updatedHand1 = [...hand1, extra1];
        setPlayerHand1(updatedHand1);
        setPlayerValue1(calculateHandValue(updatedHand1));
        setPlayerDisplayValue1(calculateDisplayValue(updatedHand1));
        playSound(cardSound);
      }, 600);

      setTimeout(() => {
        const updatedHand2 = [...hand2, extra2];
        setPlayerHand2(updatedHand2);
        setPlayerValue2(calculateHandValue(updatedHand2));
        setPlayerDisplayValue2(calculateDisplayValue(updatedHand2));
        playSound(cardSound);

        setTurnOver(false);
        if (calculateHandValue([...hand1, extra1]) !== 21) {
          setActiveHand(1);
        } else {
          setActiveHand(2);
        }
      }, 1200);
    });
};

const handlePlayAgain = () => {
  fetch("/start")
    .then(response => response.json())
    .then(data => {
      setGameOver(false);
      setCardsDealt(false);
      setCanDouble(true);
      setIsSplit(false);
      setTurnOver(false);
      setDealerValue(0);
      setRevealedDealerCardsCount(1);
      setPlayerValue1(0);
      setPlayerDisplayValue1("");
      setResultMessages([]);
      setPlayerHand2([]);
      setPlayerValue2(0);
      setPlayerDisplayValue2("");
      setBettingPhase(true);
      setCurrentBet(0);
      setBaseBet(0);
      setGameStarted(false); 
      handleClearBet();
    });
};

const handleGameOver = () => {
  fetch("/gameOver")
    .then(response => response.json())
    .then(data => {
      setRevealedDealerCardsCount(2);
      setPlayerMoney(data.playerMoney);
      setDealerValue(data.dealerValue);
      setResultMessages(data.results || []);
      setTimeout(() => {
        handlePlayAgain();
    }, 1600);
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
        setBettingPhase(true);
        setRoundNumber(1);
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

const calculateHandValue = (hand) => {
  let value = 0;
  let aces = 0;

  for (let card of hand) {
    const rank = card.rank;
    if (rank === 'A') {
      value += 11;
      aces += 1;
    } else if (['K', 'Q', 'J'].includes(rank)) {
      value += 10;
    } else {
      value += parseInt(rank);
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }

  return value;
};

function calculateDisplayValue(hand) {
  let total = 0;
  let aceCount = 0;

  for (let card of hand) {
    if (card.rank === 'A') {
      aceCount += 1;
    } else {
      total += card.value;
    }
  }

  const min = total + aceCount * 1;
  const max = (aceCount >= 1 && min + 10 <= 21) ? min + 10 : min;

  if (max === 21 || min === 21) {
    return "21";
  }

  return min !== max ? `${min} / ${max}` : `${min}`;
}

const playSound = (sound) => {
  if (isMuted) return;
  const audio = new Audio(sound);
  audio.play();
};

return (
  <div className="App">
  <h1>BlackJack</h1>

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
      <h2>Balance: ${playerMoney - currentBet}</h2>
      <h2>Current Bet: ${currentBet}</h2>
      <div className="chip-container">
    {chipValues
  .filter((_, index) => playerMoney - currentBet >= chipValues[index])
  .map((value, index) => (
    <div
      key={value}
      className={`chip chip-${index + 1}`}
      onClick={() => handleChipClick(value)}
      title={`$${value}`}
    />
))}
      <button onClick={handleClearBet}
      disabled={currentBet === 0}
      >Clear
      </button>
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
        setBaseBet(lastBet); 
      }
    }}
    disabled={lastBet <= 0 || lastBet > playerMoney || roundNumber <= 1}
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
  {cardsDealt ? (
    <>
      Hand 1 ({playerDisplayValue1}) {activeHand === 1 && <span>(Active)</span>}
    </>
  ) : (
    <span style={{ visibility: "hidden" }}>Hand 1 (00)</span>
  )}
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
  {cardsDealt ? (
    <>
      Hand 2 ({playerDisplayValue2}) {!gameOver && activeHand === 2 && <span>(Active)</span>}
    </>
  ) : (
    <span style={{ visibility: "hidden" }}>Hand 2 (00)</span>
  )}
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
  {cardsDealt ? `Your Hand (${playerDisplayValue1})` : <span style={{ visibility: "hidden" }}>Your Hand (00)</span>}
</div>
    <Hand cards={playerHand1} />
  </div>
</div>
          )}
        </div>
  <div className="current-bet-display" style={{ visibility: (cardsDealt && !isSplit)  ? 'visible' : 'hidden' }}>
    Bet: ${currentBet}
  </div>
        <div className="dealer-section">
          <div className="hand-row">
  <div className="hand-label" style={{ visibility: cardsDealt ? 'visible' : 'hidden' }}>
    Dealer's Hand ({dealerValue})
  </div>
            <Hand cards={dealerHand.slice(0, revealedDealerCardsCount).concat(
  dealerHand.length > revealedDealerCardsCount
    ? [{ faceDown: true }]
    : []
)} />
          </div>
        </div>
      </>
    )}

    <div
  className="controls"
  style={{ visibility: !gameOver && gameStarted && cardsDealt && !turnOver ? 'visible' : 'hidden' }}
>
  <button onClick={handleHit}>Hit</button>
  <button onClick={handleStand}>Stand</button>
  <button
  disabled={(playerMoney < currentBet) || !canDouble}
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

    {/* {gameOver && turnOver && (
      <div className="play-again-button-container">
        <button onClick={handlePlayAgain}>Play Again</button>
      </div>
    )} */}

    {showSummary && cashOutSummary && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h2>Game Summary</h2>
      <p><strong>Final Balance:</strong> ${cashOutSummary.finalMoney}</p>
      <p><strong>Max Balance Reached:</strong> ${cashOutSummary.maxMoney}</p>
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
      <p><strong>Final Balance:</strong> ${cashOutSummary.finalMoney}</p>
      <p><strong>Max Balance Reached:</strong> ${cashOutSummary.maxMoney}</p>
      <p><strong>Hands Won:</strong> {cashOutSummary.handsWon}</p>
      <p><strong>Net Earnings:</strong> ${cashOutSummary.profit}</p>
      <button onClick={() => window.location.reload()}>New Game</button>
    </div>
  </div>
)}

{gameStarted && cardsDealt && (
  <div className="money-display">
    Balance: ${playerMoney}
  </div>
)}
  </div>
);
}
export default App;