export const handleChipClick = (amount, { playSound, sounds, isMuted, playerMoney, currentBet, setCurrentBet }) => {
  playSound(sounds, 'chips', isMuted);

  if (playerMoney >= currentBet + amount) {
    const newBet = currentBet + amount;
    setCurrentBet(newBet);
  }
};

export const handleClearBet = (setCurrentBet) => {
  setCurrentBet(0);
};

export const handleDeal = ({
  setGameStarted,
  setCardsDealt,
  setPlayerHand1,
  setDealerHand,
  setPlayerValue1,
  setPlayerDisplayValue1,
  setDealerValue,
  setIsGameOver,
  setBettingPhase,
  setResultMessages,
  setActiveHand,
  setIsSplit,
  setBet1,
  setBet2,
  setTurnOver,
  setShowInsurance,
  setInsuranceTaken,
  setRoundNumber,
  roundNumber,
  setLastBet,
  setShowSummary,
  setShowMaxBalanceBanner,
  setShowCashoutBanner,
  setPlayerMoney,
  playerMoney,
  currentBet,
  playSound,
  sounds,
  isMuted,
  handleStand
}) => {
  setGameStarted(true);
  setBettingPhase(false);
  setActiveHand(1);
  setIsSplit(false);
  setShowInsurance(false);
  setInsuranceTaken(false);
  setTurnOver(false);
  setResultMessages([]);
  setShowSummary(false);
  setShowMaxBalanceBanner(false);
  setShowCashoutBanner(false);

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
      setPlayerValue1(data.playerValue);
      setPlayerDisplayValue1(data.playerDisplayValue);
      setIsGameOver(data.isGameOver);
      setPlayerMoney(data.playerMoney);
      setGameStarted(true);
      const playerCards = data.playerHand;
      const dealerCards = data.dealerHand;

      setPlayerHand1([]);
      setDealerHand([]);

      // Deal cards one by one
      setTimeout(() => {
        setPlayerHand1([playerCards[0]]);
        playSound(sounds, 'card', isMuted);
      }, 300);

      setTimeout(() => {
        setDealerHand([dealerCards[0]]);
        playSound(sounds, 'card', isMuted);
      }, 600);

      setTimeout(() => {
        setPlayerHand1([playerCards[0], playerCards[1]]);
        playSound(sounds, 'card', isMuted);
      }, 900);

      setTimeout(() => {
        setDealerHand([dealerCards[0], dealerCards[1]]);
        playSound(sounds, 'card', isMuted);
      }, 1200);

      setTimeout(() => {
        setCardsDealt(true);
        if ((data.dealerHand[0].rank === 'A') && ((playerMoney - currentBet) > (currentBet / 2))) {
          setShowInsurance(true);
        } else {
          setShowInsurance(false);
        }
      }, 1500);
      setTimeout(() => {
        setPlayerMoney(data.playerMoney);
        setPlayerDisplayValue1(data.playerDisplayValue);
        setDealerValue(data.dealerValue);
        setResultMessages(data.result || []);
        setActiveHand(1);
        setBettingPhase(false);
        if (data.isGameOver && data.playerHand.length === 2 && data.playerValue === 21 && !(data.dealerHand[0].rank === 'A')) {
          setTurnOver(true);
          playSound(sounds, 'blackjack', isMuted);
          handleStand();
        } else {
          setPlayerDisplayValue1(data.playerDisplayValue);
        }
      }, 1500);
    })
};

export const handleHit = ({
  playSound,
  sounds,
  isMuted,
  isSplit,
  activeHand,
  setCanDouble,
  setPlayerHand1,
  setPlayerValue1,
  setPlayerDisplayValue1,
  setPlayerHand2,
  setPlayerValue2,
  setPlayerDisplayValue2,
  playerHand2,
  setTurnOver,
  setActiveHand,
  setHitEndedTurn
}) => {
  playSound(sounds, 'card', isMuted);

  if (!isSplit || activeHand === 2) {
    setCanDouble(false);
  }

  const endpoint = activeHand === 1 ? "/hit/1" : "/hit/2";
  fetch(endpoint)
    .then(response => response.json())
    .then(data => {
      const { playerValue, playerDisplayValue, playerHand, isGameOver } = data;

      if (activeHand === 1) {
        setPlayerHand1(playerHand);
        setPlayerValue1(playerValue);
        setPlayerDisplayValue1(playerDisplayValue);
      } else {
        setPlayerHand2(playerHand);
        setPlayerValue2(playerValue);
        setPlayerDisplayValue2(playerDisplayValue);
      }

      const isDone = playerValue >= 21 || isGameOver;
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

export const handleStand = ({
  isSplit,
  activeHand,
  setTurnOver,
  setActiveHand,
  setPlayerDisplayValue1,
  setPlayerDisplayValue2,
  setDealerHand,
  setRevealedDealerCardsCount,
  setDealerValue,
  playSound,
  sounds,
  isMuted,
  setResultMessages,
  setIsGameOver,
  setPlayerMoney,
  highMaxMoney,
  setHighMaxMoney,
  setShowMaxBalanceBanner,
  setIsBankrupt,
  setIsMuted,
  handleCashOut,
  handlePlayAgain,
  calculateHandValue
}) => {
  if (!isSplit || activeHand === 2) {
    setTurnOver(true);
    setActiveHand(null); // Clear active hand display

    fetch("/stand")
      .then(res => res.json())
      .then(data => {
        setPlayerDisplayValue1(data.playerValue);
        if (data.playerValue2 !== undefined) {
          setPlayerDisplayValue2(data.playerValue2);
        }
        graduallyRevealDealerCards(data);
      });
  } else if (isSplit && activeHand === 1) {
    setPlayerDisplayValue1(prev => {
      const parts = prev.split('/');
      return parts.length === 2 ? parts[1] : prev;
    });

    setTurnOver(true);
    setTimeout(() => {
      setActiveHand(2);
      setTurnOver(false);
    }, 500);
  }

  function graduallyRevealDealerCards(data) {
    const totalCards = data.dealerHand.length;
    const playerBlackjack = data.playerBlackjack;

    // Always show first 2 dealer cards after delay
    setTimeout(() => {
      setDealerHand(data.dealerHand);
      setRevealedDealerCardsCount(2);
      setDealerValue(calculateHandValue(data.dealerHand.slice(0, 2)));
      playSound(sounds, 'card', isMuted);

      if (totalCards === 2 || playerBlackjack) {
        setTimeout(() => {
          setResultMessages(data.results || []);
          setIsGameOver(true);
          setTurnOver(true);
          setPlayerMoney(data.playerMoney);

          if (data.playerMoney > highMaxMoney) {
            setHighMaxMoney(data.playerMoney);
            setShowMaxBalanceBanner(true);
            setTimeout(() => setShowMaxBalanceBanner(false), 3000);
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
      } else {
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
          playSound(sounds, 'card', isMuted);

          if (i === totalCards) {
            clearInterval(interval);
            setTimeout(() => {
              setResultMessages(data.results || []);
              setIsGameOver(true);
              setTurnOver(true);
              setPlayerMoney(data.playerMoney);

              if (data.playerMoney > highMaxMoney) {
                setHighMaxMoney(data.playerMoney);
                setShowMaxBalanceBanner(true);
                setTimeout(() => setShowMaxBalanceBanner(false), 3000);
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
      }
    }, 400);
  }
};

export const handleDouble = ({
  setTurnOver,
  isSplit,
  activeHand,
  bet1,
  bet2,
  setCurrentBet,
  playSound,
  sounds,
  isMuted,
  setPlayerHand1,
  setPlayerValue1,
  setPlayerDisplayValue1,
  setBet1,
  setPlayerHand2,
  setPlayerValue2,
  setPlayerDisplayValue2,
  setBet2,
  setPlayerMoney,
  highMaxMoney,
  setHighMaxMoney,
  setShowMaxBalanceBanner,
  setActiveHand,
  setHitEndedTurn
}) => {
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

      playSound(sounds, 'card', isMuted);

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

export const handleSplit = ({
  setTurnOver,
  setIsSplit,
  setBet1,
  setBet2,
  currentBet,
  fetch,
  setPlayerMoney,
  setPlayerHand1,
  setPlayerHand2,
  setPlayerValue1,
  setPlayerDisplayValue1,
  setPlayerValue2,
  setPlayerDisplayValue2,
  calculateHandValue,
  calculateDisplayValue,
  playSound,
  sounds,
  isMuted,
  setActiveHand
}) => {
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
        playSound(sounds, 'card', isMuted);
      }, 600);

      setTimeout(() => {
        const updatedHand2 = [...hand2, extra2];
        setPlayerHand2(updatedHand2);
        setPlayerValue2(calculateHandValue(updatedHand2));
        setPlayerDisplayValue2(calculateDisplayValue(updatedHand2));
        playSound(sounds, 'card', isMuted);

        setTurnOver(false);
        if (calculateHandValue([...hand1, extra1]) !== 21) {
          setActiveHand(1);
        } else {
          setActiveHand(2);
        }
      }, 1200);
    });
};

export const handlePlayAgain = ({
  setIsGameOver,
  setCardsDealt,
  setCanDouble,
  setIsSplit,
  setTurnOver,
  setDealerHand,
  setDealerValue,
  setRevealedDealerCardsCount,
  setPlayerHand1,
  setPlayerValue1,
  setPlayerDisplayValue1,
  setResultMessages,
  setPlayerHand2,
  setPlayerValue2,
  setPlayerDisplayValue2,
  setBettingPhase,
  setCurrentBet,
  setBaseBet,
  setGameStarted,
  handleClearBet,
  setBet1,
  setBet2,
  setHitEndedTurn,
  setInsuranceTaken,
  setShowInsurance
}) => {
  setIsGameOver(false);
  setCardsDealt(false);
  setCanDouble(true);
  setIsSplit(false);
  setTurnOver(false);
  setDealerHand([]);
  setDealerValue(0);
  setRevealedDealerCardsCount(1);
  setPlayerHand1([]);
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
  setInsuranceTaken(false);
  setShowInsurance(false);
};

export const handleReset = ({
  setIsGameOver,
  setPlayerMoney,
  setCurrentBet,
  setPlayerHand1,
  setPlayerHand2,
  setDealerHand,
  setGameStarted,
  setResultMessages,
  setBettingPhase,
  setRoundNumber
}) => {
  setIsGameOver(true);
  fetch("/reset", { method: "POST" })
    .then(res => res.json())
    .then(() => {
      setPlayerMoney(2000);
      setCurrentBet(0);
      setPlayerHand1([]);
      setPlayerHand2([]);
      setDealerHand([]);
      setGameStarted(false);
      setIsGameOver(false);
      setResultMessages([]);
      setBettingPhase(true);
      setRoundNumber(1);
    });
};

export const handleCashOut = ({
  setCashOutSummary,
  setShowSummary,
  setIsMuted,
  setHighCashout,
  setHighMaxMoney,
  setShowCashoutBanner,
  setHasSave
}) => {
  fetch("/cashout")
    .then(res => res.json())
    .then(data => {
      setCashOutSummary(data);
      setShowSummary(true);
      setIsMuted(true);
      setHighCashout(data.highCashout);
      setHighMaxMoney(data.highMaxMoney);
      if (data.isNewCashout) {
        setShowCashoutBanner(true);
        setTimeout(() => setShowCashoutBanner(false), 3000);
      }
      return fetch('/has-save');
    })
    .then(res => res.json())
    .then(data => setHasSave(data.hasSave));
};

export function handleLoadGame({
  setPlayerMoney,
  setGameStarted,
  setBettingPhase
}) {
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

export const handleInsurance = ({
  take,
  setShowInsurance,
  setInsuranceTaken,
  setPlayerMoney,
  handleAfterInsurance
}) => {
  setShowInsurance(false);
  if (take) {
    setInsuranceTaken(true);
    fetch("/take-insurance", { method: "POST" })
      .then(res => res.json())
      .then(data => {
        setPlayerMoney(data.playerMoney);
      })
      .finally(() => handleAfterInsurance());
  } else {
    handleAfterInsurance();
  }
};

export const handleAfterInsurance = ({
  playerHand1,
  playerValue1,
  setTurnOver,
  playSound,
  sounds,
  isMuted,
  handleStand
}) => {

  const playerHasBlackjack = playerHand1.length === 2 && playerValue1 === 21;

  fetch("/check-dealer-blackjack")
    .then(res => res.json())
    .then(data => {
      const dealerHasBlackjack = data.dealerValue === 21;

      if (playerHasBlackjack || dealerHasBlackjack) {
        setTurnOver(true);
        if (playerHasBlackjack) playSound(sounds, 'blackjack', isMuted);
        handleStand();
      }
    });
};

export function handleOptions(deckCount, dealerHitsSoft17, setSelectedDecks, setDealerHitsSoft17, setShowOptions) {
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

export const openOptions = (setSelectedDecks, setDealerHitsSoft17, setShowOptions) => {
  fetch("/get-options")
    .then(res => res.json())
    .then(data => {
      setSelectedDecks(data.deckCount);
      setDealerHitsSoft17(data.dealerHitsSoft17);
      setShowOptions(true);
    });
};