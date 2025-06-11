from flask import Flask, jsonify
from game import Game
from deck import Deck
from settings import save_settings, load_settings
from save import save_game_state, load_game_state
import os

app = Flask(__name__)

game = Game()
SAVE_FILE = "savegame.json"

@app.route("/start", methods=["GET"])
def start():
    game.reset_round()

    # if game.player.money >= game.last_bet:
    #     game.player.current_bet = game.last_bet
    # else:
    #     game.player.current_bet = 0
    #     game.last_bet = 0

    result = []
    game_over = False

    player_blackjack = game.player.hand_value() == 21

    if player_blackjack:
        game_over = True

    return jsonify({
        'playerHand': game.player_hand(),
        'dealerHand': game.dealer_hand(),
        'playerValue': game.player.hand_value(),
        'playerDisplayValue': game.player.display_hand_value(),
        'dealerValue': game.dealer.hand[0].value,
        'gameOver': game_over,
        'result': result,
        'playerMoney': game.player.money,
        'currentBet': game.player.current_bet
    })

@app.route("/bet/<int:amount>", methods=["POST"])
def place_bet(amount):
    if amount <= 0 or amount > game.player.money + 0.001:
        return jsonify({"error": "Invalid bet"}), 400

    game.player.current_bet = amount
    game.last_bet = amount
    game.player.money -= amount

    return jsonify({
        "playerMoney": game.player.money,
        "currentBet": game.player.current_bet
    })

@app.route("/hit/<int:hand_number>", methods=['GET'])
def hit_split(hand_number):
    if hand_number == 1:
        game.player_turn()
        return jsonify({
            'playerHand': game.player_hand(),
            'playerValue': game.player_value(),
            'playerDisplayValue': game.player.display_hand_value(),
            'gameOver': (game.player.is_bust() or game.player_value() == 21),
            'playerMoney': game.player.money
        })
    elif hand_number == 2 and game.split_player:
        game.split_player.add_card(game.deck.draw_card())
        return jsonify({
            'playerHand': game.player2_hand(),
            'playerValue': game.player2_value(),
            'playerDisplayValue': game.split_player.display_hand_value(),
            'gameOver': game.split_player.is_bust(),
            'playerMoney': game.player.money
        })
    return jsonify({'error': 'Invalid hand number'}), 400

@app.route("/stand", methods=['GET'])
def stand():
    if not game.player.is_bust():
        game.dealer_turn()

    results = []

    def evaluate_hand(player, hand_label=None, bet_amount=None):
        prefix = f"{hand_label}: " if hand_label else ""
        bet = bet_amount or player.current_bet
        is_initial_blackjack = (
            len(player.hand) == 2 and
            player.hand_value() == 21 and
            not getattr(player, "is_split_hand", True)
        )
        if player.is_bust():
            return f"{prefix}You busted! Dealer wins."
        elif game.dealer.hand_value() == 21 and len(game.dealer.hand) == 2 and not is_initial_blackjack:
            return f"{prefix}Dealer Blackjack. You lose."
        elif game.dealer.is_bust():
            game.player.money += bet * 2
            game.hands_won += 1
            return f"{prefix}Dealer busted! You win!"
        elif is_initial_blackjack:
            if game.dealer.hand_value() == 21 and len(game.dealer.hand) == 2:
                game.player.money += bet  # Return original bet on push
                return f"{prefix}Push! Both got Blackjack."
            else:
                game.player.money += bet * 2.5
                game.hands_won += 1
                return f"{prefix}BLACKJACK! YOU WIN!"
        elif player.hand_value() > game.dealer.hand_value():
            game.player.money += bet * 2
            game.hands_won += 1
            return f"{prefix}You win!"
        elif player.hand_value() < game.dealer.hand_value():
            return f"{prefix}Dealer wins."
        else:
            game.player.money += bet
            return f"{prefix}Push!"
    if game.split_player and game.split_player.hand:
        results.append(evaluate_hand(game.player, "Hand 1", game.player.current_bet))
        results.append(evaluate_hand(game.split_player, "Hand 2", game.split_player.current_bet))
    else:
        results.append(evaluate_hand(game.player))
    save_game_state(game)
    if game.player.money <= 0 and os.path.exists(SAVE_FILE):
        os.remove(SAVE_FILE)
    return jsonify({
        'dealerHand': game.dealer_hand(),
        'dealerValue': game.dealer.hand_value(),
        'gameOver': True,
        'results': results,
        'playerMoney': game.player.money
    })

@app.route("/double/<int:hand_number>", methods=["POST"])
def double(hand_number):
    if hand_number == 1:
        player = game.player
        get_hand = game.player_hand 
    elif hand_number == 2 and game.split_player:
        player = game.split_player
        get_hand = game.player2_hand
    else:
        return jsonify({'error': 'Invalid hand'}), 400

    if game.player.money >= player.current_bet:
        game.player.money -= player.current_bet
        player.current_bet *= 2
        player.add_card(game.deck.draw_card())

        return jsonify({
            'playerHand': get_hand(),
            'playerValue': player.hand_value(),
            'playerDisplayValue': player.display_hand_value(),
            'playerMoney': game.player.money
        })
    else:
        return jsonify({'error': 'Not enough money to double'}), 400


@app.route("/split", methods=['GET'])
def split():
    game.split()
    return jsonify({
        'playerHand1': game.player_hand(),
        'playerHand2': game.player2_hand(),
        'playerValue1': game.player_value(),
        'playerDisplayValue': game.player.display_hand_value(),
        'playerValue2': game.player2_value(),
        'playerDisplayValue2': game.split_player.display_hand_value(),
        'playerMoney': game.player.money
    }) 

@app.route("/gameOver", methods=['GET'])
def gameOver():
    results = []
    player_blackjack = game.player.hand_value() == 21
    dealer_blackjack = game.dealer.hand_value() == 21

    if player_blackjack:
        if dealer_blackjack:
            results.append("Push")
            game.player.money += game.player.current_bet
        else:
            results.append("BLACKJACK! YOU WIN!")
            game.hands_won += 1
            game.player.money += int(game.player.current_bet * 2.5)

    return jsonify({
        'playerMoney': game.player.money,
        'dealerValue': game.dealer.hand_value(),
        'results': results
    }) 

@app.route("/reset", methods=["POST"])
def reset():
    global game
    game = Game()
    return jsonify({"message": "Game fully reset."})

@app.route("/cashout", methods=["GET"])
def cash_out():
    profit = game.player.money - 2000
    if os.path.exists(SAVE_FILE):
        os.remove(SAVE_FILE)
    return jsonify({
        "finalMoney": game.player.money,
        "maxMoney": game.max_money,
        "handsWon": game.hands_won,
        "profit": profit
    })

@app.route("/get-deck-count", methods=["GET"])
def get_deck_count():
    deck_count = load_settings()
    return jsonify({"deckCount": deck_count})

@app.route("/set-decks/<int:deck_count>", methods=["POST"])
def set_decks(deck_count):
    save_settings(deck_count)
    return jsonify({"message": f"Deck count set to {deck_count}."})

@app.route("/has-save", methods=["GET"])
def has_save():
    return jsonify({"hasSave": os.path.exists(SAVE_FILE)})

@app.route("/load-game", methods=["POST"])
def load_game():
    try:
        load_game_state(game)
        return jsonify({
            "playerMoney": game.player.money,
            "gameOver": False,
            "cardsDealt": True,
        })
    except FileNotFoundError:
        return jsonify({"error": "No saved game"}), 404
    
if __name__ == "__main__":
    app.run(debug=True)