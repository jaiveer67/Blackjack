# 🃏 Blackjack Game

## 🎮 Introduction

Welcome to my **Blackjack Game App** — a full-stack implementation of the classic casino card game. Built using **React** for the frontend and **Flask** (Python) for the backend, this application lets you play against a dealer with proper Blackjack rules and an interactive UI.

Your goal is simple: **get as close to 21 as possible** without going over, and beat the dealer.

---

## 🚀 Features

- ✅ **Play against a dealer** with classic Blackjack rules
- 🃏 **Face-down dealer card** until the player ends their turn
- 🧠 **Game logic handled in Python** with deck, player, and dealer management
- 🎨 **React frontend** dynamically renders cards and scores
- 👇 Interactive controls for:
  - **Hit** – take another card
  - **Stand** – end your turn and let the dealer play
  - **Play Again** – reset and start a new round
- ♠️ ♥️ **Card visuals** for both player and dealer hands
- 🔄 **Stateful gameplay** with automatic bust detection

---

## ⚙️ Tech Stack

- **Frontend**: React (JavaScript)
- **Backend**: Flask (Python)
- **Communication**: RESTful API with `fetch`

---

## 🧩 Gameplay Notes

- At the start, **only one dealer card is shown**.
- Dealer's total is hidden until the player stands or busts.
- Aces are treated as both 1/11, whichever is more helpful to the player.
- Cards are randomly dealt from a full deck.

---

## 🛠 Setup Instructions
