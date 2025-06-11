import os
import json
from card import Card

SAVE_FILE = "savegame.json"

def save_game_state(game):
    data = {
        "money": game.player.money,
        "deck": [{"rank": card.rank, "suit": card.suit} for card in game.deck.cards],
        "hands_won": game.hands_won,
        "max_money": game.max_money
    }
    with open(SAVE_FILE, "w") as f:
        json.dump(data, f)


def load_game_state(game):
    if not os.path.exists(SAVE_FILE):
        raise FileNotFoundError("No saved game")

    with open(SAVE_FILE, "r") as f:
        data = json.load(f)

    game.player.money = data["money"]
    game.deck.cards = [Card(c["rank"], c["suit"]) for c in data["deck"]]
    game.hands_won = data.get("hands_won", 0)
    game.max_money = data.get("max_money", game.player.money)