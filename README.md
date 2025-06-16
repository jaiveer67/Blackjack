# 🃏 BlackJack Game

## 🎮 Introduction

Welcome to my **Blackjack Game** — a full-stack implementation of the classic casino card game. Built using **React** (JavaScript) for the frontend and **Flask** (Python) for the backend, this application lets you play against a dealer with proper Blackjack rules and an interactive UI.

Your goal is simple: **get as close to 21 as possible** without going over, and beat the dealer.

---

## 🖼️ Game Preview

<p align="center">
  <img src="screen_shot.png" alt="Blackjack Game Screenshot" width="700"/>
</p>

---

## 🎮 Play the Game
You can try the game live here:
🔗 https://blackjack-app-g8kl.onrender.com

⚠️ Note: This hosted version may feel a bit slower than running it locally. This is due to server latency and cold starts on the free hosting tier. For the best experience, clone the repo and run it locally using the instructions below.

---

## 🚀 Features

### 🎮 Core Gameplay
- ✅ **Play against a dealer** with classic Blackjack rules  
- 🃏 **Face-down dealer card** until the player ends their turn  
- 🧠 **Game logic in Python** managing deck, player, and dealer behavior  
- 🎨 **React frontend** dynamically renders cards and scores  

---

### 🎛️ Interactive Controls
- **Hit** – take another card  
- **Stand** – end your turn and let the dealer play  
- **Double** – double your bet, receive one card, and end your turn  
- **Split** – split your hand into 2 if you have a pair  
- **Rebet** – repeat your last bet with a single click  
- **Insurance** – place a side bet if the dealer shows an Ace  
- **Cash Out** – view final money, max money, hands won, and profit  
- **Mute/Unmute** – toggle background music and sound effects  

---

### 🔄 Game Mechanics
- 🃏 One-by-one **animated card dealing**  
- ♠️ ♥️ Visual card graphics and dynamic score updates  
- Automatic **bust detection** and Blackjack vs. 21 distinction  
- Split hands handled independently with separate outcomes  

---

### 📈 Session Tracking
- Starting balance: **$2000**  
- Chip-based **betting system** with preset denominations  
- Tracks:
  - Hands won  
  - Highest money reached  
  - Highest cashout  
  - Insurance bet impact  
- 💸 Bankruptcy screen appears when funds hit $0  

---

### ⚙️ Custom Game Options
- Select number of decks: **1, 2, 4, 6, 8**  
- Toggle: **Dealer Hits on Soft 17**  
- Settings persist between sessions


---

## ⚙️ Tech Stack

- **Frontend**: React (JavaScript)
- **Backend**: Flask (Python)
- **Communication**: RESTful API via `fetch`

---

## 🧩 Gameplay Notes

- Dealer's second card remains hidden until the player's turn ends.
- Aces are treated as both 1/11, whichever is more helpful to the player.
- Deck is reshuffled each round.
- After splitting, Blackjack is no longer possible — a 21 is just treated as a strong hand.
- Double and Split actions require sufficient funds.
- Cards are dealt one at a time with visual and audio feedback.
- Game options (deck count & dealer rules) are saved between sessions.
- Insurance is offered when the dealer shows an Ace, and the player has enough money. If the dealer has Blackjack, the insurance bet pays 2:1. Otherwise, it’s lost.
---

## 🛠 Setup Instructions

To run the Blackjack Game locally, 
1. Clone the repository and navigate to the root directory. Set up and activate a virtual environment if desired (python -m venv venv && source venv/bin/activate on Mac/Linux or venv\Scripts\activate on Windows).
2. Navigate to the backend folder (cd flask-server) and install dependencies with pip install Flask, then start the Flask server using python server.py or python3 server.py (it will run at http://localhost:5000).
3. In a new terminal, navigate to the frontend folder (cd client), install frontend dependencies with npm install, and start the React development server using npm start (it will run at http://localhost:3000). Make sure the frontend fetch requests are pointing to localhost:5000. Once both servers are running, open your browser and play the game at http://localhost:3000.
