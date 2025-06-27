/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from 'react'
import './app.css';
import { getCardValue, calculateHandValue, calculateDisplayValue, toggleMute, playSound, preloadImages } from './utils';
import HelpModal from './components/helpModal';
import OptionsModal from './components/optionsModal';
import SummaryModal from './components/summaryModal';
import InsuranceModal from './components/insuranceModal';
import Banner from './components/banner';
import TopButtons from './components/topButtons';
import BettingSection from './components/bettingSection';
import GameControls from './components/gameControls';
import DealerHand from './components/dealerHand';
import PlayerHandWrapper from './components/playerHandWrapper';
import SingleHandWrapper from './components/singleHandWrapper';
import { handleClearBet, handleChipClick, handleDeal, handleHit, handleStand, handleDouble, handlePlayAgain, handleSplit, handleReset, handleCashOut, handleLoadGame, handleInsurance, handleAfterInsurance, handleOptions, openOptions } from './controlHandlers';
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
  const [isGameOver, setIsGameOver] = useState(false);
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
  const [showInsurance, setShowInsurance] = useState(false);
  const [insuranceTaken, setInsuranceTaken] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const chipValues = [1, 5, 25, 100, 500];
  const sounds = useRef({});

  useEffect(() => {
    const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
    const ranks = [
      'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'
    ];

    const cardFilenames = [];
    suits.forEach(suit => {
      ranks.forEach(rank => {
        cardFilenames.push(`${rank}_of_${suit}.png`);
      });
    });
    cardFilenames.push('card_back.png');

    const imageUrls = cardFilenames.map(
      filename =>
        process.env.PUBLIC_URL
          ? `${process.env.PUBLIC_URL}/assets/cards/${filename}`
          : `/assets/cards/${filename}`
    );

    preloadImages(imageUrls);
  }, []);

  console.log("backgroundMusic:", backgroundMusic);


  useEffect(() => {
    const localSounds = sounds.current;
    localSounds.card = new Audio(cardSound);
    localSounds.chips = new Audio(chipSound);
    localSounds.bgm = new Audio(backgroundMusic);
    localSounds.bgm.loop = true;
    localSounds.bgm.volume = 0.2;
    localSounds.bgm.muted = isMuted;
    localSounds.blackjack = new Audio(blackjackSound);

    Object.values(localSounds).forEach(sound => {
      sound.load();
    });

    localSounds.bgm.play().catch(() => {
      console.warn("Autoplay blocked");
    });

    return () => {
      if (localSounds && localSounds.bgm) {
        localSounds.bgm.pause();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (sounds.current.bgm) {
      sounds.current.bgm.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    if (roundNumber > 1 && baseBet > 0) {
      setLastBet(baseBet);
    }
  }, [roundNumber, baseBet]);

  useEffect(() => {
    if (activeHand === 2 && playerValue2 === 21 && playerHand2.length === 2) {
      setTurnOver(true);
      setTimeout(() => {
        handleStandWrapper();
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
  const userId = localStorage.getItem("user_id");
  fetch("/has-save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId })
  })
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

  useEffect(() => {
    if (hitEndedTurn) {
      setHitEndedTurn(false);
      handleStandWrapper();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerValue1, hitEndedTurn]);

  useEffect(() => {
  let userId = localStorage.getItem("user_id");
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem("user_id", userId);
  }
}, []);

  const handleChipClickWrapper = (amount) => {
    handleChipClick(amount, {
      playSound,
      sounds,
      isMuted,
      playerMoney,
      currentBet,
      setCurrentBet
    });
  };

  const handleDealWrapper = () => {
    handleDeal({
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
      handleStand: handleStandWrapper
    });
  };

  const handleHitWrapper = () => {
    handleHit({
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
    });
  };

  const handleStandWrapper = () => {
    handleStand({
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
      handleCashOut: handleCashOutWrapper,
      handlePlayAgain: handlePlayAgainWrapper,
      calculateHandValue
    });
  };

  const handleDoubleWrapper = () => {
    handleDouble({
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
    });
  };

  const handleSplitWrapper = () => {
    handleSplit({
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
    });
  };


  const handlePlayAgainWrapper = () => {
    handlePlayAgain({
      setIsGameOver,
      setCardsDealt,
      setCanDouble,
      setIsSplit,
      setTurnOver,
      setDealerValue,
      setRevealedDealerCardsCount,
      setPlayerValue1,
      setPlayerDisplayValue1,
      setResultMessages,
      setPlayerHand1,
      setDealerHand,
      setPlayerHand2,
      setPlayerValue2,
      setPlayerDisplayValue2,
      setBettingPhase,
      setCurrentBet,
      setBaseBet,
      setGameStarted,
      handleClearBet: () => handleClearBet(setCurrentBet),
      setBet1,
      setBet2,
      setHitEndedTurn,
      setInsuranceTaken,
      setShowInsurance
    });
  };

  const handleCashOutWrapper = () => {
    handleCashOut({
      setCashOutSummary,
      setShowSummary,
      setIsMuted,
      setHighCashout,
      setHighMaxMoney,
      setShowCashoutBanner,
      setHasSave
    });
  };

  const handleOptionsWrapper = () => {
    handleOptions(
      selectedDecks,
      dealerHitsSoft17,
      setSelectedDecks,
      setDealerHitsSoft17,
      setShowOptions
    );
  };

  const openOptionsWrapper = () => {
    openOptions(
      setSelectedDecks,
      setDealerHitsSoft17,
      setShowOptions
    );
  };

  const handleLoadGameWrapper = () => {
    handleLoadGame({
      setPlayerMoney,
      setGameStarted,
      setBettingPhase,
      sounds: sounds,
      isMuted,
    });
  };

  const handleResetWrapper = () => {
    if (sounds.current.bgm && !isMuted) {
    sounds.current.bgm.play().catch(() => {
      console.warn("Music play still blocked");
    });
  }
    handleReset({
      setPlayerMoney,
      setGameStarted,
      setBettingPhase,
      setCurrentBet,
      setBaseBet,
      setBet1,
      setBet2,
      setPlayerHand1,
      setPlayerHand2,
      setActiveHand,
      setDealerHand,
      setPlayerValue1,
      setPlayerDisplayValue1,
      setPlayerValue2,
      setPlayerDisplayValue2,
      setDealerValue,
      setIsGameOver,
      setResultMessages,
      setCardsDealt,
      setIsSplit,
      setTurnOver,
      setRevealedDealerCardsCount,
      setRoundNumber,
      setShowHelp,
      setHelpPage,
      setHitEndedTurn,
      setShowOptions,
      setSelectedDecks,
      setHasSave,
      setHighCashout,
      setHighMaxMoney,
      setShowMaxBalanceBanner,
      setShowCashoutBanner,
      setDealerHitsSoft17,
      setIsBankrupt,
      setShowSummary,
      setCashOutSummary,
      setShowInsurance,
      setInsuranceTaken
    });
  };

  const handleAfterInsuranceWrapper = (take) => {
    handleInsurance({
      take,
      setShowInsurance,
      setInsuranceTaken,
      setPlayerMoney,
      handleAfterInsurance: () => handleAfterInsurance({
        playerHand1,
        playerValue1,
        setTurnOver,
        playSound,
        sounds,
        isMuted,
        handleStand: handleStandWrapper
      })
    });
  };

  return (
    <div className="App">
      <h1>BlackJack</h1>

      {bettingPhase && !gameStarted && (
        <button className="top-left-options-button" onClick={openOptionsWrapper}>
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
          <button onClick={handleResetWrapper}>
            Start New Game
          </button>
          {hasSave && (
            <button onClick={handleLoadGameWrapper}
              style={{ marginTop: "40px" }}
            >Load Game
            </button>
          )}
        </div>
      )}

      {bettingPhase && !gameStarted && (
        <BettingSection
          playerMoney={playerMoney}
          currentBet={currentBet}
          chipValues={chipValues}
          handleChipClick={handleChipClickWrapper}
          handleClearBet={() => handleClearBet(setCurrentBet)}
          handleDeal={handleDealWrapper}
          handleCashOut={handleCashOutWrapper}
          lastBet={lastBet}
          setCurrentBet={setCurrentBet}
          handleLoadGame={handleLoadGameWrapper}
          hasSave={hasSave}
          isMuted={isMuted}
          toggleMute={() => toggleMute(setIsMuted)}
          setShowHelp={setShowHelp}
        />
      )}

      {gameStarted && (
        <>
          <TopButtons
            isMuted={isMuted}
            toggleMute={() => toggleMute(setIsMuted)}
            setShowHelp={setShowHelp}
          />

          <DealerHand
            cardsDealt={cardsDealt}
            dealerValue={dealerValue}
            dealerHand={dealerHand}
            revealedDealerCardsCount={revealedDealerCardsCount}
          />

          <div className="hands-section">
            {playerHand2.length > 0 ? (
              <div className="split-hands">
                <PlayerHandWrapper
                  handNumber={1}
                  cards={playerHand1}
                  displayValue={playerDisplayValue1}
                  bet={bet1}
                  isActive={activeHand === 1}
                  isGameOver={isGameOver}
                  resultMessage={resultMessages[0] || ""}
                  cardsDealt={cardsDealt}
                />
                <PlayerHandWrapper
                  handNumber={2}
                  cards={playerHand2}
                  displayValue={playerDisplayValue2}
                  bet={bet2}
                  isActive={!isGameOver && activeHand === 2}
                  isGameOver={isGameOver}
                  resultMessage={resultMessages[1]}
                  cardsDealt={cardsDealt}
                />
              </div>
            ) : (
              <SingleHandWrapper
                cards={playerHand1}
                displayValue={playerDisplayValue1}
                bet={bet1}
                isGameOver={isGameOver}
                resultMessage={resultMessages}
                cardsDealt={cardsDealt}
              />
            )}
          </div>
        </>
      )}

      <GameControls
        gameStarted={gameStarted}
        cardsDealt={cardsDealt}
        turnOver={turnOver}
        handleHit={handleHitWrapper}
        handleStand={handleStandWrapper}
        handleDouble={handleDoubleWrapper}
        handleSplit={handleSplitWrapper}
        playerMoney={playerMoney}
        currentBet={currentBet}
        canDouble={canDouble}
        playerHand1={playerHand1}
        playerValue2={playerValue2}
        isSplit={isSplit}
        getCardValue={getCardValue}
      />

      <InsuranceModal
        showInsurance={showInsurance}
        insuranceTaken={insuranceTaken}
        handleInsurance={handleAfterInsuranceWrapper}
      />

      <SummaryModal
        showSummary={showSummary}
        cashOutSummary={cashOutSummary}
        isBankrupt={isBankrupt}
      />

      {gameStarted && cardsDealt && (
        <div className="money-display">
          Balance: ${playerMoney}
        </div>
      )}

      <HelpModal
        showHelp={showHelp}
        helpPage={helpPage}
        setShowHelp={setShowHelp}
        setHelpPage={setHelpPage}
      />

      <OptionsModal
        showOptions={showOptions}
        setShowOptions={setShowOptions}
        selectedDecks={selectedDecks}
        setSelectedDecks={setSelectedDecks}
        dealerHitsSoft17={dealerHitsSoft17}
        setDealerHitsSoft17={setDealerHitsSoft17}
        handleOptions={handleOptionsWrapper}
      />

      <Banner
        show={showCashoutBanner}
        message="💰 Congrats! New Cashout Record!"
      />

      <Banner
        show={showMaxBalanceBanner}
        message="📈 Congrats! New Max Balance Record!"
      />

    </div>
  );
}
export default App;