from flask import Flask, jsonify
from game import Game

app = Flask(__name__)

game = Game()

@app.route("/start", methods=["GET"])
def start():
    game.start()

    result = []
    game_over = False

    player_blackjack = game.player.hand_value() == 21
    dealer_blackjack = game.dealer.hand_value() == 21 and len(game.dealer.hand) == 2

    if player_blackjack:
        game_over = True
        if dealer_blackjack:
            result.append("Push")
        else:
            result.append("BLACKJACK! YOU WIN!")

    return jsonify({
        'playerHand': game.player_hand(),
        'dealerHand': game.dealer_hand(),
        'playerValue': game.player.hand_value(),
        'dealerValue': game.dealer.hand[0].value,
        'gameOver': game_over,
        'result': result
    })

@app.route("/hit", methods=['GET'])
def hit():
    game.player_turn()
    return jsonify({
        'playerHand': game.player_hand(),
        'gameOver': game.player.is_bust(),
        'playerValue': game.player.hand_value(),
    })

@app.route("/hit/<int:hand_number>", methods=['GET'])
def hit_split(hand_number):
    if hand_number == 1:
        game.player_turn()
        return jsonify({
            'playerHand': game.player_hand(),
            'playerValue': game.player_value(),
            'gameOver': game.player.is_bust()
        })
    elif hand_number == 2 and game.split_player:
        game.split_player.add_card(game.deck.draw_card())
        return jsonify({
            'playerHand': game.player2_hand(),
            'playerValue': game.player2_value(),
            'gameOver': game.split_player.is_bust()
        })
    return jsonify({'error': 'Invalid hand number'}), 400

@app.route("/stand", methods=['GET'])
def stand():
    game.dealer_turn()
    results = []

    def evaluate_hand(player, hand_label=None):
        prefix = f"{hand_label}: " if hand_label else ""
        if player.is_bust():
            return f"{prefix}You busted! Dealer wins."
        elif game.dealer.is_bust():
            return f"{prefix}Dealer busted! You win!"
        elif player.hand_value() == 21 and len(player.hand) == 2:
            if game.dealer.hand_value() == 21 and len(game.dealer.hand) == 2:
                return f"{prefix}Push! Both got Blackjack."
            else:
                return f"{prefix}BLACKJACK! YOU WIN!"
        elif player.hand_value() > game.dealer.hand_value():
            return f"{prefix}You win!"
        elif player.hand_value() < game.dealer.hand_value():
            return f"{prefix}Dealer wins."
        else:
            return f"{prefix}Push!"

    # If split, return two messages with labels
    if game.split_player and game.split_player.hand:
        results.append(evaluate_hand(game.player, "Hand 1"))
        results.append(evaluate_hand(game.split_player, "Hand 2"))
        return jsonify({
            'dealerHand': game.dealer_hand(),
            'dealerValue': game.dealer.hand_value(),
            'gameOver': True,
            'results': results
        })

    # If no split, just return single message without label
    results.append(evaluate_hand(game.player))
    return jsonify({
        'dealerHand': game.dealer_hand(),
        'dealerValue': game.dealer.hand_value(),
        'gameOver': True,
        'results': results
    })

@app.route("/split", methods=['GET'])
def split():
    game.split()
    return jsonify({
        'playerHand1': game.player_hand(),
        'playerHand2': game.player2_hand(),
        'playerValue1': game.player_value(),
        'playerValue2': game.player2_value()
    }) 

if __name__ == "__main__":
    app.run(debug=True)