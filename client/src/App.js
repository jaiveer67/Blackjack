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
  const [bet1, setBet1] = useState(0); 
  const [bet2, setBet2] = useState(0); 
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
  const [showHelp, setShowHelp] = useState(false);
  const [helpPage, setHelpPage] = useState(1);
  const [hitEndedTurn, setHitEndedTurn] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedDecks, setSelectedDecks] = useState(null);
  const [hasSave, setHasSave] = useState(false);
  const [highCashout, setHighCashout] = useState(0);
  const [highMaxMoney, setHighMaxMoney] = useState(0);
  const [showMaxBalanceBanner, setShowMaxBalanceBanner] = useState(false);
  const [showCashoutBanner, setShowCashoutBanner] = useState(false);
  const [dealerHitsSoft17, setDealerHitsSoft17] = useState(false);
  const chipValues = [1, 5, 25, 100, 500];
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [showInsurance, setShowInsurance] = useState(false);
  const [insuranceTaken, setInsuranceTaken] = useState(false);

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
  if (roundNumber > 1 && baseBet > 0) {
    setLastBet(baseBet);
  }
}, [roundNumber, baseBet]);

useEffect(() => {
  if (hitEndedTurn) {
    setHitEndedTurn(false);
    handleStand();
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [playerValue1, hitEndedTurn]);

useEffect(() => {
  if (activeHand === 2 && playerValue2 === 21 && playerHand2.length === 2) {
    setTurnOver(true);
    setTimeout(() => {
      handleStand();
    }, 600);
  }
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [activeHand, playerValue2, isSplit]);

useEffect(() => {
  fetch('/get-options')
    .then(res => res.json())
    .then(data => {
      setSelectedDecks(data.deckCount);
      setDealerHitsSoft17(data.dealerHitsSoft17);
    });
}, []);

useEffect(() => {
  fetch("/has-save")
    .then(res => res.json())
    .then(data => setHasSave(data.hasSave));
}, []);

useEffect(() => {
  fetch("/get-highscores")
    .then(res => res.json())
    .then(data => {
      setHighCashout(data.cashout);
      setHighMaxMoney(data.max_balance);
    });
}, []);

const toggleMute = () => setIsMuted(prev => !prev);

const handleChipClick = (amount) => {
  playSound(chipSound);

  if (playerMoney >= currentBet + amount) {
    const newBet = currentBet + amount;
    setCurrentBet(newBet);
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

  if (roundNumber === 1) {
    setRoundNumber(2);
  }

  setBet1(currentBet);
  setBet2(currentBet); // initially same if not split

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
  if (data.dealerHand[0].rank === 'A') {
    setShowInsurance(true);
  } else {
    setShowInsurance(false);
  }
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
    setInsuranceTaken(false);
    if (data.gameOver) {
      setPlayerDisplayValue1(data.playerValue);
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
      const { playerValue, playerDisplayValue, playerHand, gameOver } = data;

      if (activeHand === 1) {
        setPlayerHand1(playerHand);
        setPlayerValue1(playerValue);
        setPlayerDisplayValue1(playerDisplayValue);
      } else {
        setPlayerHand2(playerHand);
        setPlayerValue2(playerValue);
        setPlayerDisplayValue2(playerDisplayValue);
      }

      const isDone = playerValue >= 21 || gameOver;
      const hasSecondHand = isSplit && playerHand2.length > 0;

      if (isDone) {
        if (activeHand === 1 && hasSecondHand) {
          setTurnOver(true); // hide buttons for a short period between hands
          setTimeout(() => {
          setActiveHand(2);
          setTurnOver(false); 
          }, 500); // short pause between hands
        } else {
          setTurnOver(true);
          setTimeout(() => {
          setHitEndedTurn(true);
          }, 400); // delay before dealer starts
        }
      }
    });
};

const handleStand = () => {
  if (!isSplit || activeHand === 2) {
    setPlayerDisplayValue1(`${playerValue1}`);
    setTurnOver(true);

    fetch("/stand")
      .then(res => res.json())
      .then(data => {
        graduallyRevealDealerCards(data);
      });
  } else if (isSplit && activeHand === 1) {
    // Switch to second hand
    setTurnOver(true);
    setTimeout(() => {
      setActiveHand(2);
      setTurnOver(false);
    }, 500);
  }

  const graduallyRevealDealerCards = (data) => {
    const totalCards = data.dealerHand.length;

    setTimeout(() => {
      setDealerHand(data.dealerHand);
      setRevealedDealerCardsCount(2);
      setDealerValue(calculateHandValue(data.dealerHand.slice(0, 2)));
      playSound(cardSound);

      if (totalCards === 2) {
        setTimeout(() => {
          setResultMessages(data.results || []);
          setGameOver(true);
          setTurnOver(true);
          setPlayerMoney(data.playerMoney);

          if (data.playerMoney > highMaxMoney) {
            setHighMaxMoney(data.playerMoney);
            setShowMaxBalanceBanner(true);
            setTimeout(() => setShowMaxBalanceBanner(false), 3000); // hide after 3s
          }

          if (data.playerMoney <= 0) {
            setIsBankrupt(true);
            setIsMuted(true);
            handleCashOut();
          }

          setTimeout(() => {
            handlePlayAgain();
          }, 2000);
        }, 400);
      }
    }, 400);

    let i = 2;
    const interval = setInterval(() => {
      i++;
      if (i > totalCards) {
        clearInterval(interval);
        return;
      }

      const visibleCards = data.dealerHand.slice(0, i);
      setRevealedDealerCardsCount(i);
      setDealerValue(calculateHandValue(visibleCards));
      playSound(cardSound);

      if (i === totalCards) {
        clearInterval(interval);
        setTimeout(() => {
          setResultMessages(data.results || []);
          setGameOver(true);
          setTurnOver(true);
          setPlayerMoney(data.playerMoney);

          if (data.playerMoney > highMaxMoney) {
            setHighMaxMoney(data.playerMoney);
            setShowMaxBalanceBanner(true);
            setTimeout(() => setShowMaxBalanceBanner(false), 3000); // hide after 3s
          }


          if (data.playerMoney <= 0) {
            setIsBankrupt(true);
            setIsMuted(true);
            handleCashOut();
          }

          setTimeout(() => {
            handlePlayAgain();
          }, 2000);
        }, 600);
      }
    }, 1000);
  };
};

const handleDouble = () => {
  if (!isSplit) {
    setTurnOver(true);
  }
  const newBet = activeHand === 1 ? bet1 : bet2;
  const doubledBet = newBet * 2;
  setCurrentBet(doubledBet);

  const endpoint = activeHand === 1 ? "/double/1" : "/double/2";

  fetch(endpoint, { method: "POST" })
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
        setPlayerDisplayValue1(data.playerValue);
        setBet1(doubledBet);
      } else {
        setPlayerHand2(data.playerHand);
        setPlayerValue2(data.playerValue);
        setPlayerDisplayValue2(data.playerValue);
        setBet2(doubledBet);
      }

      setPlayerMoney(data.playerMoney);

      if (data.playerMoney > highMaxMoney) {
        setHighMaxMoney(data.playerMoney);
        setShowMaxBalanceBanner(true);
        setTimeout(() => setShowMaxBalanceBanner(false), 3000); // hide after 3s
}

      const isFinalHand = !isSplit || activeHand === 2;
      const hasSecondHand = isSplit && activeHand === 1;

      if (isFinalHand) {
        setTurnOver(true);
        setTimeout(() => {
          setHitEndedTurn(true); // triggers handleStand indirectly
        }, 1000); // delay for dealer reveal
      } else if (hasSecondHand) {
        // delay transition to 2nd hand
        setTurnOver(true);
        setTimeout(() => {
          setActiveHand(2);
          setTurnOver(false);
        }, 800);
      }
    });
};


const handleSplit = () => {
  setTurnOver(true);
  setIsSplit(true);
  setBet1(currentBet);
  setBet2(currentBet);
  fetch("/split")
    .then(response => response.json())
    .then(data => {
      const hand1 = [data.playerHand1[0]];
      const hand2 = [data.playerHand2[0]];
      const extra1 = data.playerHand1[1];
      const extra2 = data.playerHand2[1];

      setPlayerMoney(data.playerMoney);
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
      setBet1(0);
      setBet2(0);
      setHitEndedTurn(false);
    });
};

const handleGameOver = () => {
  fetch("/gameOver")
    .then(response => response.json())
    .then(data => {
      setRevealedDealerCardsCount(2);
      setPlayerMoney(data.playerMoney);

      if (data.playerMoney > highMaxMoney) {
        setHighMaxMoney(data.playerMoney);
        setShowMaxBalanceBanner(true);
        setTimeout(() => setShowMaxBalanceBanner(false), 3000); // hide after 3s
}
      setDealerValue(data.dealerValue);
      setResultMessages(data.results || []);
      setTimeout(() => {
        handlePlayAgain();
    }, 3000);
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
      setIsMuted(true);
      setHighCashout(data.highCashout);
      setHighMaxMoney(data.highMaxMoney);
      // Optionally show message
      if (data.isNewCashout) {
        setShowCashoutBanner(true);
        setTimeout(() => setShowCashoutBanner(false), 3000);
      }
      return fetch('/has-save');
    })
    .then(res => res.json())
    .then(data => setHasSave(data.hasSave));
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

function applyOptions(deckCount, dealerHitsSoft17) {
  fetch('/set-options', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      deckCount,
      dealerHitsSoft17
    })
  })
    .then(res => res.json())
    .then(() => {
      setSelectedDecks(deckCount);
      setDealerHitsSoft17(dealerHitsSoft17);
      setShowOptions(false);
    });
}

const openOptions = () => {
  fetch("/get-options")
    .then(res => res.json())
    .then(data => {
      setSelectedDecks(data.deckCount);
      setDealerHitsSoft17(data.dealerHitsSoft17);
      setShowOptions(true); // Move this here after loading
    });
};

function handleLoadGame() {
  fetch('/load-game', {
    method: 'POST'
  })
    .then(res => {
      if (!res.ok) {
        throw new Error("No saved game found");
      }
      return res.json();
    })
    .then(data => {
      setPlayerMoney(data.playerMoney);
      setGameStarted(false);
      setBettingPhase(true);
    })
    .catch((err) => {
      console.error("Load failed:", err);
      alert("No saved game found.");
    });
}

const handleInsurance = (takeInsurance) => {
  setShowInsurance(false);
  setInsuranceTaken(true);

  if (takeInsurance) {
    fetch("/take-insurance", { method: "POST" })
      .then(res => res.json())
      .then(data => {
        setPlayerMoney(data.playerMoney);
      });
  }
};


return (
  <div className="App">
  <h1>BlackJack</h1>

  {bettingPhase && !gameStarted && (
    <button className="top-left-options-button" onClick={openOptions}>
      Options
    </button>
      )}

  {!gameStarted && !bettingPhase && (
    <div className="start-button-container">
    <img src={logo} alt="Blackjack Logo" className="start-logo" />
    {(highCashout > 2000 || highMaxMoney > 2000) && (
      <div className="high-score-text">
        {highCashout > 2000 && (
          <div>🏆 Cashout Record: ${highCashout}</div>
        )}
        {highMaxMoney > 2000 && (
          <div>📈 Max Balance Record: ${highMaxMoney}</div>
        )}
      </div>
    )}
      <button
  onClick={handleReset}
>
  Start New Game
</button>
{hasSave && (
      <button onClick={handleLoadGame}
      style={{ marginTop: "40px" }}
      >Load Game
      </button>
    )}
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
      <button 
      onClick={handleClearBet}
      disabled={currentBet === 0}
      >Clear Bet
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
      <div className ="top-buttons-container">
    <button onClick={toggleMute}>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
      <button onClick={() => setShowHelp(true)}>
      Help
    </button>
</div>
    </div>
  )}
    {gameStarted && (
      <>
      <div className ="top-buttons-container">
    <button onClick={toggleMute}>
        {isMuted ? 'Unmute' : 'Mute'}
      </button>
    <button onClick={() => setShowHelp(true)}>
      Help
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
    Bet: ${bet1}
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
    Bet: ${bet2}
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
      playerMoney < currentBet ||
      isSplit
    }
  >
    Split
  </button>
</div>

{showInsurance && !insuranceTaken && (
  <div className="insurance-modal-overlay">
    <div className="insurance-modal-content">
      <p className="insurance-text">The dealer is showing an Ace. Take insurance?</p>
      <div className="insurance-buttons">
        <button onClick={() => handleInsurance(true)}>Yes</button>
        <button onClick={() => handleInsurance(false)}>No</button>
      </div>
    </div>
  </div>
)}

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

{showHelp && (
  <div className="help-modal-overlay">
    <div className="help-modal-content">
      <button
  className="close-help-x"
  onClick={() => {
    setShowHelp(false);
    setHelpPage(1); 
  }}
>
  ❌
</button>
      {helpPage === 1 && (
        <>
          <h2>What Is Blackjack?</h2>
          <p>
            Blackjack is a popular card game where the goal is to beat the dealer by getting as close to 21 as possible without going over. 
            It’s also known as "21" and is one of the most played casino games worldwide.
          </p>
          <p>
            Players are initially dealt two cards and can choose to draw another card ("Hit") to improve their hand or stick with what they have ("Stand").
          </p>
        </>
      )}

      {helpPage === 2 && (
        <>
          <h2>How to Play</h2>
          <ul style={{ textAlign: 'left' }}>
            <li><strong>Hit:</strong> Take another card to get closer to 21.</li>
            <li><strong>Stand:</strong> Keep your current hand and end your turn.</li>
            <li><strong>Double:</strong> Double your bet, receive one more card, and end your turn.</li>
            <li><strong>Split:</strong> If your first two cards are the same value, you can split them into two hands.</li>
          </ul>
          <p>
            Aces count as either 1 or 11. Face cards (J, Q, K) count as 10.
          </p>
        </>
      )}

      {helpPage === 3 && (
  <>
    <h2>Dealer Rules & Payouts</h2>
    <p>
      After the player has finished, the dealer reveals their hidden card and draws cards until reaching at least 17.
      Depending on the selected game options, the dealer may either <strong>stand</strong> or <strong>hit on a soft 17</strong> (a hand totaling 17 that includes an Ace counted as 11).
    </p>
    <p>
      If the dealer busts (goes over 21), the player wins. If not, the hand closer to 21 wins.
    </p>
    <p>
      <strong>Payouts:</strong>
    </p>
    <ul style={{ textAlign: 'left' }}>
      <li>Win: 2× your bet</li>
      <li>Blackjack: 3:2 payout (if you get 21 with your first 2 cards)</li>
      <li>Push (tie): Bet returned</li>
      <li>Lose: You lose your bet</li>
    </ul>
  </>
)}

      <div className="help-nav-buttons">
        {helpPage > 1 && (
          <button onClick={() => setHelpPage(helpPage - 1)}>Back</button>
        )}
        {helpPage < 3 && (
          <button onClick={() => setHelpPage(helpPage + 1)}>Next</button>
        )}
      </div>
      </div>
      </div>
)}
{showOptions && (
  <div className="options-modal-overlay">
    <div className="options-modal-content">
      <button
        className="close-options-x"
        onClick={() => setShowOptions(false)}
      >
        ❌
      </button>
      <h2>Game Options</h2>
      <label htmlFor="deck-select">Number of Decks:</label>
      <select
        id="deck-select"
        value={selectedDecks}
        onChange={(e) => setSelectedDecks(parseInt(e.target.value))}
      >
        {[1, 2, 4, 6, 8].map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </select>
       <label>Dealer Hits Soft 17:</label>
      <select
        value={dealerHitsSoft17 ? "yes" : "no"}
        onChange={(e) => setDealerHitsSoft17(e.target.value === "yes")}
      >
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>
      
      <button
  className="apply-options-button"
  onClick={() => {
    applyOptions(selectedDecks, dealerHitsSoft17);
    setShowOptions(false);
  }}
>
  Apply
</button>
    </div>
  </div>
)}
{showCashoutBanner && (
  <div className="banner new-cashout-banner">
    💰 New Cashout Record!
  </div>
)}

{showMaxBalanceBanner && (
  <div className="banner new-max-banner">
    📈 New Max Balance Record!
  </div>
)}

    </div>   
);
}
export default App;