import re, os, json
from card import Card

def safe_user_id(user_id):
    return re.sub(r'[^a-zA-Z0-9_\-]', '', user_id or "")

def get_save_file(user_id):
    os.makedirs("saves", exist_ok=True)
    return f"saves/{user_id}_savegame.json"

def get_highscore_file(user_id):
    os.makedirs("saves", exist_ok=True)
    return f"saves/{user_id}_highscore.json"

def save_game_state(game, user_id):
    data = {
        "money": game.player.money,
        "deck": [{"rank": card.rank, "suit": card.suit} for card in game.deck.cards],
        "hands_won": game.hands_won,
        "max_money": game.max_money
    }
    with open(get_save_file(user_id), "w") as f:
        json.dump(data, f)

def load_game_state(game, user_id):
    path = get_save_file(user_id)
    if not os.path.exists(path):
        raise FileNotFoundError("No saved game")
    with open(path, "r") as f:
        data = json.load(f)
    game.player.money = data["money"]
    game.deck.cards = [Card(c["rank"], c["suit"]) for c in data["deck"]]
    game.hands_won = data.get("hands_won", 0)
    game.max_money = data.get("max_money", game.player.money)

def load_highscores(user_id):
    path = get_highscore_file(user_id)
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {"cashout": 0, "max_balance": 0}

def save_highscores(user_id, cashout, max_balance):
    highscores = load_highscores(user_id)
    highscores["cashout"] = max(highscores.get("cashout", 2000), cashout)
    highscores["max_balance"] = max(highscores.get("max_balance", 2000), max_balance)
    with open(get_highscore_file(user_id), "w") as f:
        json.dump(highscores, f)
