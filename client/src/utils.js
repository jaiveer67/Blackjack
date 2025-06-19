export const getCardValue = (card) => {
  const valueMap = {
    '2': 2, '3': 3, '4': 4, '5': 5,
    '6': 6, '7': 7, '8': 8, '9': 9,
    '10': 10, 'J': 10, 'Q': 10, 'K': 10, 'A': 11
  };
  return valueMap[card?.rank] ?? 0;
};

export const calculateHandValue = (hand) => {
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

export const calculateDisplayValue = (hand) => {
  let total = 0;
  let aceCount = 0;

  for (let card of hand) {
    if (card.rank === 'A') {
      aceCount += 1;
    } else {
      total += getCardValue(card);
    }
  }

  const min = total + aceCount * 1;
  const max = (aceCount >= 1 && min + 10 <= 21) ? min + 10 : min;

  if (max === 21 || min === 21) {
    return "21";
  }

  return min !== max ? `${min} / ${max}` : `${min}`;
}

export const playSound = (sounds, soundName, isMuted) => {
  if (!isMuted && sounds.current[soundName]) {
    sounds.current[soundName].currentTime = 0;
    sounds.current[soundName].play();
  }
};

export const toggleMute = (setIsMuted) => setIsMuted(prev => !prev);

export const preloadImages = (imageUrls) => {
  imageUrls.forEach((url) => {
    const img = new window.Image();
    img.src = url;
  });
}