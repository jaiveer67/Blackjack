from flask import Flask, jsonify, request, send_from_directory
from game import Game
from settings import save_settings, load_settings
from save import save_game_state, load_game_state, save_highscores, load_highscores, get_save_file, get_highscore_file, safe_user_id
import os, json

app = Flask(__name__, static_folder="client-build", static_url_path="")
games = {}  # Maps user_id to their Game instance

def get_or_load_game(user_id):
    if user_id not in games:
        # Load saved settings first
        settings = load_settings()
        deck_count = settings.get("deck_count", 6)
        dealer_hits_soft_17 = settings.get("dealer_hits_soft_17", False)
        
        # Create game using saved settings
        game = Game(deck_count=deck_count, dealer_hits_soft_17=dealer_hits_soft_17)
        
        try:
            load_game_state(game, user_id)
        except FileNotFoundError:
            pass
        games[user_id] = game
    return games[user_id]


@app.route("/start", methods=["POST"])
def start():
    data = request.get_json()
    user_id = safe_user_id(data.get("userId"))
    game = get_or_load_game(user_id)
    game.reset_round()
    result = []
    game_over = False
    display_value = 0

    show_insurance = game.dealer.hand[0].rank == "A" and game.player.money >= (game.player.current_bet // 2)

    player_blackjack = game.player.hand_value() == 21
    dealer_blackjack = game.dealer.hand[0].rank == "A" and game.dealer.hand_value() == 21

    if player_blackjack or dealer_blackjack:
        game_over = True
        display_value = 21 if player_blackjack else game.player.display_hand_value()
    else:
        display_value = game.player.display_hand_value()

    save_game_state(game, user_id)

    return jsonify({
        'playerHand': game.player_hand(),
        'dealerHand': game.dealer_hand(),
        'playerValue': game.player.hand_value(),
        'playerDisplayValue': display_value,
        'dealerValue': game.dealer.hand[0].value,
        'isGameOver': game_over,
        'result': result,
        'playerMoney': game.player.money,
        'currentBet': game.player.current_bet,
        'showInsurance': show_insurance
    })

@app.route("/bet/<int:amount>", methods=["POST"])
def place_bet(amount):
    data = request.get_json()
    user_id = safe_user_id(data.get("userId"))
    game = get_or_load_game(user_id)
    print(f"[{user_id}] money: {game.player.money}, bet: {amount}")


    if amount <= 0 or amount > game.player.money + 0.001:
        return jsonify({"error": "Invalid bet"}), 400

    game.player.current_bet = amount
    game.last_bet = amount
    game.player.money -= amount
    print(f"[{user_id}] money: {game.player.money}, bet: {amount}")


    return jsonify({
        "playerMoney": game.player.money,
        "currentBet": game.player.current_bet
    })

@app.route("/hit/<int:hand_number>", methods=['POST'])
def hit_split(hand_number):
    data = request.get_json()
    user_id = safe_user_id(data.get("userId"))
    game = get_or_load_game(user_id)

    if hand_number == 1:
        game.player_turn()
        return jsonify({
            'playerHand': game.player_hand(),
            'playerValue': game.player_value(),
            'playerDisplayValue': game.player.display_hand_value(),
            'isGameOver': (game.player.is_bust() or game.player_value() == 21),
            'playerMoney': game.player.money
        })
    elif hand_number == 2 and game.split_player:
        game.split_player.add_card(game.deck.draw_card())
        return jsonify({
            'playerHand': game.player2_hand(),
            'playerValue': game.player2_value(),
            'playerDisplayValue': game.split_player.display_hand_value(),
            'isGameOver': game.split_player.is_bust(),
            'playerMoney': game.player.money
        })
    return jsonify({'error': 'Invalid hand number'}), 400

@app.route("/stand", methods=['POST'])
def stand():
    data = request.get_json()
    user_id = safe_user_id(data.get("userId"))
    game = get_or_load_game(user_id)
    SAVE_FILE = get_save_file(user_id)

    is_blackjack = (
        len(game.player.hand) == 2 and 
        game.player.hand_value() == 21 and 
        not game.player.is_split_hand
    )

    if not is_blackjack and not game.player.is_bust():
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

        dealer_blackjack = game.dealer.hand_value() == 21 and len(game.dealer.hand) == 2
        insurance_taken = player.insurance_bet > 0
        if insurance_taken:
            if dealer_blackjack:
                game.player.money += player.insurance_bet * 3
                insurance_message = " Insurance paid out!"
            else:
                insurance_message = " Insurance lost."
            player.insurance_bet = 0
        else:
            insurance_message = ""

        if player.is_bust():
            return f"{prefix}You busted! Dealer wins.{insurance_message}"
        elif dealer_blackjack and not is_initial_blackjack:
            return f"{prefix}Dealer Blackjack. You lose.{insurance_message}"
        elif is_initial_blackjack:
            if dealer_blackjack:
                game.player.money += bet 
                return f"{prefix}Push! Both got Blackjack.{insurance_message}"
            else:
                game.player.money += bet * 2.5
                game.hands_won += 1
                return f"{prefix}BLACKJACK! YOU WIN!{insurance_message}"
        elif game.dealer.is_bust():
            game.player.money += bet * 2
            game.hands_won += 1
            return f"{prefix}Dealer busted! You win!{insurance_message}"
        elif player.hand_value() > game.dealer.hand_value():
            game.player.money += bet * 2
            game.hands_won += 1
            return f"{prefix}You win!{insurance_message}"
        elif player.hand_value() < game.dealer.hand_value():
            return f"{prefix}Dealer wins.{insurance_message}"
        else:
            game.player.money += bet
            return f"{prefix}Push!{insurance_message}"

    if game.split_player and game.split_player.hand:
        results.append(evaluate_hand(game.player, "Hand 1", game.player.current_bet))
        results.append(evaluate_hand(game.split_player, "Hand 2", game.split_player.current_bet))
    else:
        results.append(evaluate_hand(game.player))

    save_game_state(game, user_id)

    game.max_money = max(game.max_money, game.player.money)
    highscores = load_highscores(user_id)
    if game.max_money > highscores.get("max_balance", 2000):
        save_highscores(user_id, highscores.get("cashout", 2000), game.max_money)

    if game.player.money <= 0 and os.path.exists(SAVE_FILE):
        os.remove(SAVE_FILE)

    response = {
        'dealerHand': game.dealer_hand(),
        'dealerValue': game.dealer.hand_value(),
        'isGameOver': True,
        'results': results,
        'playerMoney': game.player.money,
        'playerValue': game.player_value(),
        'playerBlackjack': is_blackjack
    }

    if game.split_player and game.split_player.hand:
        response['playerValue2'] = game.split_player.hand_value()

    return jsonify(response)


@app.route("/double/<int:hand_number>", methods=["POST"])
def double(hand_number):
    data = request.get_json()
    user_id = safe_user_id(data.get("userId"))
    game = get_or_load_game(user_id)

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

@app.route("/split", methods=['POST'])
def split():
    data = request.get_json()
    user_id = safe_user_id(data.get("userId"))
    game = get_or_load_game(user_id)

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
 

@app.route("/reset", methods=["POST"])
def reset():
    data = request.get_json()
    user_id = safe_user_id(data.get("userId")) 

    save_file = get_save_file(user_id)
    if os.path.exists(save_file):
        os.remove(save_file)

    if user_id in games:
        del games[user_id]

    return jsonify({"message": "Game fully reset for user."})

@app.route("/cashout", methods=["POST"])
def cash_out():
    data = request.get_json()
    user_id = safe_user_id(data.get("userId"))
    game = get_or_load_game(user_id)
    SAVE_FILE = get_save_file(user_id)

    profit = game.player.money - 2000
    final = game.player.money
    highscores = load_highscores(user_id)
    old_cashout = highscores["cashout"]
    old_max = highscores["max_balance"]

    is_new_cashout = final > old_cashout
    is_new_max = game.max_money > old_max

    if final > 2000:
        save_highscores(user_id, final, game.max_money)

    if os.path.exists(SAVE_FILE):
        os.remove(SAVE_FILE)
    if user_id in games:
        del games[user_id]

    return jsonify({
        "finalMoney": game.player.money,
        "maxMoney": game.max_money,
        "handsWon": game.hands_won,
        "profit": profit,
        "isNewCashout": is_new_cashout,
        "isNewMax": is_new_max,
        "highCashout": max(final, old_cashout),
        "highMaxMoney": max(game.max_money, old_max)
    })

@app.route("/set-decks/<int:deck_count>", methods=["POST"])
def set_decks(deck_count):
    data = request.get_json()
    user_id = safe_user_id(data.get("userId"))
    game = get_or_load_game(user_id)
    dealer_hits_soft_17 = load_settings().get("dealer_hits_soft_17", False)
    save_settings(deck_count, dealer_hits_soft_17)
    game.set_rules(deck_count, dealer_hits_soft_17)
    return jsonify({"message": f"Deck count set to {deck_count}."})

@app.route("/has-save", methods=["POST"])
def has_save():
    data = request.get_json()
    user_id = safe_user_id(data.get("userId"))
    SAVE_FILE = get_save_file(user_id)
    return jsonify({"hasSave": os.path.exists(SAVE_FILE)})

@app.route("/load-game", methods=["POST"])
def load_game():
    data = request.get_json()
    user_id = safe_user_id(data.get("userId"))
    game = Game()
    try:
        load_game_state(game, user_id)
        games[user_id] = game
        return jsonify({
            "playerMoney": game.player.money,
            "isGameOver": False,
            "cardsDealt": True,
        })
    except FileNotFoundError:
        return jsonify({"error": "No saved game"}), 404
    
@app.route("/get-highscores", methods=["POST"])
def get_highscores():
    data = request.get_json()
    user_id = safe_user_id(data.get("userId"))
    highscores = load_highscores(user_id)
    return jsonify({
        "cashout": highscores.get("cashout", 2000),
        "max_balance": highscores.get("max_balance", 2000)
    })
       
@app.route("/set-options", methods=["POST"])
def set_options():
    data = request.get_json()
    user_id = safe_user_id(data.get("userId"))
    deck_count = data.get("deckCount", 6)
    dealer_hits_soft_17 = data.get("dealerHitsSoft17", False)

    save_settings(deck_count, dealer_hits_soft_17)
    game = get_or_load_game(user_id)
    game.set_rules(deck_count, dealer_hits_soft_17)

    return jsonify({"message": "Options updated."})

@app.route("/get-options", methods=["POST"])
def get_options():
    settings = load_settings()
    return jsonify({
        "deckCount": settings.get("deck_count", 6),
        "dealerHitsSoft17": settings.get("dealer_hits_soft_17", False)
    })

@app.route("/take-insurance", methods=["POST"])
def take_insurance():
    data = request.get_json()
    user_id = safe_user_id(data.get("userId"))
    game = get_or_load_game(user_id)

    if game.dealer.hand and game.dealer.hand[0].rank == "A":
        insurance_amount = game.player.current_bet // 2
        if game.player.money >= insurance_amount:
            game.player.money -= insurance_amount
            game.player.insurance_bet = insurance_amount
            return jsonify({
                "playerMoney": game.player.money,
                "insuranceBet": insurance_amount,
                "dealerValue": game.dealer.hand_value()
            })
    return jsonify({"error": "Insurance not available"}), 400

@app.route("/check-dealer-blackjack", methods=["POST"])
def check_dealer_blackjack():
    data = request.get_json()
    user_id = safe_user_id(data.get("userId"))
    game = get_or_load_game(user_id)
    dealer_value = game.dealer.hand_value()
    return jsonify({"dealerValue": dealer_value})


@app.route("/")
def serve_index():
    return send_from_directory(app.static_folder, "index.html")

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, "index.html")
    
if __name__ == "__main__":
    app.run(debug=True)